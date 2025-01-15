import { FastifyTypedInstance } from '../../utils/types.ts';
import { registerUserHandler, loginUserHandler, logoutUserHandler, deleteUserHandler, updateUserHandler, getDataHandler } from './user.controller.ts';
import { createUserRequestSchema, createUserResponseSchema, deleteUserRequestSchema, loginUserRequestSchema, loginUserResponseSchema, updateUserRequestSchema } from './user.schemas.ts';
import { FastifyInstance } from 'fastify';

export default async function userRoutes(server: FastifyTypedInstance) {
  server.get(
    '/',
    {
      preHandler: [server.authenticator],
    }, getDataHandler
  )

  server.post(
    '/register',
    {
      schema: {
        body: createUserRequestSchema,
        response: {
          201: createUserResponseSchema,
        },
      },
    }, registerUserHandler
  )

  server.post(
    '/login',
    {
      schema: {
        body: loginUserRequestSchema,
        response: {
          201: loginUserResponseSchema
        }
      }
    }, loginUserHandler
  )

  server.delete(
    '/logout',
    logoutUserHandler
  )

  server.put(
    '/update',
    {
      preHandler: [server.authenticator],
      schema: {
        body: updateUserRequestSchema,
      }
    }, updateUserHandler
  )
  
  server.delete(
    '/delete/:id',
    {
      preHandler: [server.authenticator],
      schema: {
        params: deleteUserRequestSchema
      }
    }, deleteUserHandler
  )
}
