import { Book, Loan, User } from "@prisma/client";
import prisma from "../../utils/prisma.ts";
import { subDays, addDays, isWeekend } from 'date-fns';

// Ajusta a data de expiração para não considerar sábados e domingos.
export function adjustExpirationDate(startDate: Date, daysToAdd: number): Date {
    let adjustedDate = new Date(startDate)
    
    // Se a data inicial cair em um final de semana, ajustar para segunda-feira.
    if (isWeekend(adjustedDate)) {
        const daysToNextMonday = adjustedDate.getDay() === 6 ? 2 : 1
        adjustedDate = addDays(adjustedDate, daysToNextMonday)
    }

    // Adiciona os dias úteis ignorando finais de semana.
    let addedDays = 0
    while (addedDays < daysToAdd) {
        adjustedDate = addDays(adjustedDate, 1)
        if (!isWeekend(adjustedDate)) {
            addedDays++
        }
    }

    return adjustedDate
}

export async function createLoanValidation(user: User, book: Book) {
    // Verifica se o usuário está bloqueado.
    if (user.isBlocked) {
        return "Usuário está bloqueado."
    }

    // Verifica se o usuário tem empréstimos atrasados.
    const overdueLoans = await prisma.loan.count({
        where: {
            userId: user.id,
            returnDate: { lte: new Date() },
            status: "ONGOING"
        }
    })
    
    if (overdueLoans > 0) {
        return "Usuário possui empréstimos em atraso."
    }
    
    // Verifica se há cópias disponíveis do livro.
    if (book.copiesAvailable <= 0) {
        return "Não há cópias disponíveis deste livro."
    }

    // Verifica se o usuário já possui 3 empréstimos ativos.
    const activeLoansCount = await prisma.loan.count({
        where: {
            userId: user.id,
            status: "ONGOING",
        }
    })

    if (activeLoansCount >= 3) {
        return "Usuário já possui 3 empréstimos ativos."
    }

    // Verifica se o usuário já possui uma cópia do livro.
    const existingLoan = await prisma.loan.findFirst({
        where: {
            userId: user.id,
            bookId: book.id,
        }
    })

    if (existingLoan) {
        return "Usuário já possui um empréstimo deste livro."
    }

    // Verifica se o usuário já fez um empréstimo do livro nos últimos 7 dias.
    const recentLoan = await prisma.loan.findFirst({
        where: {
            userId: user.id,
            bookId: book.id,
            returnDate: {
                gte: subDays(new Date(), 7)
            }
        }
    })

    if (recentLoan) {
        return "Usuário realizou um empréstimo deste livro nos últimos 7 dias, espere uma semana e tente novamente."
    }

    return null
}

export async function postponeLoanValidation(loan: Loan) {
    // Verifica se o empréstimo já foi adiado.
    if (loan.postponed) {
        return "O empréstimo só pode ser adiado uma vez."
    }

    // Verifica se o empréstimo já foi iniciado.
    if (!loan.loanDate) {
        return "O empréstimo ainda não começou."
    }
    
    // Verifica se o empréstimo já foi encerrado ou retornado.
    if (loan.status === "RETURNED" || loan.status === "TERMINATED") {
        return "O empréstimo já foi encerrado."
    }

    // Verifica se existe alguém na fila de espera.
    if (loan.bookId) {
        const somebodyWaiting = await prisma.waitList.findFirst({ where: { bookId: loan.bookId }})

        if (somebodyWaiting) {
            return "Existe alguém na fila de espera desse livro."
        }
    }
    
    return null
}

export async function terminateLoanValidation(loan: Loan) {
    // Verifica se o empréstimo já foi encerrado ou retornado.
    if (loan.status === "RETURNED" || loan.status === "TERMINATED") {
        return "O empréstimo já foi encerrado."
    }

    return null
}

export async function enterWaitListValidation(bookId: number, userId: string) {
    // Verifica se o livro possui exemplares disponíveis.
    const copiesAvailable = await prisma.copy.count({
        where: {
            bookId,
            isLoaned: false
        }
    })

    if (copiesAvailable > 0) {
        return "O livro possui exemplares disponíveis."
    }
    
    // Verifica se o usuário já está na fila de espera.
    const alreadyOnIt = await prisma.waitList.findFirst({
        where: {
           bookId: bookId,
           userId: userId,
        }
    })
    
    if (alreadyOnIt) {
        return "Usuário já está na fila de espera para este livro."
    }

    // Verifica se o usuário já está em outras 3 filas de espera.
    const waitListCount = await prisma.waitList.count({
        where: { 
            bookId: bookId,
            userId: userId,
        }
    })

    if (waitListCount >= 3) {
        return "Usuário já está em outras 3 filas de espera."
    }

    return null
}

export async function findLoanById(id: number) {
    try {
        return prisma.loan.findUnique({ where: { id } })

    } catch(err) {
        throw(err)
    }
}

export async function findWaitListByIds(bookId: number, userId: string) {
    try {
        return prisma.waitList.findFirst({
            where: {
                userId,
                bookId
            }
        })
    } catch(err) {
        throw(err)
    }
}
