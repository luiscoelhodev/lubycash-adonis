import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { GetCustomerBankStatementErrorsEnum, ListAllCustomersErrorsEnum, TransferErrorsEnum } from 'App/Helpers/ErrorsEnums'
import User from 'App/Models/User'
import axios, { AxiosResponse } from 'axios'

export default class CustomersController {
  public async listAllCustomers({ response }: HttpContextContract) {
    let allUsers: User[]
    try {
      allUsers = await User.query().preload('roles')
    } catch (error) {
      return response.badRequest({ message: 'Error in retrieving users from DB.', error: error.message })
    }
    const users: any = []
    
    allUsers.forEach((user) => {
      user.roles.forEach((role) => {
        if (role.type === 'customer' && user.name !== 'Customer') {
          const { id, secureId, name, cpf, phone, email, createdAt, updatedAt } = user
          users.push({ id, secureId, name, cpf, phone, email, createdAt, updatedAt })
        }
      })
    })
    return response.ok({ users })
  }

  public async getCustomerBankStatement({ params, request, response }: HttpContextContract) {
    const customerCPF = params.cpf
    const { from, to } = request.all()

    let axiosRequestToGetCustomerBankStatement: AxiosResponse
    try {
      axiosRequestToGetCustomerBankStatement = await axios({
        method: 'GET',
        url: `${process.env.MS_BANKING_URL || 'http://localhost:3000'}/customers/bank-statement/${customerCPF}`,
        data: { from, to }
      })
      switch (axiosRequestToGetCustomerBankStatement.data.error) {
        case GetCustomerBankStatementErrorsEnum.validation:
          return response.status(422).send({ error: GetCustomerBankStatementErrorsEnum.validation })
        case GetCustomerBankStatementErrorsEnum.notFound:
          return response.notFound({ error: GetCustomerBankStatementErrorsEnum.notFound })
        case GetCustomerBankStatementErrorsEnum.dbSelect:
          return response.badRequest({ error: GetCustomerBankStatementErrorsEnum.dbSelect })
        default:
          break
      }
    } catch (error) {
      return response.badRequest({ message: 'Error in axios request to ms-banking.', error: error.message })
    }
    const transfers = axiosRequestToGetCustomerBankStatement.data.transfers
    return response.ok({ transfers }) 
  }

  public async makeTransfer({ auth, request, response }: HttpContextContract) {
    const { amount, message, receiverCPF } = request.all()
    const senderCPF = auth.user!.cpf

    let axiosRequestToMakeATransfer: AxiosResponse

    try {
      axiosRequestToMakeATransfer = await axios({
        method: 'POST',
        url: `${process.env.MS_BANKING_URL || 'http://localhost:3000'}/transfers/make`,
        data: { amount, message, receiverCPF, senderCPF }
      })
      
      switch(axiosRequestToMakeATransfer.data.error) {
        case TransferErrorsEnum.equalCpfs:
          return response.badRequest({ error: TransferErrorsEnum.equalCpfs })
        case TransferErrorsEnum.validation:
          return response.badRequest({ error: TransferErrorsEnum.validation })
        case TransferErrorsEnum.senderNotFound:
          return response.badRequest({ error: TransferErrorsEnum.senderNotFound })
        case TransferErrorsEnum.receiverNotFound:
          return response.badRequest({ error: TransferErrorsEnum.receiverNotFound })
        case TransferErrorsEnum.notEnoughMoney:
          return response.badRequest({ error: TransferErrorsEnum.notEnoughMoney })
        case TransferErrorsEnum.dbInsertion:
          return response.badRequest({ error: TransferErrorsEnum.dbInsertion })
        default:
          break
      }
    } catch (error) {
      return response.badRequest({ message: 'Error in axios request to ms-banking.', error: error })
    }
    return response.ok({ message: 'Transfer completed successfully!' })
  }
}
