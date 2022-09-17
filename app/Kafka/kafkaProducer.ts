import { kafka, TopicEnum } from "./kafkaConnector"

export async function lubycashProducer(producerObject) {
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