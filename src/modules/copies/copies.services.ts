import { Copy } from "@prisma/client";
import prisma from "../../utils/prisma.ts";

export function validateISBN(ISBN: string) {
    const cleanISBN = ISBN.replace(/[^0-9X]/gi, '')

    if (cleanISBN.length === 10) {
        let sum = 0

        for (let i = 0; i < 9; i++) {
          sum += (10 - i) * parseInt(cleanISBN[i], 10)
        }

        const checksum = cleanISBN[9] === 'X' ? 10 : parseInt(cleanISBN[9], 10)
        sum += checksum

        if(sum % 11 === 0) {
            return `${cleanISBN.slice(0, 1)}-${cleanISBN.slice(1, 4)}-${cleanISBN.slice(4, 9)}-${cleanISBN[9]}`
        }

        return false
    } else if (cleanISBN.length === 13) {
        let sum = 0

        for (let i = 0; i < 12; i++) {
          sum += parseInt(cleanISBN[i], 10) * (i % 2 === 0 ? 1 : 3)
        }

        const checksum = (10 - (sum % 10)) % 10
        
        if(checksum === parseInt(cleanISBN[12], 10)) {
            return `${cleanISBN.slice(0, 3)}-${cleanISBN.slice(3, 4)}-${cleanISBN.slice(4, 7)}-${cleanISBN.slice(7, 12)}-${cleanISBN[12]}`
        }

        return false
    }

    return false
}

export async function createCopyValidation(ISBN: string) {
    // Verifica se já existe um exemplar com a mesma ISBN.
    const existingCopy = await prisma.copy.findFirst({ where: { ISBN: {equals: ISBN, mode: "insensitive" }}})

    if (existingCopy) {
        return "ISBN já cadastrada no sistema."
    }

    return null
}

export async function editCopyValidation(id: number, ISBN: string) {
    // Verifica se já existe um exemplar com a mesma ISBN.
    const existingCopy = await prisma.copy.findFirst({
        where: {
            ISBN: { equals: ISBN, mode: "insensitive" },
            NOT: { id }
        }
    })

    if (existingCopy) {
        return "ISBN já cadastrada no sistema."
    }

    return null
}

export async function deleteCopyValidation(copy: Copy) {
    // Verifica se o exemplar está em um empréstimo ativo.
    if (copy.isLoaned) {
        return "Exemplar em um empréstimo em andamento."
    }

    return null
}

export async function findCopyById(id: number) {
    try {
        return prisma.copy.findUnique({ where: { id }})
        
    } catch(err) {
        throw(err)
    }
}

export async function getCopyForLoan() {
    try {
        return prisma.copy.findFirst({ where: { isLoaned: false }})
    } catch(err) {
        throw(err)
    }
}
