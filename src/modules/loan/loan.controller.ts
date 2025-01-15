import prisma from "../../utils/prisma.ts";
import { FastifyReply, FastifyRequest } from "fastify";
import { findUserById } from "../user/user.services.ts";
import { findBookById } from "../book/book.services.ts";
import { sendEmail } from "../../utils/emails/services.ts";
import { getCopyForLoan } from "../copies/copies.services.ts";
import { CreateLoanInput, ManageWaitListInput, ManipulateLoanInput, PostponeLoanInput } from "./loan.schemas.ts";
import { adjustExpirationDate, createLoanValidation, enterWaitListValidation, findLoanById, findWaitListByIds, postponeLoanValidation, terminateLoanValidation } from "./loan.services.ts";

export async function getUserLoansHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = request.user.id

        const loans = await prisma.loan.findMany({ 
            where: { userId },
            select: {
                id: true,
                userName: true,
                userId: true,
                bookTitle: true,
                bookId: true,
                ISBN: true,
                copyId: true,
                expirationDate: true,
                loanDate: true,
                returnDate: true,
                status: true,
                postponed: true,
                archived: true,
                book: false,
                copy: false,
                user: false,
            }
        })

        if (loans.length === 0) {
            return reply.code(404).send({ error: "Nenhum empréstimo encontrado..." })
        }

        return reply.code(200).send(loans)
    } catch(err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao obter os empréstimos." })
    }
}


export async function createLoanHandler(    
    request: FastifyRequest<{ Body: CreateLoanInput }>, 
    reply: FastifyReply
) {
    const { bookId } = request.body
    
    try {
        const userId = request.user.id

        const user = await findUserById(userId)
        const book = await findBookById(bookId)
        const copy = await getCopyForLoan()

        if (!book || !user || !copy) {
            return reply.code(404).send({ error: "Usuário, livro ou exemplar não encontrados..." })
        }
        
        // Validação antes de criar o empréstimo.
        const loanError = await createLoanValidation(user, book)

        if (loanError) {
            return reply.code(400).send({ error: loanError })
        }

        // Cria a data de expiração da requisição sem considerar finais de semana.
        const startDate = new Date()
        const expirationDate = adjustExpirationDate(startDate, 3)
        expirationDate.setHours(23, 59, 59, 999)

        const result = await prisma.$transaction(async (tx) => {
            const loan = await tx.loan.create({
                data: {
                    userName: user.name,
                    userId,
                    bookTitle: book.title,
                    bookId,
                    ISBN: copy.ISBN,
                    copyId: copy.id,
                    expirationDate,
                    status: 'REQUESTED',
                }
            })
    
            await tx.copy.update({
                where: { id: copy.id },
                data: {
                    isLoaned: true,
                }
            })

            return loan
        })

        return reply.code(200).send(result)
    } catch(err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao realizar o empréstimo do livro." })
    }
}


export async function startLoanHandler(
    request: FastifyRequest<{ Body: ManipulateLoanInput }>, 
    reply: FastifyReply
) {
    const { id } = request.body

    try {
        const loan = await findLoanById(id)
        
        if (!loan) {
            return reply.code(404).send({ error: "Empréstimo não encontrado." })
        }
        
        const loanDate = new Date()
        const expirationDate = new Date(loanDate)
        expirationDate.setDate(expirationDate.getDate() + 7)
        expirationDate.setHours(23, 59, 59, 999)
    
        const result = await prisma.$transaction(async (tx) => {
            const loan = await tx.loan.update({
                where: { id },
                data: {
                    loanDate,
                    expirationDate,
                    status: 'ONGOING',
                }
            })
        
            await tx.book.update({
                where: { title: loan.bookTitle },
                data: { copiesAvailable: { decrement: 1 } }
            })
    
            await tx.adminLog.create({
                data: {
                  adminId: request.user.id,
                  adminName: request.user.name,
                  action: "START",
                  entityType: "LOAN",
                  entityId: String(loan.id),
                  entityName: `Empréstimo N.º ${loan.id}`,
                  time: new Date()
                }
            })

            return loan
        })

        // Envia um email notificando o usuário.
        const user = await findUserById(loan.userId!)

        await sendEmail(
            user!.email,
            "Empréstimo Iniciado",
            'new-loan',
            {
                name: user!.name,
                bookTitle: loan.bookTitle,
                date: loan.expirationDate!?.toLocaleDateString('pt-BR')
            }
        )

        return reply.code(200).send(result)
    } catch(err) {
       console.error(err)
       return reply.code(500).send({ error: "Erro ao iniciar o empréstimo." }) 
    }
}


