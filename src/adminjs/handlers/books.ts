import { DeleteBookInput, RegisterBookInput, UpdateBookInput, CreateCategoryInput, DeleteCategoryInput } from "../../modules/book/book.schemas.ts";
import { CreateCopyInput, DeleteCopyInput, EditCopyInput } from "../../modules/copies/copies.schemas.ts";
import { ActionContext, ActionRequest, ActionResponse, ForbiddenError } from "adminjs";
import { existsSync } from "fs";
import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config()

export async function newBookApiHandler(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  const { title, author, description, category, image } = request.payload as RegisterBookInput
  
  // Retorna em caso de payload incompleto ou vazio.
  if (!title || !author) {
    return {
      record: context.record?.toJSON()
    }
  }

  try {
    let imageUrl = null

    if (image) {
      const base64Data = image.split(';base64,').pop()
      const fileExtension = image.match(/data:image\/(.*?);base64/)?.[1]

      // Converte base64 para buffer
      const imageBuffer = Buffer.from(base64Data, 'base64')
      const safeTitle = title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')

      const filename = `${safeTitle}.${fileExtension}`
      const uploadDir = path.resolve('./public/uploads')
      const filePath = path.join(uploadDir, filename)
      
      await fs.writeFile(filePath, imageBuffer)
      
      // Verifica se o arquivo foi criado corretamente
      const stats = await fs.stat(filePath)
      
      if (stats.size === 0) {
        await fs.unlink(filePath)
        throw new ForbiddenError('Erro ao fazer o download do arquivo.')
      }
      
      imageUrl = `/public/uploads/${filename}`
    }
    
    const apiResponse = await axios.post(`http://${process.env.HOST}:${process.env.PORT}/api/books/register`,
      {
        title,
        author,
        description: description || 'Sem descrição.',
        category: category ? Number(category) : null,
        imageUrl
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context.currentAdmin?.access_token}`,
        },
      }
    )

    const record = await context._admin.findResource('Books').findOne(apiResponse.data.id)

    return {
      record: record?.toJSON(context.currentAdmin),
      notice: {
        message: `Livro "${apiResponse.data.title}" criado com sucesso!`,
        type: 'success'
      },
      redirectUrl: `/admin/resources/Books/records/${apiResponse.data.id}/show`
    }
  } catch (err) {
    console.error(err)

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error || 'Erro ao criar o livro. Tente novamente.'

      throw new ForbiddenError(errorMessage)
    } else {
      throw new ForbiddenError('Erro ao criar o livro. Tente novamente.')
    }
  }
}
  

export async function editBookApiHandler(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  const { id, title, description, author, category, image } = request.payload as UpdateBookInput

  // Retorna em caso de payload incompleto ou vazio.
  if (!id || !title || !author) {
    return {
      record: context.record?.toJSON()
    }
  }

  try {
    const currentBook = await context._admin.findResource('Books').findOne(String(id))
    const { imageUrl: currentImageUrl, title: currentTitle } = currentBook!.params

    let imageUrl = currentImageUrl

    if (image) {
      if (currentImageUrl) {
        await fs.unlink(path.resolve(currentImageUrl))
      }

      const base64Data = image.split(';base64,').pop()
      const fileExtension = image.match(/data:image\/(.*?);base64/)?.[1]

      // Converte base64 para buffer
      const imageBuffer = Buffer.from(base64Data, 'base64')
      const safeTitle = title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')

      const filename = `${safeTitle}.${fileExtension}`
      const uploadDir = path.resolve('./public/uploads')
      const filePath = path.join(uploadDir, filename)
      
      await fs.writeFile(filePath, imageBuffer)
      
      // Verifica se o arquivo foi criado corretamente
      const stats = await fs.stat(filePath)
      
      if (stats.size === 0) {
        await fs.unlink(filePath)
        throw new ForbiddenError('Erro ao fazer o download do arquivo.')
      }
      
      imageUrl = `/public/uploads/${filename}`
    }

    // Caso exista a mudança de título, altera no nome da imagem para coincidir.
    if (!image && currentTitle !== title) {
      const uploadDir = path.resolve('./public/uploads')
      const currentImagePath = path.join(uploadDir, currentImageUrl.replace('/uploads/', ''))
      const fileExtension = currentImageUrl.split('/').pop()?.split('.').pop()
      const safeTitle = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')

      const newImagePath = path.join(uploadDir, `${safeTitle}.${fileExtension}`)
      
      // Verifica se o arquivo atual existe
      if (existsSync(currentImagePath)) {
        await fs.rename(currentImagePath, newImagePath)

        imageUrl = `/public/uploads/${safeTitle}.${fileExtension}`
      } else {
        throw new ForbiddenError('Erro ao localizar a imagem antiga para renomear.')
      }
    }

    const apiResponse = await axios.put(`http://${process.env.HOST}:${process.env.PORT}/api/books/update`, 
      {
        id: Number(id),
        title,
        description: description || 'Sem descrição.',
        author,
        category: category? Number(category) : null,
        imageUrl
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context.currentAdmin?.access_token}`,
        },
      }
    )

    const record = await context._admin.findResource('Books').findOne(apiResponse.data.id)

    return {
      record: record?.toJSON(context.currentAdmin),
      notice: {
        message: `Livro "${apiResponse.data.title}" atualizado com sucesso!`,
        type: 'success',
      },
      redirectUrl: `/admin/resources/Books/records/${apiResponse.data.id}/show`,
    }
  } catch (err) {
    console.error(err)

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error || 'Erro ao atualizar o livro. Tente novamente.'

      throw new ForbiddenError(errorMessage)
    } else {
      throw new ForbiddenError('Erro ao atualizar o livro. Tente novamente.')
    }
  }
}


export async function deleteBookApiHandler(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  const { id } = context.record?.params as DeleteBookInput

  // Retorna em caso de payload vazio.
  if (!id) {
    return {
      record: context.record?.toJSON()
    }
  }

  try {
    await axios.delete(`http://${process.env.HOST}:${process.env.PORT}/api/books/delete/${id}`, 
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
        message: 'Livro excluído com sucesso!',
        type: 'success',
      },
      redirectUrl: '/admin/resources/Books',
    }
  } catch (err) {
    console.error(err)

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error || 'Erro ao deletar o livro. Tente novamente.'

      throw new ForbiddenError(errorMessage)
    } else {
      throw new ForbiddenError('Erro ao deletar o livro. Tente novamente.')
    }
  }
}


