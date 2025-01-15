import fs from 'fs';
import path from 'path';

// Classe para gerenciar dados sobre a aplicação:
//  - Controla a variável da contagem de emails enviados, limitando o envio até 100 emails diários (limite do serviço gratuito da API).
//  - Verifica se a tarefa para notificar usuários com empréstimos atrasados deve ser executada com base em intervalos definidos (principal e de reexecução).
//  - Manipula as regras de negócio do sistema.

interface ConfigData {
  loanDuration: number; // Quantidade de dias que um empréstimo deve durar.
  postponeLoanDuration: number; // Quantidade de dias que um empréstimo pode ser estendido.
  maxBooksLimit: number; //Quantidade máxima de empréstimos por usuário.
  startLoanLimit: number; // Limite de dias para o usuários buscar o livro e começar o empréstimo.
  mainEmailInterval: number; // Intervalo principal de execução (em dias).
  retryEmailInterval: number; // Intervalo de reexecução em caso de falha (em dias).
  dailyEmailLimit: number; // Limite diário de emails (máx 100).
  email: {
    date: string; // Data para ajudar nos processos.
    emailCount: number; // Contagem de emais enviados.
    lastVerifyRun: string; // Data da última execução bem sucedida.
    status: 'SUCCESS' | 'FAILED' // Status da última execução.
  },
}

export class Manager {
  private taskFilePath: string

  constructor() {
    this.taskFilePath = path.resolve('./src/utils/emails/', 'manager-data.json')

    // Se o arquivo não existir, cria os dados iniciais.
    if (!fs.existsSync(this.taskFilePath)) {
      this.resetData();
    }
  }

  // Obtém a data atual no formato padrão ISO (yyyy-mm-dd).
  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0]
  }

  // Lê os dados do arquivo JSON.
  private getData(): ConfigData {
    const data = fs.readFileSync(this.taskFilePath, 'utf-8')
    return JSON.parse(data)
  }

  // Salva os dados no arquivo JSON.
  private saveData(data: ConfigData) {
    fs.writeFileSync(this.taskFilePath, JSON.stringify(data, null, 2))
  }

  // Reseta os dados do arquivo para o estado inicial.
  private resetData() {
    const initialData: ConfigData = {
      loanDuration: 7,
      postponeLoanDuration: 7,
      maxBooksLimit: 3,
      startLoanLimit: 3,
      mainEmailInterval: 5,
      retryEmailInterval: 1,
      dailyEmailLimit: 99,
      email: {
        date: this.getCurrentDate(),
        emailCount: 0,
        lastVerifyRun: '1970-01-01', //Unix epoch.
        status: 'FAILED',
      },
    }
    this.saveData(initialData)
  }

  // Retorna apenas as propriedades de configuração.
  public getConfig(): Omit<ConfigData, 'email'> {
    const data = this.getData()
    const { email, ...config } = data

    return config
  }

 // Atualiza apenas as propriedades de configuração.
  public setConfig(config: Omit<ConfigData, 'email'>) {
    const data = this.getData()
    Object.assign(data, config)

    this.saveData(data)
  }

  // Incrementa a contagem de emails enviados e verifica o limite diário.
  public incrementEmailCount(): boolean {
    const data = this.getData()
    const currentDate = this.getCurrentDate()

    // Limite diário atingido.
    if (data.email.emailCount >= data.dailyEmailLimit) {
      return false
    }

    // Reinicia a contagem se for um novo dia.
    if (data.email.date !== currentDate) {
      data.email.date = currentDate
      data.email.emailCount = 0
    }

    data.email.emailCount += 1
    this.saveData(data)
    return true
  }

  // Obtém o número de emails restantes para envio.
  public getRemainingEmails(): number {
    const data = this.getData()
    return data.dailyEmailLimit - data.email.emailCount
  }

  // Verifica se a tarefa de notificar os usuários atrasados deve ser executada ou reagendada.
  public shouldNotifyUsers(): boolean {
    const data = this.getData()
    const lastRunDate = new Date(data.email.lastVerifyRun)
    const today = new Date()

    const diffDays = Math.floor(
      (today.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Se já passou o intervalo principal.
    if (diffDays >= data.mainEmailInterval) {
      return true
    }

    // Se está no período de reexecução.
    if (data.email.status === 'FAILED' && diffDays >= data.retryEmailInterval) {
      return true
    }

    console.log(`Tarefa não será executada hoje. Última execução bem-sucedida foi há ${diffDays} dias.`)
    return false
  }

  // Atualiza o status da tarefa após execução.
  public updateTaskStatus(success: boolean) {
    const data = this.getData()
    data.email.lastVerifyRun = this.getCurrentDate()
    data.email.status = success ? 'SUCCESS' : 'FAILED'
    this.saveData(data)
  }
}
