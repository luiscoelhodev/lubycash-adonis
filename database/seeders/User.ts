import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Role from 'App/Models/Role'

export default class extends BaseSeeder {
  public async run () {
    // ADMIN USER
    const adminSearchKey = { email: 'admin@email.com' }
    const adminUserInfo = {
      name: 'Administrator',
      phone: '+55 (22) 99999-9991',
      cpf: '123.123.123-01',
      email: 'admin@email.com',
      password: 'secret'
    }
    const adminUserAddressInfo = {
      address: '123 Admin Street',
      city: 'London',
      state: 'CA',
      zipCode: '12345-67'
    }
    const adminUser = await User.updateOrCreate(adminSearchKey, adminUserInfo)
    const adminRole = await Role.findBy('type', 'admin')
    if (adminRole) {
      await adminUser.related('roles').attach([adminRole.id])
      await adminUser.related('addresses').create(adminUserAddressInfo)
    }

    // CUSTOMER USER
    const customerSearchKey = { email: 'customer@email.com' }
    const customerUserInfo = {
      name: 'Customer',
      phone: '+55 (22) 99999-9992',
      cpf: '123.123.123-02',
      email: 'customer@email.com',
      password:'secret'
    }
    const customerUserAddressInfo = {
      address: '123 Customer Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '12345-68'
    }
    const customerUser = await User.updateOrCreate(customerSearchKey, customerUserInfo)
    const customerRole = await Role.findBy('type', 'customer')
    if (customerRole) {
      await customerUser.related('roles').attach([customerRole.id])
      await customerUser.related('addresses').create(customerUserAddressInfo)
    }

    // BASIC USER
    const basicUserSearchKey = { email: 'user@email.com' }
    const basicUserInfo = {
      name: 'User',
      phone: '+55 (22) 99999-9993',
      cpf: '123.123.123-03',
      email: 'user@email.com',
      password:'secret'
    }
    const basicUserAddressInfo = {
      address: '123 User Street',
      city: 'New York',
      state: 'NY',
      zipCode: '12345-69'
    }
    const basicUser = await User.updateOrCreate(basicUserSearchKey, basicUserInfo)
    const userRole = await Role.findBy('type', 'user')
    if (userRole) {
      await basicUser.related('roles').attach([userRole.id])
      await basicUser.related('addresses').create(basicUserAddressInfo)
    }
  }
}
