import {z} from 'zod';

export const createCategoriaSchema = z.object({
    body: z.object({
        nome: z.string().min(2, 'O nome da categoria deve ter ao menos 2 caracteres.'),
    }),
});

export const updateCategoriaSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive('ID deve ser um número inteiro positivo.'),
    }),
    body: z.object({
        nome: z.string().min(2, 'O nome da categoria deve ter ao menos 2 caracteres.').optional(),
        ativo: z.boolean().optional(),
    }),
});
