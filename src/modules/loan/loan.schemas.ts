import { z } from "zod";

export const createLoanRequestSchema = z.object({
    bookId: z.number({
        required_error: "É necessário o ID do livro.",
        invalid_type_error: "ID inválido.",
    }),
})

export const createLoanResponseSchema = z.object({
    id: z.number(),
    userName: z.string(),
    userId: z.string(),
    bookTitle: z.string(),
    bookId: z.number(),
    ISBN: z.string(),
    copyId: z.string(),
    postponed: z.boolean(),
})

export const manipulateLoanRequestSchema = z.object({   
    id: z.number({
        required_error: "É necessário o ID do empréstimo.",
        invalid_type_error: "ID do empréstimo inválido.",
    }),
    userId: z.string({
        invalid_type_error: "ID do usuário inválido.",
    }).optional(),
    bookId: z.number({
        invalid_type_error: "ID do livro inválido.",
    }).optional(),
})

export const startLoanResponseSchema = z.object({
    id: z.number(),
    userName: z.string(),
    userId: z.string(),
    bookTitle: z.string(),
    bookId: z.number(),
    ISBN: z.string(),
    copyId: z.number(),
    postponed: z.boolean(),
})

export const postponeLoanRequestSchema = z.object({
    id: z.number({
        required_error: "É necessário o ID do livro.",
        invalid_type_error: "ID do livro inválido.",
    }),
})

export const postponeLoanResponseSchema = z.object({
    id: z.number(),
    userName: z.string(),
    userId: z.string(),
    bookTitle: z.string(),
    bookId: z.number(),
    ISBN: z.string(),
    copyId: z.number(),
    postponed: z.boolean(),
})

export const manageWaitListRequestSchema = z.object({
    bookId: z.number({
        required_error: "É necessário o ID do livro.",
        invalid_type_error: "ID do livro inválido.",
    }),
})

export const manageWaitListResponseSchema = z.object({
    position: z.number()
})

export const positionsWaitListResponseSchema = z.array(
    z.object({
      bookId: z.number(),
      bookTitle: z.string(),
      position: z.number(),
    })
  )

export type CreateLoanInput = z.infer<typeof createLoanRequestSchema>
export type ManipulateLoanInput = z.infer<typeof manipulateLoanRequestSchema>
export type PostponeLoanInput = z.infer<typeof postponeLoanRequestSchema>
export type ManageWaitListInput = z.infer<typeof manageWaitListRequestSchema>
