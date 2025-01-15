import cron from 'node-cron';
import prisma from '../../utils/prisma.ts';

export const verifyOverdueLoans = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log("Verificação de empréstimos atrasados.")

        try {
            // Cancela empréstimos requisitados que não foram iniciados.
            const overdueLoans = await prisma.loan.updateMany({
                where: {
                    expirationDate: { lte: new Date() },
                    status: 'ONGOING',
                },
                data: { status: 'OVERDUE' },
            })

            if (overdueLoans.count === 0) {
                console.log("Operação cancelada: usuários com empréstimos atrasados não encontrados.")
                return
            }

            console.log("Operação concluída: status de empréstimos atualizados.")

            // Bloqueia usuários com empréstimos atrasados.
            const usersWithOverdueLoans = await prisma.user.updateMany({
                where: {
                    loans: {
                        some: {
                            status: 'OVERDUE',
                        },
                    },
                },
                data: {
                    isBlocked: true,
                },
            })

            if (usersWithOverdueLoans.count > 0) {
                console.log(`${usersWithOverdueLoans.count} usuários bloqueados devido a empréstimos atrasados.`)
            } else {
                console.log("Nenhum usuário bloqueado.")
            }
        } catch (err) {
            console.log("Erro ao realizar o verificação de empréstimos requisitados.")
            console.error(err)
        }
    })
}