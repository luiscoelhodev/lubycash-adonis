import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import axios, { AxiosResponse } from 'axios'

export default class CustomersController {
  public async listAllCustomers({ request, response }: HttpContextContract) {
    const { status, from, to } = request.all()

    let axiosRequestToListAllCustomers: AxiosResponse
    try {
      axiosRequestToListAllCustomers = await axios({
        method: 'GET',
        url: 'http://localhost:3000/customers/all',
        data: { status: status, from: from, to: to }
      })
    } catch (error) {
      return response.badRequest({ message: 'Error in axios request.', error: error.message })
    }
    const customers = axiosRequestToListAllCustomers.data.customers
    return response.ok({ customers })
  }
}
