import buildServer from "./server";
import { FastifyInstance } from "fastify";
import { connectProducer, disconnectProducer } from "./middleware/kafka/producer";
import { connectConsumer, disconnectConsumer } from "./middleware/kafka/consumer";

const PORT = Number(process.env.PORT) || 3002;

async function startServer(server: FastifyInstance): Promise<void> {
    try {
        try {
            await connectProducer();
            await connectConsumer();
        } catch (kafkaError) {
            console.warn('Kafka connection failed, continuing without Kafka:', kafkaError);
        }

        await server.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server ready at http://localhost:${PORT}`);
        console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
    } catch (error: any) {
        if (error?.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use.`);
        } else {
            console.error("Error starting server:", error);
        }
        await disconnectProducer().catch(console.error);
        await disconnectConsumer().catch(console.error);
        process.exit(1);
    }
}

async function main() {
    const server = buildServer();
    await startServer(server);

    const shutdown = async () => {
        console.log('Shutting down gracefully...');
        await server.close();
        await disconnectProducer();
        await disconnectConsumer();
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

main();