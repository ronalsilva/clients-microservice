import { producer } from './config';

export async function sendKafkaMessage(topic: string, message: unknown, correlationId?: string): Promise<void> {
    try {
        await producer.send({
            topic,
            messages: [
                {
                    key: correlationId || Date.now().toString(),
                    value: JSON.stringify(message),
                    headers: correlationId ? { correlationId } : undefined,
                },
            ],
        });
    } catch (error) {
        console.error('Error sending Kafka message:', error);
        throw error;
    }
}

export async function connectProducer(): Promise<void> {
    try {
        await producer.connect();
        console.log('Kafka Producer connected');
    } catch (error) {
        console.error('Error connecting Kafka Producer:', error);
        throw error;
    }
}

export async function disconnectProducer(): Promise<void> {
    try {
        await producer.disconnect();
        console.log('Kafka Producer disconnected');
    } catch (error) {
        console.error('Error disconnecting Kafka Producer:', error);
        throw error;
    }
}

