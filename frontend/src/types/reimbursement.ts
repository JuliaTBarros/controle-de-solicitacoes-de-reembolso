export enum ReimbursementStatus {
  DRAFT     = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED  = 'APPROVED',
  REJECTED  = 'REJECTED',
  PAID      = 'PAID',
  CANCELED  = 'CANCELED',
}

export const STATUS_LABELS: Record<ReimbursementStatus, string> = {
  DRAFT:     'Rascunho',
  SUBMITTED: 'Enviado',
  APPROVED:  'Aprovado',
  REJECTED:  'Rejeitado',
  PAID:      'Pago',
  CANCELED:  'Cancelado',
};

export enum HistoryAction {
  CREATED   = 'CREATED',
  UPDATED   = 'UPDATED',
  SUBMITTED = 'SUBMITTED',
  APPROVED  = 'APPROVED',
  REJECTED  = 'REJECTED',
  PAID      = 'PAID',
  CANCELED  = 'CANCELED',
}

export const ACTION_LABELS: Record<HistoryAction, string> = {
  CREATED:   'Criada',
  UPDATED:   'Atualizada',
  SUBMITTED: 'Enviada para análise',
  APPROVED:  'Aprovada',
  REJECTED:  'Rejeitada',
  PAID:      'Paga',
  CANCELED:  'Cancelada',
};

export interface Reimbursement {
  id: string;
  requesterId: string;
  categoryId: string;
  description: string;
  amount: number;
  expenseDate: string;
  status: ReimbursementStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReimbursementHistory {
  id: string;
  reimbursementId: string;
  userId: string;
  action: HistoryAction;
  observation?: string;
  createdAt: string;
}
