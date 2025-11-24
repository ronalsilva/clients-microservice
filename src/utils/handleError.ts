import { FastifyReply } from "fastify";

// ESSE COMENTARIO NAO FOI GERADO POR IA :) HAHA - FOI GERADO POR MIM RONALD 
// FUNCAO CRIADA PARA MANIPULAR ERROS GERADOS PELO PRISMA
// DOC PRISMA: https://www.prisma.io/docs/orm/reference/error-reference
function handleError(err: any, response: FastifyReply): void {
    console.error("Database error:", err);
    switch (err.code) {
        case "P1000":
            response.code(500).send({
                error: 500,
                message: "Authentication failed on database server"
            });
            break;
        case "P1001":
        case "P1002":
            response.code(500).send({
                error: 500,
                message: "Unable to connect to database server"
            });
            break;
        case "P1008":
            response.code(504).send({
                error: 504,
                message: "Database operation timed out"
            });
            break;
        case "P1017":
            response.code(500).send({
                error: 500,
                message: "Server closed the connection"
            });
            break;
        case "P2000":
            response.code(400).send({
                error: 400,
                message: "The value provided for the column is too long"
            });
            break;
        case "P2002":
            response.code(409).send({
                error: 409,
                message: `A user with this email already exists`
            });
            break;
        case "P2003":
            response.code(400).send({
                error: 400,
                message: `Error creating user: ${err.meta?.field_name}`
            });
            break;
        case "P2025":
            response.code(404).send({
                error: 404,
                message: "User not found"
            });
            break;
        case "P2011":
            response.code(400).send({
                error: 400,
                message: "Error creating user"
            });
            break;
        case "P2012":
            response.code(400).send({
                error: 400,
                message: "A required value is missing"
            });
            break;
        case "P2014":
            response.code(400).send({
                error: 400,
                message: "The change you are trying to make violates a required relationship"
            });
            break;
        case "P2024":
            response.code(503).send({
                error: 503,
                message: "Time out when searching for a new connection from the connection pool"
            });
            break;
        default:
            response.code(500).send({
                error: 500,
                message: "Internal server error"
            });
            break;
    }
}

export default handleError;
