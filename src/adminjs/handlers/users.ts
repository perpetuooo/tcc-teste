import { DeleteUserInput, UpdateUserInput } from "../../modules/user/user.schemas.ts";
import { ActionContext, ActionRequest, ActionResponse, ForbiddenError } from "adminjs";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config()

export async function editUserApiHandler(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  const { id, name, email, phone, role, isBlocked  } = request.payload as UpdateUserInput

  // Retorna em caso de payload incompleto ou vazio.
  if (!id || !email || !phone || !role || isBlocked === undefined) {
    return {
      record: context.record?.toJSON()
    }
  }

  try {
    const apiResponse = await axios.put(`http://${process.env.HOST}:${process.env.PORT}/api/users/update`, 
      {
        id,
        name,
        email,
        phone,
        role,
        isBlocked,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context.currentAdmin?.access_token}`,
        },
      }
    )

    const record = await context._admin.findResource('Users').findOne(apiResponse.data.id)

    return {
      record: record?.toJSON(context.currentAdmin),
      notice: {
        message: `Usuário "${apiResponse.data.name}" atualizado com sucesso!`,
        type: 'success',
      },
      redirectUrl: `/admin/resources/Users/records/${apiResponse.data.id}/show`,
    }
  } catch (err) {
    console.error(err)

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error || 'Erro ao editar o usuário. Tente novamente.'

      throw new ForbiddenError(errorMessage)
    } else {
      throw new ForbiddenError('Erro ao editar o usuário. Tente novamente.')
    }
  }
}

  
export async function deleteUserApiHandler(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  const { id } = context.record?.params as DeleteUserInput

  // Retorna em caso de payload vazio.
  if (!id) {
    return {
      record: context.record?.toJSON()
    }
  }
  
  try {
    const apiResponse = await axios.delete(`http://${process.env.HOST}:${process.env.PORT}/api/users/delete/${id}`, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context.currentAdmin?.access_token}`,
        },
      }
    )

    return {  
      record: context.record?.toJSON(),
      notice: {
        message: 'Usuário excluído com sucesso!',
        type: 'success',
      },
      redirectUrl: '/admin/resources/Users',
    }
  } catch (err) {
    console.error(err)

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error || 'Erro ao deletar o usuário. Tente novamente.'

      throw new ForbiddenError(errorMessage)
    } else {
      throw new ForbiddenError('Erro ao deletar o usuário. Tente novamente.')
    }
  }
}
