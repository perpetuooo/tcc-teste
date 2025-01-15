import { cancelRequestedLoans } from "./tasks/cancelRequestedLoans.ts";
import { notifyOverdueUsers } from "./tasks/notifyOverdueUsers.ts";
import { verifyOverdueLoans } from "./tasks/verifyOverdueLoans.ts";

export function executeTasks() {
    console.log("Iniciando o agendamento de tarefas assíncronas...")

    cancelRequestedLoans()
    verifyOverdueLoans()
    notifyOverdueUsers()

    console.log("Tarefas agendadas com sucesso.")
}