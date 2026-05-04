import {z} from 'zod';

export const createCategoriaSchema = z.object({
    body: z.object({
        nome: z.string().min(2, 'O nome da categoria deve ter ao menos 2 caracteres.'),
    }),
});

export const updateCategoriaSchema = z.object({
    body: z.object({
        nome: z.string().min(2, 'O nome da categoria deve ter ao menos 2 caracteres.').optional(),
        ativo: z.boolean().optional(),
    }),
});
