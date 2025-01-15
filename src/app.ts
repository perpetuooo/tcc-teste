import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import copiesRoutes from './modules/copies/copies.routes.ts';
import userRoutes from './modules/user/user.routes.ts';
import bookRoutes from './modules/book/book.routes.ts';
import loanRoutes from './modules/loan/loan.routes.ts';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { Database, Resource } from '@adminjs/prisma';
import { executeTasks } from './cron/scheduler.ts';
import { fastifySwagger } from '@fastify/swagger';
import AdminAuthProvider from './adminjs/auth.ts';
import { adminConfig } from './adminjs/config.ts';
import AdminJSFastify from '@adminjs/fastify';
import { fastifyCors } from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import prisma from './utils/prisma.ts';
import fjwt from '@fastify/jwt';
import AdminJS from 'adminjs';
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

AdminJS.registerAdapter({ Database, Resource })
dotenv.config()

const server = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()
const admin = new AdminJS(adminConfig)

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

// Registro do CORS (Cross-origin Resource Sharing).
server.register(fastifyCors, {
  origin: true,
  credentials: true,
})

// Registro do Swagger.
server.register(fastifySwagger, {
  mode: 'static',
  specification: {
    path: './src/utils/swagger.json',
    baseDir: path.resolve(),
  }
})

// Registro da interface do Swagger.
server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  staticCSP: true,
})

// Registro da rota de arquivos.
server.register(fastifyStatic, {
  root: path.resolve('./public/'),
  prefix: '/public/',
})

// Registro do JWT.
server.register(fjwt, {
  secret: process.env.FJWT_SECRET || "abcdefghijklmnopqrstuvwxyz123456",
})

// Função de autenticação para usuários.
server.decorate('authenticator', async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.cookies.access_token || request.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return reply.status(401).send({ error: "Autenticação falhou: Token não encontrado." })
  }  

  try {
    request.user = request.jwt.verify(token)

  } catch(err) {
    console.error(err)
    return reply.status(401).send({ error: "Erro ao realizar a autenticação." })
  }
})

// Função de autenticação para administradores.
server.decorate('adminAuthenticator', async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.cookies.access_token || request.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return reply.status(401).send({ error: "Autenticação falhou: Token não encontrado." })
  }  

  try {
    if (String(request.user.role) !== 'ADMIN') {
      return reply.status(403).send({ message: 'Autenticação falhou: Acesso negado' })
    }

    request.user = request.jwt.verify(token)

  } catch (err) {
    console.error(err)
    return reply.status(401).send({ error: "Erro ao realizar a autenticação." }).redirect('/admin/login');
  }
})

// Hook para injetar JWT.
server.addHook('preHandler', (request, reply, done) => {
  request.jwt = server.jwt
  return done()
})

// Tratamento dos erros de validação do Zod.
server.setErrorHandler((error, request, reply) => {
  if (error instanceof z.ZodError) {
    const formattedErrors = error.errors.map((err) => err.message)
    
    return reply.code(400).send({ error: formattedErrors })
  }
})

async function main() {
  // Definindo os endpoints.
  server.register(userRoutes, { prefix: '/api/users' })
  server.register(bookRoutes, { prefix: '/api/books' })
  server.register(loanRoutes, { prefix: '/api/loans' })
  server.register(copiesRoutes, { prefix: '/api/copies' })

  const authProvider = new AdminAuthProvider()

  admin.watch()
  executeTasks()

  await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      provider: authProvider,
      cookiePassword: process.env.COOKIES_SECRET || "abcdefghijklmnopqrstuvwxyz123456",
    },
    server,
    {
      saveUninitialized: true,
      secret: process.env.FJWT_SECRET || "abcdefghijklmnopqrstuvwxyz123456",
    }
  )

  const port = process.env.PORT ? parseInt(process.env.PORT) : 8080
  const host = process.env.HOST || '127.0.0.1'

  await server.listen({
    port: port,
    host: host,
  })
}



main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .then(() => {
    console.log('Server online!')
  })

// Finalizando todos os processos antes de desligar o servidor.
process.on('SIGINT', async () => {
  console.log('Sinal SIGINT recebido: desligando o servidor...')
  await prisma.$disconnect()
  process.exit()
})

process.on('SIGTERM', async () => {
  console.log('Sinal SIGTERM recebido: desligando o servidor...')
  await prisma.$disconnect()
  process.exit()
})
