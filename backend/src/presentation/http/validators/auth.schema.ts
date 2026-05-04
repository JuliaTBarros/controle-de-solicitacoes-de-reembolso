import {z} from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('E-mail inválido.'),
        senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres.'),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres.'),
        email: z.string().email('E-mail inválido.'),
        senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres.'),
        perfil: z.enum(['COLABORADOR', 'GESTOR', 'FINANCEIRO', 'ADMIN']).optional(),
    }),
});
