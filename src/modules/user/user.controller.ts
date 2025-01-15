import { FastifyReply, FastifyRequest } from "fastify";
import { deleteUserValidation, findUserByEmail, findUserById, formatCPF, formatPhone, hashPassword, registerUserValidation, updateUserValidation, verifyPassword } from "./user.services.ts";
import { CreateUserInput, DeleteUserInput, LoginUserInput, UpdateUserInput } from "./user.schemas.ts";
import prisma from "../../utils/prisma.ts";

export async function registerUserHandler(
    request: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply) {
    const { email, name, cpf, password, phone } = request.body

    try {
        // Formatação do CPF e do telefone.
        const formattedPhone = formatPhone(phone)
        const formattedCPF = formatCPF(cpf)

        // Validação antes de registrar novo usuário.
        const userError = await registerUserValidation(name, email, formattedCPF, formattedPhone)

        if (userError) {
            return reply.code(400).send({ error: userError })
        }

        const hashedPassword = await hashPassword(password)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                cpf: formattedCPF,
                password: hashedPassword,
                phone: formattedPhone,
            }
        })

        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        }
    
        const token = request.jwt.sign(payload)
        
        reply.setCookie('access_token', token, {
            path: '/',
            httpOnly: true,
            secure: true,
            priority: 'medium',
            expires: new Date(Date.now() + 3 * 60 * 60 * 1000),
            sameSite: 'strict',
        })

        return reply.code(201).send({ access_token: token })
    } catch(err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao registrar novo usuário." })
    }
}


export async function loginUserHandler(
    request: FastifyRequest<{ Body: LoginUserInput }>,
    reply: FastifyReply) {
    const { email, password } = request.body

    try{
        const user = await findUserByEmail(email)
        
        if (user && await verifyPassword(password, user.password)) { 
            const payload = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        
            const token = request.jwt.sign(payload)
        
            reply.setCookie('access_token', token, {
                path: '/',
                httpOnly: true,
                secure: true,
                priority: 'medium',
                expires: new Date(Date.now() + 3 * 60 * 60 * 1000),
                sameSite: 'strict',
            })

            return reply.code(200).send({ 
                access_token: token,
                email: user.email,
                name: user.name,
            })

        } else {
            return reply.code(401).send({ error: "Email ou senha inválidos." })
        }
    } catch (err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao realizar o login." })
    }

}


export async function logoutUserHandler(request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie('access_token')

    return reply.send({ message: "Usuário deslogado." })
}


export async function updateUserHandler(
    request: FastifyRequest<{ Body: UpdateUserInput }>,
    reply: FastifyReply) {
    const { id, name, email, oldPassword, newPassword, phone, role, isBlocked } = request.body

    try{
        // Proíbe o usuário comum de modificar informações sensíveis.
        if ((id != request.user.id || role || isBlocked != undefined) && String(request.user.role) !== 'ADMIN') {
            return reply.code(403).send({ error: "Acesso negado." })
        }
        
        const user = await findUserById(id)

        if (!user) {
            return reply.code(404).send({ error: "Usuário não encontrado..." })
        }

        const formattedPhone = formatPhone(phone)

        // Validação antes de atualizar o usuário.
        const userError = await updateUserValidation(id, name, email, formattedPhone)

        if (userError) {
            return reply.code(400).send({ error: userError })
        }

        if (oldPassword && newPassword) {
            const verifyOldPassword = await verifyPassword(oldPassword, user.password)

            if (!verifyOldPassword) {
                return reply.code(400).send({ error: "Senha incorreta." })
            }

            const hashedNewPassword = await hashPassword(newPassword)

            const updatedUser = await prisma.user.update({ 
                where: { id }, 
                data: {
                    name,
                    email,
                    phone: formattedPhone,
                    password: hashedNewPassword,
                    role,
                    isBlocked,
                }
            })

            // Não é necessário criar um log de admin pois somente o usuário consegue alterar sua senha.
            return reply.code(200).send(updatedUser)
        }

        const result = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({ 
                where: { id }, 
                data: { 
                    name,
                    email,
                    phone,
                    role,
                    isBlocked, 
                }
            })

            if (String(request.user.role) == 'ADMIN') {
                tx.adminLog.create({
                    data: {
                        adminId: request.user.id,
                        adminName: request.user.name,
                        action: "UPDATE",
                        entityType: "USER",
                        entityId: String(user.id),
                        entityName: user.name,
                        time: new Date()
                    }
                })
            }

            return updatedUser
        })

        return reply.code(200).send(result)
    } catch(err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao atualizar o usuário." }) 
    }
}


export async function deleteUserHandler(
    request: FastifyRequest<{ Params: DeleteUserInput }>, 
    reply: FastifyReply) {
    const { id } = request.params

    try {
        if (id != request.user.id && String(request.user.role) !== 'ADMIN') {
            return reply.code(403).send({ error: "Acesso negado." })
        }

        const user = await findUserById(id)

        if (!user) {
            return reply.code(404).send({ message: "Usuário não encontrado..." })
        }

        // Validação antes de deletar o usuário.
        const userError = await deleteUserValidation(user)

        if (userError) {
            return reply.code(400).send({ error: userError })
        }
        
        await prisma.$transaction(async (tx) => {
            // Remove o usuário da fila de espera e ajusta as posições.
            const waitListEntries = await tx.waitList.findMany({ where: { userId: id }})
        
            for (const entry of waitListEntries) {
                await tx.waitList.delete({ where: { id: entry.id }})
        
                await tx.waitList.updateMany({
                    where: {
                        bookId: entry.bookId,
                        position: { gt: entry.position },
                    },
                    data: {
                        position: { decrement: 1 },
                    },
                })
            }

            await tx.user.delete({ where: { id } })

            if (String(request.user.role) == 'ADMIN') {
                tx.adminLog.create({
                    data: {
                        adminId: request.user.id,
                        adminName: request.user.name,
                        action: "DELETE",
                        entityType: "USER",
                        entityId: String(user.id),
                        entityName: user.name,
                        time: new Date()
                    }
                })
            }
        })

        return reply.code(200).send({ message: "Usuário deletado com sucesso!" })
    } catch(err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao deletar o usuário." })
    }
}


export async function getDataHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const copies = await tx.copy.count()
            const availableCopies = await tx.copy.count({ where: { isLoaned: false }})
            const userCopies = await tx.loan.findMany({ 
                where: { userId: request.user.id },
                select: {
                    id: true,
                    userName: true,
                    userId: false,
                    bookTitle: true,
                    bookId: false,
                    ISBN: true,
                    copyId: false,
                    expirationDate: true,
                    loanDate: true,
                    returnDate: true,
                    status: true,
                    postponed: true,
                    archived: false
                }
            })

            return {copies, availableCopies, userCopies}
        })

        return reply.code(200).send({
            copies: result.copies,
            availableCopies: result.availableCopies,
            loanedCopies: result.copies - result.availableCopies,
            userCopies: result.userCopies
        })
    } catch (err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao obter dados do usuário." })
    }
}