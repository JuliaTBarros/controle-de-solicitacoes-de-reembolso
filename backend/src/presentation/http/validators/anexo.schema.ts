import {z} from 'zod';

export const createAnexoSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive('ID deve ser um número inteiro positivo.'),
    }),
    body: z.object({
        nomeArquivo: z.string().min(1, 'O nome do arquivo é obrigatório.'),
        urlArquivo: z.string().url('A URL do arquivo é inválida.'),
        tipoArquivo: z
            .string()
            .transform(v => v.toUpperCase())
            .refine(v => ['PDF', 'JPG', 'PNG'].includes(v), {
                message: 'Tipo de arquivo inválido. Permitidos: PDF, JPG, PNG.',
            }),
    }),
});
