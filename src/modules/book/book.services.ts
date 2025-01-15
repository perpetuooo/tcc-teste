import prisma from "../../utils/prisma.ts";

export async function registerBookValidation(title: string) {
    // Verifica se já existe um livro com o mesmo título.
    const existingBook = await prisma.book.findFirst({ where: { title: { equals: title, mode: "insensitive" }}})
    
    if (existingBook) {
        return "Outro livro com o mesmo título já existe."
    }

    return null
}

export async function updateBookValidation(id: number, title: string) {
    // Verifica se já existe um livro com o mesmo título.
    const existingBook = await prisma.book.findFirst({ 
        where: { 
            title: { equals: title, mode: "insensitive" },
            NOT: { id }
        }
    })

    if (existingBook) {
        return "Outro livro com o mesmo título já existe."
    }

    return null
}

export async function deleteBookValidation(title: string) {
    // Verifica se o livro ainda tem algum exemplar com um empréstimo ativo.
    const existingLoans = await prisma.loan.count({
        where: {
            bookTitle: title,
            status: 'ONGOING',
        }
    })

    if (existingLoans > 0) {
        return "Livro contém empréstimos em andamento."
    }

    return null
}

export async function createCategoryValidation(name: string) {
    // Verifica se já existe uma categoria com o mesmo nome.
    const existingCategory = await prisma.category.findFirst({ where: { name: { equals: name, mode: "insensitive" }}})

    if (existingCategory) {
        return "Outra categoria com o mesmo nome já existe."
    }

    return null
}

export async function findBookByTitle(title: string) {
    try {
        return prisma.book.findUnique({ where: { title } })
        
    } catch(err) {
        throw(err)
    }
}

export async function findBookById(id: number) {
    try {
        return prisma.book.findUnique({ where: { id } })
        
    } catch(err) {
        throw(err)
    }
}

export async function findCategoryById(id: number) {
    try {
        return prisma.category.findUnique({ where: { id } })
        
    } catch(err) {
        throw(err)
    }
}
