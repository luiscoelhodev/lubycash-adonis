import User from "App/Models/User"

type TokenMessageFromAdonisProducer = {
  user: User,
  token: string
}

type ValidationMessageFromAdonisProducer = {
  user: User,
  result: string
}

export { TokenMessageFromAdonisProducer, ValidationMessageFromAdonisProducer }