import {z} from 'zod';

export const createReimbursementSchema = z.object({
    body: z.object({
        categoriaId: z.number().int().positive('ID de categoria inválido.'),
        descricao: z.string().min(5, 'Descrição deve ter ao menos 5 caracteres.'),
        valor: z.number().positive('O valor deve ser maior que zero.'),
        dataDespesa: z.string().date('Data da despesa inválida.'),
    }),
});

export const updateReimbursementSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive('ID deve ser um número inteiro positivo.'),
    }),
    body: z.object({
        categoriaId: z.number().int().positive().optional(),
        descricao: z.string().min(5).optional(),
        valor: z.number().positive().optional(),
        dataDespesa: z.string().date().optional(),
    }),
});

export const rejectReimbursementSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive('ID deve ser um número inteiro positivo.'),
    }),
    body: z.object({
        justificativaRejeicao: z.string().min(1, 'A justificativa de rejeição é obrigatória.'),
    }),
});
