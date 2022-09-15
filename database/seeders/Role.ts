import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'

export default class extends BaseSeeder {
  public async run() {
    const uniqueKey = 'type'
    await Role.updateOrCreateMany(uniqueKey, [
      {
        type: 'admin',
        description: 'Can perform all system operations.',
      },
      {
        type: 'customer',
        description: 'Can use the bank services.',
      },
      {
        type: 'user',
        description: 'Can update their info and request to be a customer (only once).'
      }
    ])
  }
}
