import { kafka, TopicEnum } from "./kafkaConnector"
import { MessageFromAdonisProducer } from "./kafkaTypes"

export async function lubycashProducer(producerObject: MessageFromAdonisProducer) {
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