export async function postponeLoanHandler(
    request: FastifyRequest<{ Body: PostponeLoanInput }>, 
    reply: FastifyReply
) {
    const { id } = request.body

    try {
        const userId = request.user.id

        const loan = await prisma.loan.findFirst({
            where: {
                id,
                userId
            }
        })

        if (!loan) {
            return reply.code(404).send({ error: "Empréstimo não encontrado." })
        }

        // Validação antes de estender o empréstimo.
        const loanError = await postponeLoanValidation(loan)

        if (loanError) {
            return reply.code(400).send({ error: loanError })
        }

        if (loan.expirationDate) {
            const currentExpirationDate = new Date(loan.expirationDate)
            const newExpirationDate = currentExpirationDate.setDate(currentExpirationDate.getDate() + 7)

            const updatedLoan = await prisma.loan.update({
                where: { id: loan.id },
                data: {
                    expirationDate: new Date(newExpirationDate),
                    postponed: true,
                }
            })
            
            return reply.code(200).send(updatedLoan)
        }
    } catch (err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao estender o empréstimo do livro." })
    }
}


export async function returnLoanHandler(
    request: FastifyRequest<{ Body: ManipulateLoanInput }>,
    reply: FastifyReply
) {
    const { id } = request.body

    try {
        const loan = await findLoanById(id)

        if (!loan) {
            return reply.code(404).send({ error: "Empréstimo não encontrado..." })
        }

        await prisma.$transaction(async (tx) => {
            if (!loan.bookId) {
                return reply.code(404).send({ error: "O livro do empréstimo não foi encontrado..." })
            }

            await tx.book.update({
                where: { id: loan.bookId },
                data: { copiesAvailable: { increment: 1 } }
            })

            await tx.copy.update({
                where: { ISBN: loan.ISBN },
                data: { isLoaned: false }
            })
    
            await tx.loan.update({ 
                where: { id: loan.id }, 
                data: { 
                    status: 'RETURNED',
                    archived: true,
                    returnDate: new Date(),
                    // Exclui as relações com todas outras tabelas.
                    user: { disconnect: true },
                    book: { disconnect: true },
                    copy: { disconnect: true },
                }
            })

            await tx.adminLog.create({
                data: {
                  adminId: request.user.id,
                  adminName: request.user.name,
                  action: "RETURN",
                  entityType: "LOAN",
                  entityId: String(loan.id),
                  entityName: `Empréstimo N.º ${loan.id}`,
                  time: new Date()
                }
            })

            // Verifica a fila de espera
            const nextInLine = await tx.waitList.findFirst({
                where: { bookId: loan.bookId },
                orderBy: { position: 'asc' }
            })

            if (nextInLine) {
                const copy = await tx.copy.findFirst({
                    where: {
                        bookId: loan.bookId,
                        isLoaned: false 
                    }
                })

                if (!copy) {
                    return reply.code(404).send({ error: "Nenhum exemplar disponível." })
                }

                const expirationDate = new Date()
                expirationDate.setDate(expirationDate.getDate() + 3)

                // Cria o empréstimo.
                const newLoan = await tx.loan.create({
                    data: {
                        userName: nextInLine.userName,
                        userId: nextInLine.userId,
                        bookTitle: loan.bookTitle,
                        bookId: loan.bookId,
                        ISBN: copy.ISBN,
                        copyId: copy.id,
                        expirationDate
                    }
                })

                await tx.copy.update({
                    where: { id: copy.id },
                    data: { isLoaned: true }
                })

                await tx.waitList.delete({ where: { id: nextInLine.id } })

                await tx.waitList.updateMany({
                    where: {
                        bookId: loan.bookId,
                        position: { gt: 1 },
                    },
                    data: {
                        position: { decrement: 1 }
                    }
                })

                // Envia um email notificando o usuário.
                const user = await findUserById(nextInLine.userId)

                await sendEmail(
                    user!.email,
                    'Atualização: Fila de Espera',
                    'waitlist',
                    {
                        name: user!.name,
                        bookTitle: newLoan.bookTitle,
                        date: newLoan.expirationDate!.toLocaleDateString('pt-BR')
                    }
                )
            }
        })

        return reply.code(200).send({ message: "Livro retornado com sucesso!" })
    } catch(err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao retornar o livro." })
    }
}


