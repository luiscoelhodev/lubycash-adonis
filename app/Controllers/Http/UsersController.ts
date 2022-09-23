import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { formatZipCode } from 'App/Helpers/FormatZipCode'
import Address from 'App/Models/Address'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import { UserStoreValidator, UserUpdateValidator } from 'App/Validators/UserValidator'
import axios, { AxiosResponse } from 'axios'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    let allUsers: User[]
    try {
      allUsers = await User.all()
    } catch (error) {
      return response.badRequest({ message: 'Error in retrieving all users!', error: error.message })
    }
    return response.ok({ allUsers })
  }

  public async store({ request, response }: HttpContextContract) {
    await request.validate(UserStoreValidator)
    const userBody = request.only(['name', 'cpf', 'phone', 'email', 'password'])
    const addressBody = request.only(['address', 'city', 'state', 'zip_code', 'complement'])
    addressBody.state = addressBody.state.toUpperCase()
    addressBody.zip_code = formatZipCode(addressBody.zip_code)

    const newUser = new User()
    const userTransaction = await Database.transaction()

    try {
      newUser.fill(userBody)
      newUser.useTransaction(userTransaction)
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

  public async show({ params, response }: HttpContextContract) {
    const userSecureId = params.id
    let userFound: User

    try {
      userFound = await User.query().where('secure_id', userSecureId).preload('addresses').firstOrFail()  
    } catch (error) {
      return response.notFound({ message: 'Error in finding user.', error: error.message })
    }
    return response.ok({ userFound })
  }

  public async userUpdate({ auth, request, response }: HttpContextContract) {
    await request.validate(UserUpdateValidator)
    const userBody = request.only(['name', 'cpf', 'phone', 'email', 'password'])
    const addressBody = request.only(['address', 'city', 'state', 'zip_code', 'complement'])
    if (addressBody.state) addressBody.state = addressBody.state.toUpperCase()
    if (addressBody.zip_code) addressBody.zip_code = formatZipCode(addressBody.zip_code)

    let userToBeUpdated: User
    const userUpdateTransaction = await Database.transaction()

    try {
      userToBeUpdated = await User.findOrFail(auth.user!.id)
    } catch (error) {
      return response.notFound({ message: `User not found.`, error: error.message })
    }
    
    try {
      userToBeUpdated.merge(userBody)
      userToBeUpdated.useTransaction(userUpdateTransaction)
      await userToBeUpdated.save()
    } catch (error) {
      await userUpdateTransaction.rollback()
      return response.badRequest({ message: 'Error in updating user.', error: error.message })
    }

    try {
      const usersAddress = await Address.query().where('user_id', userToBeUpdated.id).firstOrFail()
      usersAddress.useTransaction(userUpdateTransaction)
      usersAddress.merge(addressBody)
      await usersAddress.save()
    } catch (error) {
      await userUpdateTransaction.rollback()
      return response.badRequest({ message: `Error in updating user's address.`, error: error.message })
    }

    await userUpdateTransaction.commit()

    let userFoundAfterBeingUpdated: User
    try {
      userFoundAfterBeingUpdated = await User.query().where('id', userToBeUpdated.id).preload('addresses').firstOrFail()
    } catch (error) {
      return response.notFound({ message: `Error in finding user after update.`, error: error.message })
    }
    return response.ok({ userFoundAfterBeingUpdated })
  }

  public async adminUpdate({ params, request, response }: HttpContextContract) {
    await request.validate(UserUpdateValidator)
    const userSecureId = params.id
    const userBody = request.only(['name', 'cpf', 'phone', 'email', 'password'])
    const addressBody = request.only(['address', 'city', 'state', 'zip_code', 'complement'])
    if (addressBody.state) addressBody.state = addressBody.state.toUpperCase()
    if (addressBody.zip_code) addressBody.zip_code = formatZipCode(addressBody.zip_code)

    let userToBeUpdated: User
    const userUpdateTransaction = await Database.transaction()

    try {
      userToBeUpdated = await User.query().where('secure_id', userSecureId).firstOrFail()
    } catch (error) {
      return response.notFound({ message: 'User not found.', error: error.message })
    }

    try {
      userToBeUpdated.useTransaction(userUpdateTransaction)
      userToBeUpdated.merge(userBody)
      await userToBeUpdated.save()
    } catch (error) {
      await userUpdateTransaction.rollback()
      return response.badRequest({ message: 'Error in updating this user.', error: error.message })
    }

    try {
      const usersAddress = await Address.query().where('user_id', userToBeUpdated.id).firstOrFail()
      usersAddress.useTransaction(userUpdateTransaction)
      usersAddress.merge(addressBody)
      await usersAddress.save()
    } catch (error) {
      await userUpdateTransaction.rollback()
      return response.badRequest({ message: `Error in updating user's address.`, error: error.message })
    }

    await userUpdateTransaction.commit()

    let userFoundAfterBeingUpdated: User
    try {
      userFoundAfterBeingUpdated = await User.query().where('id', userToBeUpdated.id).preload('addresses').firstOrFail()
    } catch (error) {
      return response.notFound({ message: `Error in finding user after update.`, error: error.message })
    }
    return response.ok({ userFoundAfterBeingUpdated })
  }

  public async userDestroy({ auth, response }: HttpContextContract) {
    try {
      await User.query().where('id', auth.user!.id).delete()
    } catch (error) {
      return response.notFound({ message: `Error in finding this user to be deleted!`, error: error.message })
    }
    return response.ok({ message: 'User was successfully deleted!' })
  }

  public async adminDestroy({ params, response }: HttpContextContract) {
    let userToBeDeleted: User

    try {
      userToBeDeleted = await User.query().where('secure_id', params.id).firstOrFail()
    } catch (error) {
      return response.notFound({ message: 'User not found.', error: error.message })
    }

    try {
      userToBeDeleted.delete()
    } catch (error) {
      return response.badRequest({ message: 'Error in deleting user.', error: error.message })
    }

    return response.ok({ message: 'User was successfully deleted!' })
  }

  public async retrievesUsersInfo({ auth, response }: HttpContextContract) {
    let userFound: User

    try {
      userFound = await User.query().where('id', auth.user!.id).preload('addresses').firstOrFail()
    } catch (error) {
      return response.badRequest({ message: 'Error in retrieving your info.', error: error.message })
    }
    
    return response.ok({ userFound })
  }

  public async sendUserRequestToBecomeACustomer({ auth, request, response }: HttpContextContract) {
    const { average_salary } = request.all()
    const dataToBeSentInAxiosRequestBody = { average_salary: average_salary, cpf_number: auth.user!.cpf }
    let axiosRequestToMsBanking: AxiosResponse

    try {
      axiosRequestToMsBanking = await axios({
        method: 'post',
        url: 'http://localhost:3000/customers/become-a-customer',
        data: dataToBeSentInAxiosRequestBody })
    } catch (error) {
      if (error.message.endsWith('406')) {
        return response.badRequest({ message: `You can't send more than one request to become a customer!` })
      }
      return response.badRequest({ message: 'Error in axios request to ms-banking', error: error })
    }

    switch (axiosRequestToMsBanking.data.customerFound.status) {
      case 'Accepted': 
        try {
          const customerRole = await Role.findOrFail(2)
          if (customerRole) {
            const userToBecomeCustomer = await User.findOrFail(auth.user!.id)
            await userToBecomeCustomer.related('roles').sync([customerRole.id], true)
          }
          return response.ok({ message: 'User is now a customer! (:' })
        } catch (error) {
          return response.badRequest({ message: `Error in updating user's role.`, error: error.message })
        }
      case 'Rejected':
        return response.badRequest({ message: `You couldn't be accepted as a customer.` })
    }
  }
}
