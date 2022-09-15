import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Role from 'App/Models/Role'
import User from 'App/Models/User'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    return response.ok({ message: `Indexes users.`})
  }

  public async store({ request, response }: HttpContextContract) {
    const userBody = request.only(['name', 'cpf', 'phone', 'email', 'password'])
    const addressBody = request.only(['address', 'city', 'state', 'zip_code', 'complement'])

    const newUser = new User()
    const userTransaction = await Database.transaction()

    try {
      newUser.useTransaction(userTransaction)
      newUser.fill(userBody)
      await newUser.save()

      const userRole = await Role.findByOrFail('type', 'user')
      if (userRole) await newUser.related('roles').attach([userRole.id])
    } catch (error) {
      await userTransaction.rollback()
      return response.badRequest({ 
        message: `Error in creating this user.`, 
        error: error.message })
    }

    try {
      await newUser.related('addresses').create(addressBody)
    } catch (error) {
      await userTransaction.rollback()
      return response.badRequest({ 
        message: `Error in creating user's address.`, 
        error: error.message })
    }

    await userTransaction.commit()

    let userFound

    try {
      userFound = await User.findByOrFail('email', newUser.email)
    } catch (error) {
      return response.notFound({
        message: `Error in finding this user created.`,
        error: error.message,
      })
    }

    return response.created({ userFound })
  }

  public async show({ response }: HttpContextContract) {
    return response.ok({ message: `Shows a user.`})
  }

  public async update({ response }: HttpContextContract) {
    return response.ok({ message: `Updates a user.`})
  }

  public async destroy({ response }: HttpContextContract) {
    return response.ok({ message: `Deletes a user.`})
  }
}
