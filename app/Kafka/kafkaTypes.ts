import User from "App/Models/User"

type MessageFromAdonisProducer = {
  user: User,
  token: string
}

export { MessageFromAdonisProducer }