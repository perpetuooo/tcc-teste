import { FastifyReply, FastifyRequest } from "fastify";
import { CreateCopyInput, DeleteCopyInput, EditCopyInput } from "./copies.schemas.ts";
import prisma from "../../utils/prisma.ts";
import { createCopyValidation, deleteCopyValidation, editCopyValidation, findCopyById, validateISBN } from "./copies.services.ts";
import { findBookById } from "../book/book.services.ts";

export async function createCopyHandler(
    request: FastifyRequest<{ Body: CreateCopyInput }>,
    reply: FastifyReply,
) {
    const { bookId, ISBN, ...data } = request.body

    try {
        const book = await findBookById(bookId)

        if (!book) {
            return reply.code(404).send({ error: "Livro não encontrado..." })
        }

        // Formatação e validação da ISBN.
        const formattedISBN = validateISBN(ISBN)

        if (!formattedISBN) {
            return reply.code(400).send({ error: "ISBN inválido." })
        }

        // Validação antes de criar novo exemplar.
        const copyError = await createCopyValidation(formattedISBN)

        if (copyError) {
            return reply.code(400).send({ error: copyError })
        }

        const result = await prisma.$transaction(async (tx) => {
            const copy = await tx.copy.create({
                data: {
                    bookId,
                    ISBN: formattedISBN,
                    bookTitle: book.title,
                    ...data
                }
            })
    
            await tx.book.update({
                where: { id: bookId },
                data: {
                    copies: { increment: 1 },
                    copiesAvailable: { increment: 1 },
                },
            })

            await tx.adminLog.create({
                data: {
                  adminId: request.user.id,
                  adminName: request.user.name,
                  action: "CREATE",
                  entityType: "COPY",
                  entityId: String(copy.bookId),
                  entityName: copy.ISBN,
                  time: new Date()
                }
            })

            return copy
        })

        return reply.code(201).send(result)
    } catch(err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao criar o exemplar de livro." })
    }
}


export async function editCopyHandler(
    request: FastifyRequest<{ Body: EditCopyInput }>,
    reply: FastifyReply,
) {
    const { id, ISBN, condition } = request.body

    try {
        const copy = await findCopyById(id)
    
        if (!copy) {
            return reply.code(404).send({ error: "Exemplar não encontrado..." })
        }

        // Validação antes de atualizar exemplar.
        const copyError = await editCopyValidation(copy.id, ISBN)

        if (copyError) {
            return reply.code(400).send({ error: copyError })
        }
    
        const result = await prisma.$transaction(async (tx) => {
            const editedCopy = await tx.copy.update({
                where: { id },
                data: {
                    ISBN,
                    condition,
                }
            })

            await tx.adminLog.create({
                data: {
                  adminId: request.user.id,
                  adminName: request.user.name,
                  action: "UPDATE",
                  entityType: "COPY",
                  entityId: String(copy.bookId),
                  entityName: copy.ISBN,
                  time: new Date()
                }
            })

            return editedCopy
        })

        return reply.code(200).send(result)
    } catch(err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao editar o exemplar do livro." })
    }
}


export async function deleteCopyHandler(
    request: FastifyRequest<{ Params: DeleteCopyInput }>,
    reply: FastifyReply,
) {
    const id = Number(request.params.id)

    try {
        const copy = await findCopyById(id)

        if (!copy) {
            return reply.code(404).send({ error: "Exemplar não encontrado..." })
        }

        // Validação antes de deletar exemplar.
        const copyError = await deleteCopyValidation(copy)

        if (copyError) {
            return reply.code(400).send({error: copyError })
        }

        await prisma.$transaction(async (tx) => {
            await tx.book.update({
                where: { title: copy.bookTitle },
                data: {
                    copies: { decrement: 1 },
                    copiesAvailable: { decrement: 1 },
                }
            })
    
            await tx.copy.delete({
                where: { id }
            })

            await tx.adminLog.create({
                data: {
                  adminId: request.user.id,
                  adminName: request.user.name,
                  action: "DELETE",
                  entityType: "COPY",
                  entityId: String(copy.bookId),
                  entityName: copy.ISBN,
                  time: new Date()
                }
            })
        })

        return reply.code(200).send({ message: "Exemplar deletado com sucesso!" })
    } catch(err) {
        console.error(err)
        return reply.code(500).send({ error: "Erro ao deletar o exemplar do livro." })
    }
}
