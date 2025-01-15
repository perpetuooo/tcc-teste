import readline from "readline"
import prisma from "../prisma.ts"

// ---> USAR SOMENTE PARA TESTES <---

function askConfirmation(message: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve) => {
        rl.question(message, (answer) => {
            rl.close()
            resolve(answer.toLowerCase() === 'y')
        })
    })
}

const deleteAllUsers = async () => {
    try {

        const confirm = await askConfirmation("Deseja deletar todos os usuários? (y/n) ")

        if (!confirm) {
            console.log("Cancelado...")
            return
        }

        const users = prisma.user.deleteMany()

        if ((await users).count === 0) {
            console.log("Nenhum usuário encontrado...")
            return
        }

        console.log("Usuários deletados com sucesso!")
    } catch(err) {
        console.error(err)
        return
    }
}


const deleteAllBooks = async () => {
    try {
        const confirm = await askConfirmation("Deseja deletar todos os livros e seus exemplares? (y/n) ")

        if (!confirm) {
            console.log("Cancelado...")
            return
        }

        const copies = await prisma.copy.deleteMany()

        if (copies.count === 0) {
            console.log("Nenhum exemplar encontrado...")
        }
 
        const books = await prisma.book.deleteMany()

        if (books.count === 0) {
            console.log("Nenhum livro encontrado...")
            return
        }

       console.log("Exemplares e/ou livros deletados com sucesso!")
    } catch(err) {
        console.error(err)
        return
    }
}


 const deleteAllLoans = async () => {
    try {
        const confirm = await askConfirmation("Deseja deletar todos os empréstimos? (y/n) ")

        if (!confirm) {
            console.log("Cancelado...")
            return
        }

        const loans = await prisma.loan.deleteMany()

        if (loans.count === 0) {
            console.log("Nenhum empréstimo encontrado...")
            return
        }

       console.log("Empréstimos deletados com sucesso!")
    } catch(err) {
        console.error(err)
        return
    }
}


const deleteAll = async () => {
    try {
        const confirm = await askConfirmation("Deseja deletar todos os recursos? (y/n) ")

        if (!confirm) {
            console.log("Cancelado...")
            return
        }

        await prisma.$transaction([prisma.copy.deleteMany(), prisma.loan.deleteMany(), prisma.book.deleteMany(), prisma.user.deleteMany()])

       console.log("Recursos deletados com sucesso!")
    } catch(err) {
        console.error(err)
        return
    }
}



async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--deleteAllUsers')) {
        await deleteAllUsers()
    
    } else if (args.includes('--deleteAllBooks')) {
        await deleteAllBooks()

    } else if (args.includes('--deleteAllLoans')) {
        await deleteAllLoans()

    } else if (args.includes('--deleteAll')) {
    
        await deleteAll()
    }
}

main()
