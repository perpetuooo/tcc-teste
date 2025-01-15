import { z } from "zod";

export const createBookCopyRequestSchema = z.object({
    bookId: z.number({
        required_error: "É necessário o ID do livro.",
        invalid_type_error: "ID do livro inválido."
    }),
    ISBN: z.string({
        required_error: "É necessário o ISBN do livro.",
        invalid_type_error: "ISBN inválido."
    }),
    condition: z.enum(["GOOD", "BAD"], {
        required_error: "É necessário a condição do livro.",
        invalid_type_error: "Condição do livro inválida.",
    }),
})

export const createBookCopyResponseSchema = z.object({
    id: z.number(),
    bookTitle: z.string(),
    ISBN: z.string(),
    condition: z.enum(["GOOD", "BAD"]),
    isLoaned: z.boolean(),
})

export const editBookCopyRequestSchema = z.object({
    id: z.number({
        required_error: "É necessário o ID do exemplar do livro.",
        invalid_type_error: "ID inválido.",
    }),
    ISBN: z.string({
        invalid_type_error: "ISBN inválido.",
    }),
    condition: z.enum(["GOOD", "BAD"], {
        invalid_type_error: "Condição do livro inválida.",
    }),
})

export const editBookCopyResponseSchema = z.object({
    id: z.number(),
    bookTitle: z.string(),
    ISBN: z.string(),
    condition: z.enum(["GOOD", "BAD"]),
    isLoaned: z.boolean(),
})

export const deleteBookCopyRequestSchema = z.object({
    id: z.string({
        required_error: "É necessário o ID do exemplar.",
        invalid_type_error: "ID inválido.",
    })
})

export type CreateCopyInput = z.infer<typeof createBookCopyRequestSchema>
export type EditCopyInput = z.infer<typeof editBookCopyRequestSchema>
export type DeleteCopyInput = z.infer<typeof deleteBookCopyRequestSchema>