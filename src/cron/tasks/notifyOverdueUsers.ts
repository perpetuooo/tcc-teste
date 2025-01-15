import { sendEmail } from "../../utils/emails/services.ts";
import { Manager } from "../../utils/manager.ts";
import prisma from '../../utils/prisma.ts';
import cron from 'node-cron';

export const notifyOverdueUsers = () => {
    cron.schedule('0 23 * * *' , async () => {
        console.log("Notificando usuários sobre seus empréstimos atrasados.")

        const taskManager = new Manager()

        // Verificar se a tarefa deve ser executada
        if (!taskManager.shouldNotifyUsers()) {
            return
        }

        try {
            const overdueUsers = await prisma.user.findMany({   
                where: { loans: { some: { status: 'OVERDUE' }}},
                include: { loans: { where: { status: 'OVERDUE'}}},
            })

            if (overdueUsers.length === 0) {
                console.log("Operação cancelada: Nenhum usuário com empréstimos atrasados.")

                // Marca como falha para tentar novamente no dia seguinte.
                taskManager.updateTaskStatus(false)
                return
            }

            if (overdueUsers.length >= taskManager.getRemainingEmails()) {
                console.log(`Operação cancelada: ${overdueUsers.length} usuários para ${taskManager.getRemainingEmails()} emails disponíveis.`)

                // Marca como falha para tentar novamente no dia seguinte.
                taskManager.updateTaskStatus(false)
                return
            }

            for (const user of overdueUsers) {
                const overdueLoans = user.loans.map(loan => ({
                    bookTitle: loan.bookTitle,
                    expirationDate: loan.expirationDate!.toLocaleDateString('pt-BR')
                }))

                await sendEmail(
                    user.email,
                    'Empréstimos atrasados',
                    'overdue-loans',
                    {
                        name: user.name,
                        loans: overdueLoans.map(
                            loan => `<li>${loan.bookTitle} - vencido em ${loan.expirationDate}</li>`
                          ).join(''),
                    }
                )
            }
            
            console.log("Operação concluída: notificações enviadas com sucesso.")
            taskManager.updateTaskStatus(true)
        } catch (err) {
            console.log("Erro ao notificar usuários atrasados.")
            console.error(err)
            taskManager.updateTaskStatus(false)
        }
    })
}
