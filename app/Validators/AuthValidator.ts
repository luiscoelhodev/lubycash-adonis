import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import CustomMessages from './CustomMessages'

class LoginValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    email: schema.string({ trim: true }, [rules.maxLength(50), rules.minLength(8), rules.email()]),
    password: schema.string({}, [rules.maxLength(50)]),
  })
}

class GetResetPassTokenValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    email: schema.string({ trim: true }, [rules.maxLength(50), rules.minLength(8), rules.email()]),
  })
}

class ResetPasswordValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }
  public schema = schema.create({
    token: schema.string({ trim: true }, [rules.minLength(36), rules.maxLength(36)]),
    newPassword: schema.string({}, [rules.maxLength(50)]),
  })
}

export { LoginValidator, GetResetPassTokenValidator, ResetPasswordValidator }