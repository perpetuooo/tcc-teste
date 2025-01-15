import cron from 'node-cron';
import prisma from '../../utils/prisma.ts';

export const cancelRequestedLoans = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log("Encerramento de empréstimos requisitados.")

        try {
            // Cancela empréstimos requisitados que não foram iniciados.
            const requestedLoans = await prisma.loan.updateMany({
                where: {
                    expirationDate: { lte: new Date() },
                    status: 'REQUESTED',
                },
                data: { 
                    status: 'TERMINATED' ,
                    archived: true,
                },
            })

            if (requestedLoans.count === 0) {
                console.log("Operação cancelada: nenhum usuário com empréstimos atrasados.")
                return
            }

            console.log("Operação concluída: status de empréstimos atualizados.")
        } catch (err) {
            console.log("Erro ao realizar o encerramento de empréstimos requisitaos.")
            console.error(err)
        }
    })
}