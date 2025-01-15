import path from "path";
import { z } from "zod";

export const getBooksRequestSchema = z.object({
    title: z.string({
        invalid_type_error: "Título inválido."
    }).optional(),
    category: z.string({
        invalid_type_error: "Categoria inválida."
    }).optional()
})

export const getBookDetailsRequestSchema = z.object({
    id: z.string({
        required_error: "É necessário o ID do livro.",
        invalid_type_error: "ID inválido.",
    })
})

export const registerBookRequestSchema = z.object({
    title: z.string({
        required_error: "É necessário o título do livro.",
        invalid_type_error: "Título inválido."
    }),
    description: z.string({
        invalid_type_error: "Descrição inválida."
    }).optional(),
    author: z.string({
        required_error: "É necessário o autor do livro.",
        invalid_type_error: "Nome do autor inválido",
    }),
    category: z.number({
        invalid_type_error: "Categoria inválida."
    }).int().nullable(),
    imageUrl: z.string({
        invalid_type_error: "URL da imagem inválida."
    }).nullable(),
    image: z.any().optional()
})

export const registerBookResponseSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    author: z.string(),
    categoryId: z.number().int().nullable(),
    imageUrl: z.string().nullable(),
})

export const updateBookRequestSchema = z.object({
    id: z.number({
        required_error: "É necessário o ID do livro.",
        invalid_type_error: "ID inválido.",
    }),
    title: z.string({
        invalid_type_error: "Título inválido",
    }),
    description: z.string({
        invalid_type_error: "Descrição inválida.",
    }).optional(),
    author: z.string({
        invalid_type_error: "Nome do autor inválido.",
    }),
    category: z.number({
        invalid_type_error: "Categoria inválida." 
    }).int().nullable(),
    imageUrl: z.string({
        invalid_type_error: "URL da imagem inválida."
    }).nullable(),
    image: z.any().optional()
})

export const updateBookResponseSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    author: z.string(),
    categoryId: z.number().int().nullable(),
    imageUrl: z.string().nullable(),
})

export const deleteBookRequestSchema = z.object({
    id: z.string({
        invalid_type_error: "ID inválido.",
    }),
})

export const createCategoryRequestSchema = z.object({
    name: z.string({
        required_error: "É necessário o nome da categoria.",
        invalid_type_error: "Nome inválido."
    })
})

export const createCategoryResponseSchema = z.object({
    id: z.number(),
    name: z.string()
})

export const deleteCategoryRequestSchema = z.object({
    id: z.string({
        required_error: "É necessário o ID da categoria.",
        invalid_type_error: "ID inválido."
    })
})

export type GetBooksInput = z.infer<typeof getBooksRequestSchema>
export type GetBookDetailsInput = z.infer<typeof getBookDetailsRequestSchema>
export type RegisterBookInput = z.infer<typeof registerBookRequestSchema>
export type UpdateBookInput = z.infer<typeof updateBookRequestSchema>
export type DeleteBookInput = z.infer<typeof deleteBookRequestSchema>
export type CreateCategoryInput = z.infer<typeof createCategoryRequestSchema>
export type DeleteCategoryInput = z.infer<typeof deleteCategoryRequestSchema>
