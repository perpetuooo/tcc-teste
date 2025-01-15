import { ActionContext, ActionRequest, ActionResponse, ForbiddenError } from "adminjs";
import { ManipulateLoanInput } from "../../modules/loan/loan.schemas.ts";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config()

export async function startLoanApiHandler(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  const { id } = context.record?.params as ManipulateLoanInput

  // Retorna em caso de payload vazio.
  if (!id) {
    return {
      record: context.record?.toJSON()
    }
  }

  try {
    const apiResponse = await axios.put(`http://${process.env.HOST}:${process.env.PORT}/api/loans/start`, 
      {
        id
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context.currentAdmin?.access_token}`,
        },
      }
    )

    const record = await context._admin.findResource('ActiveLoans').findOne(apiResponse.data.id)

    return {
      record: record?.toJSON(context.currentAdmin),
      notice: {
        message: `Empréstimo iniciado com sucesso!`,
        type: 'success',
      },
      redirectUrl: `/admin/resources/ActiveLoans/records/${id}/show`
    }
  } catch(err) {
    console.error(err)

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error || 'Erro ao iniciar o empréstimo. Tente novamente.'

      throw new ForbiddenError(errorMessage)
    } else {
      throw new ForbiddenError('Erro ao iniciar o empréstimo. Tente novamente.')
    }
  }
}
  
  
export async function returnLoanApiHandler(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  const { id } = context.record?.params as ManipulateLoanInput

  // Retorna em caso de payload vazio.
  if (!id) {
    return {
      record: context.record?.toJSON()
    }
  }

  try {
    await axios.put(`http://${process.env.HOST}:${process.env.PORT}/api/loans/return`, 
      {
        id
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context.currentAdmin?.access_token}`,
        },
      }
    )

    return {
      record: context.record?.toJSON(context.currentAdmin),
      notice: {
        message: `Empréstimo concluído com sucesso!`,
        type: 'success',
      },
      redirectUrl: `/admin/resources/ActiveLoans`,
    }
  } catch (err) {
    console.error(err)

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error || 'Erro ao retornar o empréstimo. Tente novamente.'

      throw new ForbiddenError(errorMessage)
    } else {
      throw new ForbiddenError('Erro ao retornar o empréstimo. Tente novamente.')
    }
  }
}


export async function terminateLoanApiHandler(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  const { id } = context.record?.params as ManipulateLoanInput

  // Retorna em caso de payload vazio.
  if (!id) {
    return {
      record: context.record?.toJSON()
    }
  }

  try {
    await axios.put(`http://${process.env.HOST}:${process.env.PORT}/api/loans/terminate`, 
      {
        id
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context.currentAdmin?.access_token}`,
        },
      }
    )

    return {
      record: context.record?.toJSON(context.currentAdmin),
      notice: {
        message: `Empréstimo encerrado com sucesso!`,
        type: 'success',
      },
      redirectUrl: `/admin/resources/ActiveLoans`,
    }
  } catch (err) {
    console.error(err)

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error || 'Erro ao encerrar o empréstimo. Tente novamente.'

      throw new ForbiddenError(errorMessage)
    } else {
      throw new ForbiddenError('Erro ao encerrar o empréstimo. Tente novamente.')
    }
  }
}
