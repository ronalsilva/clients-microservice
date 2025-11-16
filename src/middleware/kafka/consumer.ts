import { consumer } from './config';
import { handleGetUserRequest } from './handlers';

const REQUEST_TOPIC = process.env.KAFKA_REQUEST_TOPIC || 'client-microservice-requests';

export async function connectConsumer(): Promise<void> {
    try {
        await consumer.connect();

        await consumer.subscribe({ topic: REQUEST_TOPIC, fromBeginning: false });

        await consumer.run({
            eachMessage: async (payload) => {
                try {
                    await handleGetUserRequest(payload);
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            },
        });
    } catch (error) {
        console.error('Error connecting Kafka Consumer:', error);
        throw error;
    }
}

export async function disconnectConsumer(): Promise<void> {
    try {
        await consumer.disconnect();
    } catch (error) {
        console.error('Error disconnecting Kafka Consumer:', error);
        throw error;
    }
}

