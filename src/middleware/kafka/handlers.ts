// DIVE ALGUMA DIVICULIDADE DE CONFIGURACAO PARA VERIFICAR SE O TOKEN É VALIDO E DECODIFICAR O TOKEN
// UMA PARTE DESSE CODIGO FOI GERADO POR IA PARA AJUDAR A DESENVOLVER O CODIGO
// MAS EU VALIDEI O CODIGO E AJUSTEI PARA O MEU USO
// ESSA FOI A PRIMEIRA FEZ QUE TRABALHEI COM KAFKA
// ASS: RONALD JUNGER





import { EachMessagePayload } from 'kafkajs';
import { getUserById } from '@service/Users';
import { sendKafkaMessage } from './producer';
import jwt from 'jsonwebtoken';

interface KafkaRequest {
    correlationId: string;
    action: string;
    token?: string;
    userId?: string;
}

interface KafkaSuccessResponse {
    correlationId: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

interface KafkaErrorResponse {
    correlationId: string;
    error: string;
    message: string;
}

function verifyAndDecodeJWTToken(token: string): { valid: boolean; decoded?: any } {
    try {
        const secret = process.env.JWT_SECRET || '';
        const decoded = jwt.verify(token, secret);
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false };
    }
}

export async function handleGetUserRequest(payload: EachMessagePayload): Promise<void> {
    let correlationId: string | undefined;
    
    try {
        const messageValue = payload.message.value?.toString();
        if (!messageValue) {
            console.error('Empty message received');
            return;
        }

        const request: KafkaRequest = JSON.parse(messageValue);
        correlationId = request.correlationId;
        const { action, token } = request;

        const supportedActions = ['validateTokenAndGetUser', 'getUserById'];
        if (!supportedActions.includes(action)) {
            const errorResponse: KafkaErrorResponse = {
                correlationId,
                error: 'Unsupported action',
                message: `Action '${action}' is not supported. Supported actions: ${supportedActions.join(', ')}`,
            };

            const responseTopic = process.env.KAFKA_RESPONSE_TOPIC || 'client-microservice-responses';
            await sendKafkaMessage(responseTopic, errorResponse, correlationId);
            return;
        }

        let userId: string | undefined;

        if (action === 'validateTokenAndGetUser') {
            if (!token) {
                const errorResponse: KafkaErrorResponse = {
                    correlationId,
                    error: 'Invalid token',
                    message: 'Token is required',
                };

                const responseTopic = process.env.KAFKA_RESPONSE_TOPIC || 'client-microservice-responses';
                await sendKafkaMessage(responseTopic, errorResponse, correlationId);
                return;
            }

            const tokenValidation = verifyAndDecodeJWTToken(token);
            
            if (!tokenValidation.valid || !tokenValidation.decoded) {
                const errorResponse: KafkaErrorResponse = {
                    correlationId,
                    error: 'Invalid token',
                    message: 'Token expired or invalid',
                };

                const responseTopic = process.env.KAFKA_RESPONSE_TOPIC || 'client-microservice-responses';
                await sendKafkaMessage(responseTopic, errorResponse, correlationId);
                return;
            }

            userId = tokenValidation.decoded.id || request.userId;
        } 
        else if (action === 'getUserById') {
            if (token) {
                const tokenValidation = verifyAndDecodeJWTToken(token);
                
                if (!tokenValidation.valid || !tokenValidation.decoded) {
                    const errorResponse: KafkaErrorResponse = {
                        correlationId,
                        error: 'Invalid token',
                        message: 'Token esta expirado ou invalido',
                    };

                    const responseTopic = process.env.KAFKA_RESPONSE_TOPIC || 'client-microservice-responses';
                    await sendKafkaMessage(responseTopic, errorResponse, correlationId);
                    return;
                }
            }

            userId = request.userId;
        }

        if (!userId) {
            const errorMessage = action === 'validateTokenAndGetUser' 
                ? 'User ID not found in token' 
                : 'User ID is required in request';
            
            console.error(errorMessage);
            const errorResponse: KafkaErrorResponse = {
                correlationId,
                error: 'Missing user ID',
                message: errorMessage,
            };

            const responseTopic = process.env.KAFKA_RESPONSE_TOPIC || 'client-microservice-responses';
            await sendKafkaMessage(responseTopic, errorResponse, correlationId);
            return;
        }

        const user = await getUserById(userId);
        console.log('user', user);

        if (!user) {
            const errorResponse: KafkaErrorResponse = {
                correlationId,
                error: 'User not found',
                message: 'User not found',
            };

            const responseTopic = process.env.KAFKA_RESPONSE_TOPIC || 'client-microservice-responses';
            await sendKafkaMessage(responseTopic, errorResponse, correlationId);
            return;
        }

        const successResponse: KafkaSuccessResponse = {
            correlationId,
            user: {
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`.trim(),
            },
        };

        const responseTopic = process.env.KAFKA_RESPONSE_TOPIC || 'client-microservice-responses';
        await sendKafkaMessage(responseTopic, successResponse, correlationId);
    } catch (error: any) {
        if (correlationId) {
            try {
                const errorResponse: KafkaErrorResponse = {
                    correlationId,
                    error: 'Internal server error',
                    message: error.message || 'An unexpected error occurred',
                };

                const responseTopic = process.env.KAFKA_RESPONSE_TOPIC || 'client-microservice-responses';
                await sendKafkaMessage(responseTopic, errorResponse, correlationId);
            } catch (parseError) {
                console.error('Error sending error response:', parseError);
            }
        }
    }
}

