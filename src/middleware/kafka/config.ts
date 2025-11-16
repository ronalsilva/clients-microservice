import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'client-microservice',
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'client-microservice-group' });

export default kafka;

