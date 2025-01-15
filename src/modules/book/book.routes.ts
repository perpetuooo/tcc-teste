import { FastifyTypedInstance } from '../../utils/types.ts';
import { createCategoryRequestSchema, createCategoryResponseSchema, deleteBookRequestSchema, deleteCategoryRequestSchema, registerBookRequestSchema, registerBookResponseSchema, updateBookRequestSchema, updateBookResponseSchema } from './book.schemas.ts';
import { createCategoryHandler, deleteBookHandler, deleteCategoryHandler, getBookDetailsHandler, getBooksHandler, registerBookHandler, updateBookHandler } from './book.controller.ts';

export default async function bookRoutes(server: FastifyTypedInstance) {
    server.get(
        '/',
        {
            preHandler: [server.authenticator]
        }, getBooksHandler
    )

    server.get(
        '/view/:id',
        {
            preHandler: [server.authenticator]
        }, getBookDetailsHandler
    )

    server.post(
        '/register',
        {
            preHandler: [server.authenticator, server.adminAuthenticator],
            schema: {
                body: registerBookRequestSchema,
                response: {
                    201: registerBookResponseSchema
                },
            },
        }, registerBookHandler
    )

    server.put(
        '/update',
        {
            preHandler: [server.authenticator, server.adminAuthenticator],
            schema: {
                body: updateBookRequestSchema,
                response: {
                    200: updateBookResponseSchema,
                }
            }
        }, updateBookHandler
    )

    server.delete(
        '/delete/:id',
        {
            preHandler: [server.authenticator, server.adminAuthenticator],
            schema: {
                params: deleteBookRequestSchema
            }
        }, deleteBookHandler
    )

    server.post(
        '/category/create',
        {
            preHandler: [server.authenticator, server.adminAuthenticator],
            schema: {
                body: createCategoryRequestSchema,
                response: {
                    201: createCategoryResponseSchema
                }
            }
        }, createCategoryHandler
    )

    server.delete(
        '/category/delete/:id',
        {
            preHandler: [server.authenticator, server.adminAuthenticator],
            schema: {
                params: deleteCategoryRequestSchema
            }
        }, deleteCategoryHandler
    )
}
