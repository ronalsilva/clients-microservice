const { Kafka } = require('kafkajs');

const getBrokers = () => {
    if (process.env.KAFKA_BROKER) {
        return [process.env.KAFKA_BROKER];
    }
    if (process.env.KAFKA_BROKERS) {
        return process.env.KAFKA_BROKERS.split(',');
    }
    return ['localhost:9092'];
};

const brokers = getBrokers();
const kafka = new Kafka({
    clientId: 'client-microservice-health-check',
    brokers: brokers,
});

const admin = kafka.admin();

async function waitForKafka() {
    let retries = 5;
    while (retries > 0) {
        try {
            await admin.connect();
            const topics = await admin.listTopics();
            console.log('Kafka is ready!');
            await admin.disconnect();
            return;
        } catch (error) {
            retries--;
            if (retries === 0) {
                console.warn('Kafka connection failed after 5 retries');
                console.warn('Error:', error.message);
                console.warn('Continuing without Kafka - the service will try to connect later');
                return; 
            }
            console.log(`Kafka is unavailable (${brokers.join(', ')}) - sleeping...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

waitForKafka().catch((error) => {
    console.warn('Error waiting for Kafka:', error.message);
    console.warn('Continuing without Kafka - the service will try to connect later');
});

