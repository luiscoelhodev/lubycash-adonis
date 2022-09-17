import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import { LoginValidator } from 'App/Validators/AuthValidator'
import Role from 'App/Models/Role'

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
}