import {z} from 'zod';

export const idParamsSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive('ID deve ser um número inteiro positivo.'),
    }),
});