export async function terminateLoanHandler(
    request: FastifyRequest<{ Body: ManipulateLoanInput }>, 
    reply: FastifyReply
) {
    const { id } = request.body

    try {
        const loan = await findLoanById(id)

        if (!loan) {
            return reply.code(404).send({ error: "Empréstimo não encontrado." })
        }

        // Validação antes de encerrar o empréstimo.
        const loanError = await terminateLoanValidation(loan)

        if (loanError) {
            return reply.code(400).send({ error: loanError })
        }
        
        await prisma.$transaction(async (tx) => {
            if (!loan.bookId || !loan.copyId) {
                return reply.code(404).send({ error: "O livro/exemplar do empréstimo não foi encontrado..." })
            }

            await tx.book.update({
                where: { id: loan.bookId },
                data: { copies: { decrement: 1 } }
              })
  
            await tx.copy.delete({
                where: { id: loan.copyId }
            })

            await tx.loan.update({
                where: { id },
                data: {
                status: "TERMINATED",
                archived: true,
                returnDate: new Date(),
                // Exclui as relações com todas outras tabelas.
                user: { disconnect: true },
                book: { disconnect: true },
                copy: { disconnect: true },
                }
            })

            await tx.adminLog.create({
                data: {
                  adminId: request.user.id,
                  adminName: request.user.name,
                  action: "TERMINATE",
                  entityType: "LOAN",
                  entityId: String(loan.id),
                  entityName: `Empréstimo N.º ${loan.id}`,
                  time: new Date()
                }
            })
        })
        
        return reply.code(200).send({ message: "Empréstimo encerrado com sucesso!" })
    } catch (err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao encerrar o empréstimo do livro." })
    }
}


export async function enterWaitListHandler(
    request: FastifyRequest<{ Body: ManageWaitListInput }>,
    reply: FastifyReply
) {
    const { bookId } = request.body

    try {
        const userId = request.user.id

        const book = await findBookById(bookId)
        const user = await findUserById(userId)

        if (!user || !book) {
            return reply.code(404).send({ error: "Livro/usuário não encontrado..." })
        }

        // Validação antes de entrar na fila de espera.
        const waitListError = await enterWaitListValidation(bookId, userId)

        if (waitListError) {
            return reply.code(400).send({ error: waitListError })
        }

        const position = await prisma.waitList.count({ where: { bookId }}) + 1

        await prisma.waitList.create({
            data: {
                userName: user.name,
                userId,
                bookTitle: book.title,
                bookId,
                position,
            }
        })

        return reply.code(200).send({ position })
    } catch (err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao entrar na lista de espera do livro." })
    }
}


export async function getWaitListPositionHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const userId = String(request.user.id)
        const user = await findUserById(userId)

        if (!user) {
            return reply.code(404).send({ error: "Usuário não encontrado..." })
        }

        const positions = await prisma.waitList.findMany({
            where: { userId },
            select: {
                bookId: true,
                position: true,
                book: {
                    select: {
                        title: true,
                    }
                }
            }
        })

        if (positions.length === 0) {
            return reply.code(404).send({ error: "Usuário não está em nenhuma fila de espera." })
        }

        return reply.code(200).send(positions.map((entry) => ({
            bookId: entry.bookId,
            bookTitle: entry.book.title,
            position: entry.position
        })))
    } catch (err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao obter posição na fila de espera." })
    }
}


export async function exitWaitListHandler(
    request: FastifyRequest<{ Params: ManageWaitListInput }>,
    reply: FastifyReply
) {
    const bookId = Number(request.params.bookId)

    try {
        const userId = request.user.id

        const entry = await findWaitListByIds(bookId, userId)

        if (!entry) {
            return reply.code(404).send({ error: "Fila de espera não encontrada..." })
        }

        await prisma.$transaction(async (tx) => {
            await tx.waitList.delete({ where: { id: entry.id }})

            await tx.waitList.updateMany({
                where: {
                    bookId,
                    position: { gt: entry.position },
                },
                data: {
                    position: {
                        decrement: 1
                    }
                }
            })
        })

        return reply.code(200).send({ message: "Usuário saiu da fila com sucesso!" })
    } catch (err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao sair da fila de espera." })
    }
}
