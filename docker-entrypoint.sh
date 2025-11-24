#!/bin/sh

echo "Waiting for database to be ready..."

node wait-for-db.js || {
    echo "Database connection failed!"
    exit 1
}

echo "Running Prisma migrations..."

npx prisma db push --skip-generate --accept-data-loss || echo "Prisma db push failed, continuing anyway..."

if [ -n "$KAFKA_BROKER" ] || [ -n "$KAFKA_BROKERS" ]; then
    echo "Waiting for Kafka to be ready..."
    node wait-for-kafka.js || echo "Kafka check completed with warnings, continuing..."
fi

echo "Starting application..."

exec "$@"

