import { FastifyTypedInstance } from '../../utils/types.ts';
import { createLoanHandler, enterWaitListHandler, exitWaitListHandler, getUserLoansHandler, getWaitListPositionHandler, postponeLoanHandler, returnLoanHandler, startLoanHandler, terminateLoanHandler,  } from "./loan.controller.ts";
import { createLoanRequestSchema, createLoanResponseSchema, manageWaitListRequestSchema, manageWaitListResponseSchema, manipulateLoanRequestSchema, postponeLoanResponseSchema, startLoanResponseSchema, positionsWaitListResponseSchema, postponeLoanRequestSchema } from "./loan.schemas.ts";

export default async function loanRoutes(server :FastifyTypedInstance) {
    server.get(
        '/',
        {
            preHandler: [server.authenticator],
        },
        getUserLoansHandler
    )

    server.post(
        '/create',
        {
            preHandler: [server.authenticator],
            schema: {
                body: createLoanRequestSchema,
                response: {
                    201: createLoanResponseSchema
                }
            }
        }, createLoanHandler
    )

    server.put(
        '/start',
        {
            preHandler: [server.authenticator],
            schema: {
                body: manipulateLoanRequestSchema,
                response: {
                    200: startLoanResponseSchema
                }
            }
        }, startLoanHandler
    )

    server.put(
        '/postpone',
        {
            preHandler: [server.authenticator],
            schema: {
                body: postponeLoanRequestSchema,
                response: {
                    200: postponeLoanResponseSchema
                }
            }
        }, postponeLoanHandler
    )

    // As rotas para retornar/encerrar são PUT porque os empréstimos nunca são excluídos no sistema.
    server.put(
        '/return',
        {
            preHandler: [server.authenticator],
            schema: {
                body: manipulateLoanRequestSchema,
            }
        }, returnLoanHandler
    )

    server.put(
        '/terminate',
        {
            preHandler: [server.authenticator, server.adminAuthenticator],
            schema: {
                body: manipulateLoanRequestSchema,
            }
        }, terminateLoanHandler
    )

    server.put(
        '/waitlist/enter',
        {
            preHandler: [server.authenticator],
            schema: {
                body: manageWaitListRequestSchema,
                response: {
                    200: manageWaitListResponseSchema
                }
            }
        }, enterWaitListHandler
    )

    server.get(
        '/waitlist/position',
        {
            preHandler: [server.authenticator],
            schema: {
                response: {
                    200: positionsWaitListResponseSchema
                }
            }
        }, getWaitListPositionHandler
    )

    server.delete(
        '/waitlist/exit/:bookId',
        {
            preHandler: [server.authenticator],
        }, exitWaitListHandler
    )
}
