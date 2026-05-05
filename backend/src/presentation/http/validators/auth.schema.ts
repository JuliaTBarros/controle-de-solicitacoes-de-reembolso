import {z} from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('E-mail inválido.'),
        senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres.'),
    }),
});
