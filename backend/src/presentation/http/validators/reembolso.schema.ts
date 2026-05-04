import {z} from 'zod';

export const createReimbursementSchema = z.object({
    body: z.object({
        categoriaId: z.number().int().positive('ID de categoria inválido.'),
        descricao: z.string().min(5, 'Descrição deve ter ao menos 5 caracteres.'),
        valor: z.number().positive('O valor deve ser maior que zero.'),
        dataDespesa: z.string().datetime({message: 'Data da despesa inválida.'}),
    }),
});

export const updateReimbursementSchema = z.object({
    body: z.object({
        categoriaId: z.number().int().positive().optional(),
        descricao: z.string().min(5).optional(),
        valor: z.number().positive().optional(),
        dataDespesa: z.string().datetime().optional(),
    }),
});

export const rejectReimbursementSchema = z.object({
    body: z.object({
        justificativaRejeicao: z.string().min(1, 'A justificativa de rejeição é obrigatória.'),
    }),
});
