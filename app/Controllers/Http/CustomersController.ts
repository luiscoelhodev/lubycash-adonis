import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { GetCustomerBankStatementErrorsEnum, ListAllCustomersErrorsEnum, TransferErrorsEnum } from 'App/Helpers/ErrorsEnums'
import axios, { AxiosResponse } from 'axios'

export default class CustomersController {
  public async listAllCustomers({ request, response }: HttpContextContract) {
    const { status, from, to } = request.all()

    let axiosRequestToListAllCustomers: AxiosResponse
    try {
      axiosRequestToListAllCustomers = await axios({
        method: 'GET',
        url: 'http://localhost:3000/customers/all',
        data: { status, from, to }
      })
      switch (axiosRequestToListAllCustomers.data.error) {
        case ListAllCustomersErrorsEnum.validation:
          return response.status(422).send({ error: ListAllCustomersErrorsEnum.validation })
        case ListAllCustomersErrorsEnum.dbSelect:
          return response.badRequest({ error: ListAllCustomersErrorsEnum.dbSelect })
        default:
          break
      }
    } catch (error) {
      return response.badRequest({ message: 'Error in axios request to ms-banking', error: error.message })
    }
    const customers = axiosRequestToListAllCustomers.data.customers
    return response.ok({ customers })
  }

  public async getCustomerBankStatement({ params, request, response }: HttpContextContract) {
    const customerCPF = params.cpf
    const { from, to } = request.all()

    let axiosRequestToGetCustomerBankStatement: AxiosResponse
    try {
      axiosRequestToGetCustomerBankStatement = await axios({
        method: 'GET',
        url: `http://localhost:3000/customers/bank-statement/${customerCPF}`,
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
        url: 'http://localhost:3000/transfers/make',
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
