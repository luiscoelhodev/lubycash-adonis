import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'

export default class ResetPassToken extends BaseModel {
  public static table = 'reset_password_tokens'

  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public token: uuidv4

  @column()
  public used: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(resetPassToken: ResetPassToken) {
    resetPassToken.token = uuidv4()
  }
}
