import { schema, rules} from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CustomMessages from './CustomMessages'

class UserStoreValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }
  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.maxLength(60),
      rules.minLength(3),
      rules.regex(/^[ a-zA-ZÀ-ÿ\u00f1\u00d1]*$/g),
    ]),
    cpf: schema.string({}, [
      rules.regex(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/),
      rules.unique({ table: 'users', column: 'cpf' }),
    ]),
    phone: schema.string({}, [
      rules.regex(/^\+\d{2}\(\d{2}\)\d{4,5}-\d{4}/g)
    ]),
    email: schema.string({ trim: true }, [
      rules.maxLength(50),
      rules.minLength(8),
      rules.email(),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    password: schema.string({}, [rules.maxLength(50)]),
    address: schema.string({ trim: true }, [rules.maxLength(100)]),
    city: schema.string({ trim: true }, [rules.maxLength(50)]),
    state: schema.string({ trim: true }, [rules.regex(/[a-zA-Z][a-zA-Z]/), rules.maxLength(2)]),
    zip_code: schema.string({ trim: true }, [rules.maxLength(10)]),
    complement: schema.string.optional({ trim: true })
  })
}

class UserUpdateValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public refs = schema.refs({
    id: this.ctx.params.id,
  })

  public schema = schema.create({
    userSecureId: schema.string.optional({ escape: true, trim: true }, [rules.uuid({ version: '4' })]),
    name: schema.string.optional({ trim: true }, [
      rules.maxLength(60),
      rules.minLength(3),
      rules.regex(/^[ a-zA-ZÀ-ÿ\u00f1\u00d1]*$/g),
    ]),
    cpf: schema.string.optional({}, [
      rules.regex(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/),
      rules.unique({
        table: 'users',
        column: 'cpf',
        whereNot: {
          secure_id: this.refs.id,
        },
      }),
    ]),
    phone: schema.string.optional({}, [
      rules.regex(/^\+\d{2}\(\d{2}\)\d{4,5}-\d{4}/g)
    ]),
    email: schema.string.optional({ trim: true }, [
      rules.maxLength(50),
      rules.minLength(8),
      rules.email(),
      rules.unique({
        table: 'users',
        column: 'email',
        caseInsensitive: true,
        whereNot: {
          secure_id: this.refs.id,
        },
      }),
    ]),
    password: schema.string.optional({}, [rules.maxLength(50)]),
    address: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
    city: schema.string.optional({ trim: true }, [rules.maxLength(50)]),
    state: schema.string.optional({ trim: true }, [rules.regex(/[a-zA-Z]{2}/)]),
    zip_code: schema.string.optional({ trim: true }, [rules.maxLength(10)]),
    complement: schema.string.optional({ trim: true })
  })
}

class UserToBecomeCustomerValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }
  public schema = schema.create({
    average_salary: schema.number()
  })
}

class GetUserBankStatementValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }
  public schema = schema.create({
    from: schema.date.optional(),
    to: schema.date.optional()
  })
}

class MakeTransferValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }
  public schema = schema.create({
    amount: schema.number([rules.unsigned(), rules.range(0.01, 100000)]),
    message: schema.string.optional({trim: true}),
    receiverCPF: schema.string({trim: true}, [rules.regex(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)])
  })
}

export { UserStoreValidator, UserUpdateValidator, UserToBecomeCustomerValidator, GetUserBankStatementValidator, MakeTransferValidator }