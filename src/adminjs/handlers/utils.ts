import { ActionContext, ActionRequest, ActionResponse, ForbiddenError, PageHandler } from "adminjs";
import prisma from "../../utils/prisma.ts";
import { format } from "date-fns";
import { Manager } from "@/src/utils/manager.ts";

type LoanStatusCount = {
  REQUESTED: number
  ONGOING: number
  OVERDUE: number
  RETURNED: number
  TERMINATED: number
}

export async function populateDashboardHandler() {
  try {
    // Total de usuários, livros, exemplares e categorias.
    const totalUsers = await prisma.user.count()
    const totalBooks = await prisma.book.count()
    const totalCopies = await prisma.copy.count()
    const totalCategories = await prisma.category.count()

    // Calcula últimos 30 dias
    const now = new Date()
    const last30Days = new Date()
    last30Days.setDate(now.getDate() - 29)

    // Empréstimos dos últimos 30 dias.
    const loans = await prisma.loan.findMany({
      where: {
        createdAt: {
          gte: last30Days,
        },
      },
    })


    const loansByDay: Record<string, LoanStatusCount> = {}

    loans.forEach((loan) => {
      const loanStartDate = new Date(loan.loanDate || loan.createdAt)
      const loanEndDate = new Date(
        loan.status === "RETURNED" || loan.status === "TERMINATED"
          ? loan.returnDate || loan.updatedAt
          : now
      )

      // Itera sobre os dias do intervalo.
      for (
        let date = loanStartDate;
        date <= loanEndDate;
        date.setDate(date.getDate() + 1)
      ) {
        const dayKey = format(new Date(date), "dd/MM")

        if (!loansByDay[dayKey]) {
          loansByDay[dayKey] = {
            REQUESTED: 0,
            ONGOING: 0,
            OVERDUE: 0,
            RETURNED: 0,
            TERMINATED: 0,
          }
        }

        if (["ONGOING", "REQUESTED", "OVERDUE"].includes(loan.status)) {
          loansByDay[dayKey][loan.status]++
        } else if (["RETURNED", "TERMINATED"].includes(loan.status)) {
          if (format(new Date(loanEndDate), "dd/MM") === dayKey) {
            loansByDay[dayKey][loan.status]++
          }
        }
      }
    })

    // Obter as categorias com a quantidade de livros, exemplares e exemplares disponíveis.
    const categoriesRaw = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        books: {
          select: {
            id: true,
            copies: true,
            copiesAvailable: true,
            loans: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    const categories = await Promise.all(
      categoriesRaw.map(async (category) => {
        const bookCount = category.books.length

        // Contagem total de empréstimos, exemplares e exemplares disponíveis.
        let totalCopiesCount = 0
        let availableCopiesCount = 0
        let totalLoansCount = 0

        // Itera sobre cada livro para somar os exemplares e exemplares disponíveis.
        category.books.forEach((book) => {
          totalCopiesCount += book.copies
          availableCopiesCount += book.copiesAvailable
          totalLoansCount += book.loans.length
        })

        return {
          categoryName: category.name,
          bookCount,
          totalCopies: totalCopiesCount,
          availableCopies: availableCopiesCount,
          totalLoans: totalLoansCount,
        }
      })
    )

    // Selecionar as 5 categorias com mais empréstimos.
    const topCategories = categories
    .sort((a, b) => b.totalLoans - a.totalLoans)
    .slice(0, 5)

    // Instancia a classe Manager para obter os dados de email.
    const manager = new Manager()
    const totalSent = 99 - manager.getRemainingEmails()
    const remaining = manager.getRemainingEmails()

    // Prepara os dados para o dashboard.
    const data = {
      card: {
        totalUsers,
        totalBooks,
        totalCopies,
        totalCategories,
      },
      loansByDay,
      categories: topCategories,
      emails: {
        totalSent,  
        remaining,
      },
    }

    return data
  } catch (err) {
    console.error(err)
    throw new ForbiddenError("Erro ao popular o dashboard.")
  }
}


export const settingsPageHandler: PageHandler = async (request, response, context) => {
  const manager = new Manager()

  if (request.method === 'get') {
    return {
      config: manager.getConfig()
    }
  }

  if (request.method === 'post') {
    const config = request.payload
    manager.setConfig(config)
    return {
      config: manager.getConfig(),
      notice: {
        message: 'Configurações atualizadas com sucesso!',
        type: 'success'
      }
    }
  }
}


export async function populateBooksHook(response: ActionResponse, request: ActionRequest,  context: ActionContext) {
  // Itera sobre todos os registros.
  if (response.records) {
    for (const record of response.records) {
      const categoryId = record?.params?.id

      if (categoryId) {
        const bookCount = await prisma.book.count({
          where: { categoryId: Number(categoryId) },
        })

        record.params.books = bookCount
      }
    }
  }

  return response
}


export async function activeLoansBeforeHook(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  try {
    if (!request.query) {
      request.query = {}
    }

    // Cria o filtro de empréstimos ativos e retorna a requisição.
    request.query.filters = {
      ...request.query.filters,
      archived: false,
    }

    return request
  } catch(err) {
    console.error(err)

    return {
      notice: {
        message: 'Erro ao visualizar os empréstimos. Tente novamente.',
        type: 'error',
      },
    }
  }
}


export async function archivedLoansBeforeHook(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  try {
    if (!request.query) {
      request.query = {}
    }

    // Cria o filtro de empréstimos arquivados e retorna a requisição.
    request.query.filters = {
      ...request.query.filters,
      archived: true,
    }

    return request
  } catch(err) {
    console.error(err)

    return {
      notice: {
        message: 'Erro ao visualizar os empréstimos. Tente novamente.',
        type: 'error',
      },
    }
  }
}
