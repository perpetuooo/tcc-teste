import { User } from "@prisma/client";
import prisma from "../../utils/prisma.ts";
import bcrypt from 'bcrypt';

export function validateCPF(cpf: string) {
    cpf = cpf.replace(/[^\d]+/g, '')

    if (/^(\d)\1{10}$/.test(cpf)) {
        return false
    }

    const calculateDigit = (base: string, factor: number): number => {
        let total = 0

        for (let i = 0; i < base.length; i++) {
            total += parseInt(base.charAt(i)) * factor--
        }

        const resto = total % 11

        return resto < 2 ? 0 : 11 - resto
    }

    const digit1 = calculateDigit(cpf.substring(0, 9), 10)
    const digit2 = calculateDigit(cpf.substring(0, 9) + digit1, 11)

    if (digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10))) {
        return true
   
    } else {
        return false
    }
}


export function validatePhone(phone: string) {
    phone = phone.replace(/[^\d]+/g, '')

    if (!/^(\d{2})9\d{8}$/.test(phone)) {
        return false
    }

    return true
}


// https://www.npmjs.com/package/bcrypt#a-note-on-rounds
export async function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(12, (err, salt) => {
            if (err) {
                reject(err)
                return
            }

            bcrypt.hash(password, salt, (err, hashedPassword) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(hashedPassword)
            })
        })
    })
}


export function formatPhone(phone: string) {
    // Remove caracteres não numéricos.
    const cleaned = phone.replace(/\D/g, "")

    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")
}


export function formatCPF(cpf: string) {
    // Remove caracteres não numéricos.
    const cleaned = cpf.replace(/\D/g, "")

    return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
}


export async function registerUserValidation(name: string, email: string, cpf: string, phone: string) {
    // Verifica se há conflito no nome, email ou CPF do usuário.
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { equals: email, mode: "insensitive" } },
                { cpf: { equals: cpf, mode: "insensitive" } },
                { name: { equals: name, mode: "insensitive" } },
                { phone: { equals: phone, mode: "insensitive" } },
            ]
        }
    })

    if (existingUser) {
        if (existingUser.email === email) {
            return "Este email já está cadastrado."
        }
        if (existingUser.cpf === cpf) {
            return "Este CPF já está cadastrado."
        }
        if (existingUser.name === name) {
            return "Este nome já está cadastrado."
        }
    }

    return null
}

export async function updateUserValidation(id: string, name: string, email: string, phone: string) {
    // Verifica se há conflito no nome ou email.
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { equals: email, mode: "insensitive" } },
                { name: { equals: name, mode: "insensitive" } },
                { phone: { equals: phone, mode: "insensitive" } },
            ],
            NOT: { id }
        }
    })

    if (existingUser) {
        if (existingUser.email === email) {
            return "Este email já está cadastrado."
        }

        if (existingUser.name === name) {
            return "Este nome já está cadastrado."
        }

        if (existingUser.phone === phone) {
            return "Este telefone já está cadastrado."
        }
    }

    return null
}

export async function deleteUserValidation(user: User) {
    // Verifica se o usuário possui empréstimos ativos.
    const activeLoans = await prisma.loan.count({
        where: {
            userId: user.id,
            status: 'ONGOING'
        }
    })

    if (activeLoans > 0) {
        return "Usuário ainda possui empréstimos ativos."
    }

    return null
}

export async function verifyPassword(userInput: string, storedHash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        bcrypt.compare(userInput, storedHash, (err, result) => {
            if (err) {
                reject(err)
                return
            }
            
            resolve(result)
        })
    })
}


export async function findUserByEmail(email: string) {
    try {
        return prisma.user.findUnique({
            where: { email }
        })

    } catch(err) {
        console.error(err)
        throw err
    }
}


export async function findUserById(id: string) {
    try {
        return prisma.user.findUnique({
            where: { id }
        })

    } catch(err) {
        console.error(err)
        throw err
    }
}


