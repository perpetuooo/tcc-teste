import { FastifyReply, FastifyRequest } from "fastify";
import { CreateCategoryInput, DeleteBookInput, DeleteCategoryInput, GetBookDetailsInput, GetBooksInput, RegisterBookInput, UpdateBookInput } from "./book.schemas.ts";
import prisma from "../../utils/prisma.ts";
import { createCategoryValidation, deleteBookValidation, findBookById, findCategoryById, registerBookValidation, updateBookValidation } from "./book.services.ts";

export async function getBooksHandler(
  request: FastifyRequest<{ Querystring: GetBooksInput }>, 
  reply: FastifyReply
) {
  const { title, category } = request.query

  try {
      const books = await prisma.book.findMany({
        where: {
          AND: [
            title ? { title: { contains: title, mode: 'insensitive' }} : {},
            category ? { category: { name: { contains: category, mode: 'insensitive' }}} : {},
          ]
        },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          category: true,
        },
      })

      if (books.length === 0) {
        return reply.code(404).send({ error: "Nenhum livro encontrado..." })
      }

    return reply.code(200).send(books)
  } catch(err) {
    console.error(err)
    return reply.code(500).send({ error: "Erro ao obter livros." })
  }
}


export async function getBookDetailsHandler(
  request: FastifyRequest<{ Params: GetBookDetailsInput }>,
  reply: FastifyReply
) {
  const { id } = request.params

    try {
      const book = await prisma.book.findUnique({
        where: {
          id: Number(id)
        },
        select: {
          id: true,
          imageUrl: true,          
          title: true,
          description: true,
          author: true,
          categoryId: false,
          copies: true,
          copiesAvailable: true,
          createdAt: false,
          updatedAt: false,     
          category: true,
        },
      })

      if (!book) {
        return reply.code(404).send({ error: "Livro não encontrado..." })
      }

      return reply.code(200).send(book)
    } catch(err) {
      console.error(err)
      return reply.code(500).send({ error: "Erro ao obter os detalhes dos livros." })
    }
  }


export async function registerBookHandler(
  request: FastifyRequest<{ Body: RegisterBookInput }>,
  reply: FastifyReply
) {
  const { title, description, category, author, imageUrl } = request.body

  try {
    // Validação antes de registrar novo livro.
    const bookError = await registerBookValidation(title)

    if (bookError) {
      return reply.code(400).send({ error: bookError })
    }

    const result = await prisma.$transaction(async (tx) => {
      const book = await tx.book.create({
        data: {
          title,
          description,
          author,
          imageUrl,
          category: category? { connect: { id: Number(category) } } : undefined,
        }
      })
  
      await tx.adminLog.create({
        data: {
          adminId: request.user.id,
          adminName: request.user.name,
          action: "CREATE",
          entityType: "BOOK",
          entityId: String(book.id),
          entityName: book.title,
          time: new Date(),
        }
      })

      return book
    })

    return reply.code(201).send(result)
  } catch(err) {
    console.error(err)
    return reply.code(500).send({ error: "Erro ao registrar novo livro." })
  }
}


export async function updateBookHandler(
  request: FastifyRequest<{ Body: UpdateBookInput }>,
  reply: FastifyReply
) {
  const { id, title, category, ...data } = request.body

  try {
    const book = await findBookById(id)
    
    if (!book) {
      return reply.code(404).send({ error: "Livro não encontrado..." })
    }

    // Validação antes de atualizar livro.
    const bookError = await updateBookValidation(id, title)

    if (bookError) {
      return reply.code(400).send({ error: bookError })
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedBook = await tx.book.update({
        where: { id },
        data: {
          title,
          category: category ? { connect: { id: Number(category) } } : { disconnect: true },
          ...data,
        },
      })

      await tx.adminLog.create({
        data: {
          adminId: request.user.id,
          adminName: request.user.name,
          action: "UPDATE",
          entityType: "BOOK",
          entityId: String(book.id),
          entityName: book.title,
          time: new Date(),
        },
      })

      return updatedBook
    })

    return reply.code(200).send(result)
  } catch(err) {
    console.error(err)
    return reply.code(500).send({ error: "Erro ao atualizar livro." })
  }
}


export async function deleteBookHandler(
  request: FastifyRequest<{ Params: DeleteBookInput }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id)

  try {
    const book = await findBookById(id)

    if (!book) {
      return reply.code(404).send({ error: "Livro não encontrado..." })
    }

    // Validação antes de deletar o livro e seus exemplares.
    const bookError = await deleteBookValidation(book.title)

    if (bookError) {
      return reply.code(400).send({ error: bookError })
    }

    const copies = await prisma.copy.findMany({
      where: { bookTitle: book.title },
    })

    await prisma.$transaction(async (tx) => {
      await tx.copy.deleteMany({
        where: { bookTitle: book.title },
      })

      await tx.book.delete({
        where: { id },
      })

      for (const copy of copies) {
        await tx.adminLog.create({
          data: {
            adminId: request.user.id,
            adminName: request.user.name,
            action: "DELETE",
            entityType: "COPY",
            entityId: String(copy.id),
            entityName: copy.ISBN,
            time: new Date(),
          },
        })
      }

      await tx.adminLog.create({
        data: {
          adminId: request.user.id,
          adminName: request.user.name,
          action: "DELETE",
          entityType: "BOOK",
          entityId: String(book.id),
          entityName: book.title,
          time: new Date(),
        },
      })
    })

    return reply.code(200).send({ message: "Livro e seus exemplares deletados com sucesso!" })
  } catch (err) {
    console.error(err)
    return reply.code(500).send({ error: "Erro ao deletar livro." })
  }
}


export async function createCategoryHandler(
  request: FastifyRequest<{ Body: CreateCategoryInput }>,
  reply: FastifyReply
) {
  const { name } = request.body

  try {
    // Validação antes de criar nova categoria.
    const categoryError = await createCategoryValidation(name)

    if (categoryError) {
      return reply.code(400).send({ error: categoryError })
    }

    const result = await prisma.$transaction(async (tx) => {
      const category = await tx.category.create({ data: { name }})
    
      await tx.adminLog.create({
        data: {
          adminId: request.user.id,
          adminName: request.user.name,
          action: "CREATE",
          entityType: "CATEGORY",
          entityId: String(category.id),
          entityName: category.name,
          time: new Date(),
        }
      })

      return category
    })

    return reply.code(201).send(result)
  } catch(err) {
    console.log(err)
    return reply.code(500).send({ error: "Erro ao criar nova categoria." })
  }
}


export async function deleteCategoryHandler(
  request: FastifyRequest<{ Params: DeleteCategoryInput }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id)
  
  try {
    const category = await findCategoryById(id)
  
    if (!category) {
      return reply.code(404).send({ error: "Categoria não encontrada..." })
    }

    await prisma.$transaction(async (tx) => {
      await tx.category.delete({ where: { id }})

      await tx.adminLog.create({
        data: {
          adminId: request.user.id,
          adminName: request.user.name,
          action: "DELETE",
          entityType: "CATEGORY",
          entityId: String(category.id),
          entityName: category.name,
          time: new Date()
        }
      })
    })

    return reply.code(200).send({ message: "Categoria deletada com sucesso!" })
  } catch(err) {
    console.log(err)
    return reply.code(500).send({error: "Erro ao deletar categoria." })    
  }
}
