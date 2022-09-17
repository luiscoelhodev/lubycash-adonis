import { Kafka } from 'kafkajs'
const myBroker = process.env.KAFKA_BROKER_IP || 'localhost:9092'

const kafka = new Kafka({
  clientId: 'lubycash-adonis',
  brokers: [myBroker],
})

enum TopicEnum {
  validations = 'customer-validation-results',
  tokens = 'new-password-tokens'
}

export { kafka, TopicEnum }