export async function newCopyApiHandler(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  const { ISBN, bookId, condition } = request.payload as CreateCopyInput

  // Retorna em caso de payload incompleto ou vazio.
  if (!ISBN || !condition || !bookId) {
    return {
      record: context.record?.toJSON()
    }
  }

  try {
    const apiResponse = await axios.post(`http://${process.env.HOST}:${process.env.PORT}/api/copies/create`, 
      {
        ISBN,
        bookId: Number(bookId),
        condition,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context.currentAdmin?.access_token}`,
        },
      }
    )

    if (apiResponse.status !== 201) {
        throw new Error('Erro ao criar exemplar pela API.')
    }

    const record = await context._admin.findResource('Copies').findOne(apiResponse.data.id)
    
    return {
      record: record?.toJSON(context.currentAdmin),
      notice: {
        message: `Exemplar do livro "${apiResponse.data.bookTitle}" criado com sucesso!`,
        type: 'success'
      }
    }
  } catch (err) {
    console.error(err)

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error || 'Erro ao criar o exemplar. Tente novamente.'

      throw new ForbiddenError(errorMessage)
    } else {
      throw new ForbiddenError('Erro ao criar o exemplar. Tente novamente.')
    }
  }
}


export async function editCopyApiHandler(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  const { id, ISBN, condition } = request.payload as EditCopyInput

  // Retorna em caso de payload incompleto ou vazio.
  if (!id || !ISBN || !condition) {
    return {
      record: context.record?.toJSON()
    }
  }

  try {
    const apiResponse = await axios.put(`http://${process.env.HOST}:${process.env.PORT}/api/copies/edit`, 
      {
        id: Number(id),
        ISBN,
        condition,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context.currentAdmin?.access_token}`,
        },
      }
    )

    const record = await context._admin.findResource('Copies').findOne(apiResponse.data.id)

    return {
      record: record?.toJSON(context.currentAdmin),
      notice: {
        message: `Exemplar "${apiResponse.data.ISBN}" atualizado com sucesso!`,
        type: 'success',
      },
      redirectUrl: `/admin/resources/Copies/records/${apiResponse.data.id}/show`,
    }
  } catch (err) {
    console.error(err)

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error || 'Erro ao atualizar o exemplar. Tente novamente.'

      throw new ForbiddenError(errorMessage)
    } else {
      throw new ForbiddenError('Erro ao atualizar o exemplar. Tente novamente.')
    }
  }
}


export async function deleteCopyApiHandler(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  const { id } = context.record?.params as DeleteCopyInput

  // Retorna em caso de payload vazio.
  if (!id) {
    return {
      record: context.record?.toJSON()
    }
  }

  try {
    await axios.delete(`http://${process.env.HOST}:${process.env.PORT}/api/copies/delete/${id}`, 
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
        message: 'Exemplar excluído com sucesso!',
        type: 'success',
      },
      redirectUrl: '/admin/resources/Copies',
    }
  } catch (err) {
    console.error(err)

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error || 'Erro ao deletar o exemplar. Tente novamente.'

      throw new ForbiddenError(errorMessage)
    } else {
      throw new ForbiddenError('Erro ao deletar o exemplar. Tente novamente.')
    }
  }
}


