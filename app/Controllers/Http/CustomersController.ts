import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TransferErrors } from 'App/Helpers/ErrorsEnums'
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
    } catch (error) {
      return response.badRequest({ message: 'Error in axios request.', error: error.message })
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
    } catch (error) {
      return response.badRequest({ message: 'Error in axios request.', error: error.message })
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
        case TransferErrors.equalCpfs:
          return response.badRequest({ error: TransferErrors.equalCpfs })
        case TransferErrors.validation:
          return response.badRequest({ error: TransferErrors.validation })
        case TransferErrors.senderNotFound:
          return response.badRequest({ error: TransferErrors.senderNotFound })
        case TransferErrors.receiverNotFound:
          return response.badRequest({ error: TransferErrors.receiverNotFound })
        case TransferErrors.notEnoughMoney:
          return response.badRequest({ error: TransferErrors.notEnoughMoney })
        case TransferErrors.dbInsertion:
          return response.badRequest({ error: TransferErrors.dbInsertion })
        default:
          break
      }
    } catch (error) {
      return response.badRequest({ message: 'Error in axios request.', error: error })
    }
    return response.ok({ message: 'Transfer completed successfully!' })
  }
}
