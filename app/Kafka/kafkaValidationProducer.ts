import { kafka, TopicEnum } from "./kafkaConnector"
import { ValidationMessageFromAdonisProducer } from "./kafkaTypes"

export async function validationProducer(producerObject: ValidationMessageFromAdonisProducer) {
  const producer = kafka.producer()
  await producer.connect()
  await producer.send({
    topic: TopicEnum.validations,
    messages: [
      {
        value: JSON.stringify(producerObject),
      },
    ],
  })
  await producer.disconnect()
}