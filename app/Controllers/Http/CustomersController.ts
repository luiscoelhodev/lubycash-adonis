import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { GetCustomerBankStatementErrorsEnum, TransferErrorsEnum } from 'App/Helpers/ErrorsEnums'
import User from 'App/Models/User'
import { MakeTransferValidator } from 'App/Validators/UserValidator'
import axios, { AxiosResponse } from 'axios'
import { DateTime } from 'luxon'

export default class CustomersController {
  public async listAllCustomers({ request, response }: HttpContextContract) {
    const { from, to } = request.qs()
    const fromDateTime = DateTime.fromSQL(from).toJSDate()
    const toDateTime = DateTime.fromSQL(to).toJSDate()
    let allUsers: User[]
    try {
      allUsers = await User.query().preload('roles')
    } catch (error) {
      return response.badRequest({ message: 'Error in retrieving users from DB.', error: error.message })
    }
    let users: any[] = []
    
    allUsers.forEach((user) => {
      user.roles.forEach((role) => {
        if (role.type === 'customer' && user.name !== 'Customer') {
          const { id, secureId, name, cpf, phone, email, createdAt, updatedAt } = user
          users.push({ id, secureId, name, cpf, phone, email, createdAt, updatedAt })
        }
      })
    })

    if (from && to) {
      if (from.match(/^(\d{4})-(\d{2})-(\d{2})$/) === null) {
        return response.status(422).send({ error: 'Validation error: invalid date format (from). Date format should be: YYYY-MM-DD'})
      }
      if (to.match(/^(\d{4})-(\d{2})-(\d{2})$/) === null) {
        return response.status(422).send({ error: 'Validation error: invalid date format (to). Date format should be: YYYY-MM-DD'})
      }
      users = users.filter((user) => {
        return user.createdAt >= fromDateTime && user.createdAt <= toDateTime
      })
    }
    
    if (from && !to || !from && to) {
      return response.status(422).send({error: 'Validation error: when filtering by date, make sure to provide BOTH from AND to dates!'})
    }

    return response.ok({ users })
  }

  public async getCustomerBankStatement({ params, request, response }: HttpContextContract) {
    const customerCPF = params.cpf
    const { from, to } = request.qs()
    if (from && to) {
      if (from.match(/^(\d{4})-(\d{2})-(\d{2})$/) === null) {
        return response.status(422).send({ error: 'Validation error: invalid date format (from). Date format should be: YYYY-MM-DD'})
      }
      if (to.match(/^(\d{4})-(\d{2})-(\d{2})$/) === null) {
        return response.status(422).send({ error: 'Validation error: invalid date format (to). Date format should be: YYYY-MM-DD'})
      }
    }

    if (from && !to || !from && to) {
      return response.status(422).send({error: 'Validation error: when filtering by date, make sure to provide BOTH from AND to dates!'})
    }

    let axiosRequestToGetCustomerBankStatement: AxiosResponse
    try {
      axiosRequestToGetCustomerBankStatement = await axios({
        method: 'GET',
        url: `${process.env.MS_BANKING_URL || 'http://localhost:3000'}/customers/bank-statement/${customerCPF}`,
        params: { from, to },
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
    const { amount, message, receiverCPF } = await request.validate(MakeTransferValidator)
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