export async function newCategoryApiHandler(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  const { name } = request.payload as CreateCategoryInput
  
  // Retorna em caso de payload vazio.
  if (!name) {
    return {
      record: context.record?.toJSON()
    }
  }
  
  try {
    const apiResponse = await axios.post(`http://${process.env.HOST}:${process.env.PORT}/api/books/category/create`, 
      {
        name
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context.currentAdmin?.access_token}`,
        },
      }
    )

    const record = await context._admin.findResource('Categories').findOne(apiResponse.data.id)

    return {
      record: record?.toJSON(context.currentAdmin),
      notice: {
        message: `Categoria "${apiResponse.data.name}" criada com sucesso!`,
        type: 'success',
      },
      redirectUrl: `/admin/resources/Categories/`,
    }
  } catch(err) {
    console.log(err)

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error || 'Erro ao criar a categoria. Tente novamente.'

      throw new ForbiddenError(errorMessage)
    } else {
      throw new ForbiddenError('Erro ao criar a categoria. Tente novamente.')
    }
  }
}


export async function deleteCategoryApiHandler(request: ActionRequest, response: ActionResponse, context: ActionContext) {
  const { id } = context.record?.params as DeleteCategoryInput
  
  // Retorna em caso de payload vazio.
  if (!id) {
    return {
      record: context.record?.toJSON()
    }
  }
  
  try {
    await axios.delete(`http://${process.env.HOST}:${process.env.PORT}/api/books/category/delete/${id}`, 
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
        message: `Categoria deletada com sucesso!`,
        type: 'success',
      },
      redirectUrl: `/admin/resources/Categories/`,
    }

  } catch(err) {
    console.log(err)

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.error || 'Erro ao deletar a categoria. Tente novamente.'

      throw new ForbiddenError(errorMessage)
    } else {
      throw new ForbiddenError('Erro ao deletar a categoria. Tente novamente.')
    }
  }
}
