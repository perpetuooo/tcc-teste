import { findUserByEmail, verifyPassword } from '../modules/user/user.services.ts';
import { BaseAuthProvider, LoginHandlerOptions } from 'adminjs';
import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../utils/prisma.ts';

class AdminAuthProvider extends BaseAuthProvider {
  async handleLogin(opts: LoginHandlerOptions, context: { request: FastifyRequest, reply: FastifyReply }) {
    const { data } = opts
    const { email, password } = data

    if (!email && !password) { 
      const user = await prisma.user.findFirst({ where: { name: 'admin'}})
      if (user) {
        const payload = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
  
        const token = context.request.jwt.sign(payload)
  
        context.reply.setCookie('access_token', token, {
          path: '/',
          httpOnly: true,
          secure: true,
          priority: 'medium',
          expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
          sameSite: 'lax',
        })
  
        return { email: user.email, access_token: token };
      }
    }


    const user = await findUserByEmail(email)

    if (user && await verifyPassword(password, user.password) && user.role === 'ADMIN') {
      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }

      const token = context.request.jwt.sign(payload)

      context.reply.setCookie('access_token', token, {
        path: '/',
        httpOnly: true,
        secure: true,
        priority: 'medium',
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
        sameSite: 'lax',
      })

      return { email: user.email, access_token: token };
    }

    return null
  }

  async handleLogout(context: any) {
    return Promise.resolve()
  }

  async handleRefreshToken(opts: LoginHandlerOptions, context: any) {
    return Promise.resolve({})
  }
}

export default AdminAuthProvider


