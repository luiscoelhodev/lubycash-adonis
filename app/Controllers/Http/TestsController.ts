import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class TestsController {

  public async checksDBConnection({ response }: HttpContextContract) {
    await Database.report().then((health) => {
      if (health.health.healthy === true) {
        return response.ok({ message: `Awesome! Connection is healthy (:` })
      }
      return response.status(500).json({ message: `Connection is not healthy :(` })
    })
  }

  public async checksIfUserIsAdmin({ response }: HttpContextContract) {
    return response.ok({ message: 'Hello, admin user!' })
  }

  public async checksIfUserIsCustomer({ response }: HttpContextContract) {
    return response.ok({ message: 'Hello, customer user!' })
  }

  public async checksIfUserIsBasic({ response }: HttpContextContract) {
    return response.ok({ message: 'Hello, user!' })
  }
}
