import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  name:            z.string().min(1, 'Nome obrigatório'),
  email:           z.string().email('E-mail inválido'),
  password:        z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  role:            z.enum(['COLABORADOR', 'GESTOR', 'FINANCEIRO', 'ADMIN']),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path:    ['confirmPassword'],
});

export const reimbursementSchema = z.object({
  description:  z.string().min(5, 'Descrição deve ter no mínimo 5 caracteres'),
  amount:       z.coerce.number().positive('Valor deve ser maior que zero'),
  categoryId:   z.string().min(1, 'Selecione uma categoria'),
  expenseDate:  z.string().min(1, 'Data da despesa obrigatória'),
});

export const rejectSchema = z.object({
  reason: z.string().min(1, 'Justificativa obrigatória para rejeição'),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
});

export type LoginData         = z.infer<typeof loginSchema>;
export type RegisterData      = z.infer<typeof registerSchema>;
export type ReimbursementData = z.infer<typeof reimbursementSchema>;
export type RejectData        = z.infer<typeof rejectSchema>;
export type CategoryData      = z.infer<typeof categorySchema>;
