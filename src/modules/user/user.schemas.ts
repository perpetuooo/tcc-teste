import { z } from "zod";
import { validateCPF, validatePhone } from "./user.services.ts";

export const createUserRequestSchema = z.object({
    email: z.string({
        required_error: "Insira seu endereço de email.",
        invalid_type_error: "Endereço de email inválido."
    }).email(),
    name: z.string({
        required_error: "Insira seu nome completo.",
        invalid_type_error: "Nome inválido."
    }),
    phone: z.string({
        required_error: "Insira seu telefone.",
        invalid_type_error: "Telefone inválido."
    }).refine((phone) => validatePhone(phone), {
        message: "Telefone inválido."
    }),
    cpf: z.string({
        required_error: "Insira seu CPF.",
        invalid_type_error: "CPF inválido."
    }).refine((cpf) => validateCPF(cpf), {
        message: "CPF inválido."
    }),
    password: z.string({
        required_error: "Insira sua senha.",
        invalid_type_error: "Senha inválida."
    }),
})

export const createUserResponseSchema = z.object({
    access_token: z.string(),
})

export const loginUserRequestSchema = z.object({
    email: z.string({
        required_error: "Insira seu endereço de email.",
        invalid_type_error: "Endereço de email inválido."
    }).email(),
    password: z.string({
        required_error: "Insira sua senha.",
        invalid_type_error: "Senha inválida."
    }),
})

export const loginUserResponseSchema = z.object({
    access_token: z.string(),
})

export const updateUserRequestSchema = z.object({
    id: z.string({
        required_error: "Insira o ID.",
        invalid_type_error: "ID inválido.",
    }),
    name: z.string({
        invalid_type_error: "Nome inválido.",
    }),
    email: z.string({
        invalid_type_error: "Endereço de email inválido.",
    }),
    phone: z.string({
        invalid_type_error: "Número de celular inválido.",
    }).refine((phone) => validatePhone(phone), {
        message: "Telefone inválido."
    }),
    isBlocked: z.boolean({
        invalid_type_error: "Tipagem inválida.",
    }).optional(),
    oldPassword: z.string({
        invalid_type_error: "Senha inválida.",
    }).optional(),
    newPassword: z.string({
        invalid_type_error: "Senha inválida.",
    }).optional(),
    role: z.enum(['USER', 'ADMIN'], {
        invalid_type_error: 'Tipagem inválida.'
    }).optional()
})

export const deleteUserRequestSchema = z.object({
    id: z.string({
        required_error: "Insira o ID.",
        invalid_type_error: "ID inválido."
    })
})


export type CreateUserInput = z.infer<typeof createUserRequestSchema>
export type LoginUserInput = z.infer<typeof loginUserRequestSchema>
export type UpdateUserInput = z.infer<typeof updateUserRequestSchema>
export type DeleteUserInput = z.infer<typeof deleteUserRequestSchema>
