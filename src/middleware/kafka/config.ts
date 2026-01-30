import { Kafka } from 'kafkajs';

// Suporta tanto KAFKA_BROKER (singular) quanto KAFKA_BROKERS (plural)
const getBrokers = (): string[] => {
    if (process.env.KAFKA_BROKER) {
        return [process.env.KAFKA_BROKER];
    }
    if (process.env.KAFKA_BROKERS) {
        return process.env.KAFKA_BROKERS.split(',');
    }
    return ['localhost:9092'];
};

const kafka = new Kafka({
    clientId: 'client-microservice',
    brokers: getBrokers(),
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'client-microservice-group' });

export default kafka;

