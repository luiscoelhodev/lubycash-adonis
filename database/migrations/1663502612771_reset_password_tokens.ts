import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'reset_password_tokens'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().unique().notNullable()
      table.string('email').notNullable()
      table.uuid('token').notNullable()
      table.boolean('used').defaultTo(0).notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
