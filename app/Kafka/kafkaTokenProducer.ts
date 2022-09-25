import { kafka, TopicEnum } from "./kafkaConnector"
import { TokenMessageFromAdonisProducer } from "./kafkaTypes"

export async function tokenProducer(producerObject: TokenMessageFromAdonisProducer) {
  const producer = kafka.producer()
  await producer.connect()
  await producer.send({
    topic: TopicEnum.tokens,
    messages: [
      {
        value: JSON.stringify(producerObject),
      },
    ],
  })
  await producer.disconnect()
}