import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import { GetResetPassTokenValidator, LoginValidator, ResetPasswordValidator } from 'App/Validators/AuthValidator'
import Role from 'App/Models/Role'
import { lubycashProducer } from 'App/Kafka/kafkaProducer'
import ResetPassToken from 'App/Models/ResetPassToken'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    const { email, password } = await request.validate(LoginValidator)
    const user = await User.query().where('email', email).preload('roles').first()

    try {
      const token = await auth.use('api').attempt(email, password, {
        name: user?.name,
        expiresIn: Env.get('NODE_ENV') === 'development' ? '' : '30mins',
      })
      return { token, user }
    } catch (error) {
      return response.unauthorized({ message: 'Invalid credentials', error })
    }
  }
  public async addAdminPermissionToUser({ params, response }: HttpContextContract) {
    const userSecureId = params.id
    let userFound: User

    try {
      userFound = await User.query().where('secure_id', userSecureId).preload('roles').firstOrFail()
      const userIsAlreadyAnAdmin = userFound.roles.some((role) => {
        return role.type === 'admin'
      })
      if (userIsAlreadyAnAdmin === true) {
        return response.badRequest({ error: 'This user is already an admin!' })
      }
    } catch (error) {
      return response.notFound({ message: `Couldn't find this user!`, error: error.message })
    }

    let adminRole: Role
    try {
      adminRole = await Role.findByOrFail('type', 'admin')
      await userFound.related('roles').sync([adminRole.id], false) // the 'false' argument keeps the other roles, without detaching them
    } catch (error) {
      return response.badRequest({ message: 'Error in finding admin role and binding it to this user.', error: error.message})
    }

    try {
      const userNowAsAdmin = await User.query().where('secure_id', userSecureId).preload('roles').firstOrFail()
      return response.ok({ userNowAsAdmin })
    } catch (error) {
      return response.notFound({ message: `Couldn't find user after changing role to admin. `, error: error.message})
    }
  }
  public async removeAdminPermissionFromUser({ params, response }: HttpContextContract) {
    const userSecureId = params.id
    let userFound: User

    try {
      userFound = await User.query().where('secure_id', userSecureId).preload('roles').firstOrFail()
      const userIsAnAdmin = userFound.roles.some((role) => {
        return role.type === 'admin'
      })
      if (userIsAnAdmin === false) {
        return response.badRequest({ error: 'This user is not an admin to have this permission removed.' })
      }
    } catch (error) {
      return response.notFound({ message: `Couldn't find this user!`, error: error.message })
    }

    let adminRole: Role
    try {
      adminRole = await Role.findByOrFail('type', 'admin')
      await userFound.related('roles').detach([adminRole.id])
    } catch (error) {
      return response.badRequest({ message: 'Error in finding admin role and removing it from this user.', error: error.message})
    }

    try {
      const userNotAnAdminAnymore = await User.query().where('secure_id', userSecureId).preload('roles').firstOrFail()
      return response.ok({ userNotAnAdminAnymore })
    } catch (error) {
      return response.notFound({ message: `Couldn't find user after removing admin role. `, error: error.message})
    }
  }
  public async addBasicUserPermissionToUser({ params, response }: HttpContextContract) {
    const userSecureId = params.id
    let userFound: User

    try {
      userFound = await User.query().where('secure_id', userSecureId).preload('roles').firstOrFail()
      const userIsAlreadyABasicUser = userFound.roles.some((role) => {
        return role.type === 'user'
      })
      if (userIsAlreadyABasicUser === true) {
        return response.badRequest({ error: 'This user is already a basic user!' })
      }
    } catch (error) {
      return response.notFound({ message: `Couldn't find this user!`, error: error.message })
    }

    let userRole: Role
    try {
      userRole = await Role.findByOrFail('type', 'user')
      await userFound.related('roles').sync([userRole.id], false) // the 'false' argument keeps the other roles, without detaching them
    } catch (error) {
      return response.badRequest({ message: 'Error in finding user role and binding it to this user.', error: error.message})
    }

    try {
      const userNowAsABasicUser = await User.query().where('secure_id', userSecureId).preload('roles').firstOrFail()
      return response.ok({ userNowAsABasicUser })
    } catch (error) {
      return response.notFound({ message: `Couldn't find user after changing role to user. `, error: error.message})
    }
  }
  public async removeBasicUserPermissionFromUser({ params, response }: HttpContextContract) {
    const userSecureId = params.id
    let userFound: User

    try {
      userFound = await User.query().where('secure_id', userSecureId).preload('roles').firstOrFail()
      const userIsABasicUser = userFound.roles.some((role) => {
        return role.type === 'user'
      })
      if (userIsABasicUser === false) {
        return response.badRequest({ error: `This user is not a basic user to have this permission removed.` })
      }
    } catch (error) {
      return response.notFound({ message: `Couldn't find this user!`, error: error.message })
    }

    let userRole: Role
    try {
      userRole = await Role.findByOrFail('type', 'user')
      await userFound.related('roles').detach([userRole.id])
    } catch (error) {
      return response.badRequest({ message: 'Error in finding user role and removing it from this user.', error: error.message})
    }

    try {
      const userNotABasicUser = await User.query().where('secure_id', userSecureId).preload('roles').firstOrFail()
      return response.ok({ userNotABasicUser })
    } catch (error) {
      return response.notFound({ message: `Couldn't find user after removing user role. `, error: error.message})
    }
  }
  public async generateNewPassTokenAndSendItWithProducer({ request, response }: HttpContextContract) {
    const { email } = await request.validate(GetResetPassTokenValidator)

    const newToken = new ResetPassToken()
    const tokenTransaction = await Database.transaction()
    let userFound: User

    try {
      userFound = await User.findByOrFail('email', email)
    } catch (error) {
      return response.badRequest({
        message: 'Error in finding an user with this email.',
        error: error.message,
      })
    }

    try {
      newToken.fill({ email })
      newToken.useTransaction(tokenTransaction)
      await newToken.save()
    } catch (error) {
      await tokenTransaction.rollback()
      return response.badRequest({ message: 'Error in generating token.', error: error.message })
    }

    await tokenTransaction.commit()

    let tokenFound: ResetPassToken

    try {
      tokenFound = await ResetPassToken.query()
        .where('email', newToken.email)
        .orderBy('id', 'desc')
        .firstOrFail()
    } catch (error) {
      return response.badRequest({ message: 'Error in finding new token.', error: error.message })
    }

    try {
      await lubycashProducer({ user: userFound, token: tokenFound.token })
    } catch (error) {
      return response.badRequest({ message: `Error in sending token to user's email address.`, error: error.message })
    }

    return response.ok({ message: 'Your token was sent to your email!' })
  }
  public async resetPassword({ request, response }: HttpContextContract) {
    const { token, newPassword } = await request.validate(ResetPasswordValidator)
    const nowMinus30Mins = DateTime.now()
      .setZone('America/Sao_Paulo')
      .setLocale('pt-br')
      .minus({ minutes: 30 })
      .toSQL()

    let tokenFound: ResetPassToken
    try {
      tokenFound = await ResetPassToken.findByOrFail('token', token)
    } catch (error) {
      return response.badRequest({ message: 'Error in finding this token.', error: error.message })
    }

    if (tokenFound.createdAt.toSQL() <= nowMinus30Mins) {
      return response.badRequest({ error: `Your token has already expired!` })
    }

    if (!!tokenFound.used === true) {
      return response.forbidden({ error: `This token has already been used!` })
    }
    
    let userFound = await User.findByOrFail('email', tokenFound.email)
    const resetPassTransaction = await Database.transaction()

    try {
      userFound.useTransaction(resetPassTransaction)
      tokenFound.useTransaction(resetPassTransaction)

      userFound.password = newPassword
      tokenFound.used = true

      await userFound.save()
      await tokenFound.save()
    } catch (error) {
      await resetPassTransaction.rollback()
      return response.badRequest({ message: `Error in reseting password.`, error: error.message })
    }

    await resetPassTransaction.commit()
    return response.ok({ message: `Your password was reset! Please, log in.` })
  }
}