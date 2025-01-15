import { FastifyTypedInstance } from '../../utils/types.ts';
import { createCopyHandler, deleteCopyHandler, editCopyHandler } from "./copies.controller.ts";
import { createBookCopyRequestSchema, createBookCopyResponseSchema, editBookCopyRequestSchema, editBookCopyResponseSchema } from "./copies.schemas.ts";

export default async function copiesRoutes(server :FastifyTypedInstance) {
    server.post(
        '/create',
        {
            preHandler: [server.authenticator, server.adminAuthenticator],
            schema: {
                body: createBookCopyRequestSchema,
                response: {
                    201: createBookCopyResponseSchema
                }
            }
        }, createCopyHandler
    )

    server.put(
        '/edit',
        {
            preHandler: [server.authenticator, server.adminAuthenticator],
            schema: {
                body: editBookCopyRequestSchema,
                response: {
                    201: editBookCopyResponseSchema
                }
            }
        }, editCopyHandler
    )

    server.delete(
        '/delete/:id',
        {
            preHandler: [server.authenticator, server.adminAuthenticator],
        }, deleteCopyHandler
    )
}