import { JWT } from "@fastify/jwt";
import { FastifyBaseLogger, FastifyInstance, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export type FastifyTypedInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  ZodTypeProvider
>

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT
    user: UserPayload
  }

  interface FastifyInstance {
    authenticator: any
    adminAuthenticator: any
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: UserPayload
  }
}

type UserPayload = {
  id: string
  email: string
  name: string
  role: ['USER', 'ADMIN']
}
