import { api } from '../lib/api';
import { Reimbursement, ReimbursementHistory, ReimbursementStatus, HistoryAction } from '../types/reimbursement';

const statusMap: Record<string, ReimbursementStatus> = {
  RASCUNHO:  ReimbursementStatus.DRAFT,
  ENVIADO:   ReimbursementStatus.SUBMITTED,
  APROVADO:  ReimbursementStatus.APPROVED,
  REJEITADO: ReimbursementStatus.REJECTED,
  PAGO:      ReimbursementStatus.PAID,
  CANCELADO: ReimbursementStatus.CANCELED,
};

function mapReimbursement(raw: any): Reimbursement {
  return {
    id:              String(raw.id),
    requesterId:     String(raw.solicitanteId),
    categoryId:      String(raw.categoriaId),
    description:     raw.descricao,
    amount:          raw.valor,
    expenseDate:     raw.dataDespesa,
    status:          statusMap[raw.status] ?? raw.status,
    rejectionReason: raw.justificativaRejeicao,
    createdAt:       raw.criadoEm,
    updatedAt:       raw.atualizadoEm,
  };
}

function mapHistory(raw: any): ReimbursementHistory {
  return {
    id:              String(raw.id),
    reimbursementId: String(raw.solicitacaoId),
    userId:          String(raw.usuarioId),
    action:          raw.acao as HistoryAction,
    observation:     raw.observacao,
    createdAt:       raw.criadoEm,
  };
}

export const reimbursementService = {
  list: (params?: object): Promise<Reimbursement[]> =>
    api.get('/reimbursements', { params }).then(r => r.data.map(mapReimbursement)),

  getById: (id: string): Promise<Reimbursement> =>
    api.get(`/reimbursements/${id}`).then(r => mapReimbursement(r.data)),

  create: (data: { description: string; amount: number; categoryId: string; expenseDate: string }): Promise<Reimbursement> =>
    api.post('/reimbursements', {
      descricao:   data.description,
      valor:       data.amount,
      categoriaId: Number(data.categoryId),
      dataDespesa: data.expenseDate,
    }).then(r => mapReimbursement(r.data)),

  update: (id: string, data: { description: string; amount: number; categoryId: string; expenseDate: string }): Promise<Reimbursement> =>
    api.put(`/reimbursements/${id}`, {
      descricao:   data.description,
      valor:       data.amount,
      categoriaId: Number(data.categoryId),
      dataDespesa: data.expenseDate,
    }).then(r => mapReimbursement(r.data)),

  submit:  (id: string): Promise<Reimbursement> =>
    api.post(`/reimbursements/${id}/submit`).then(r => mapReimbursement(r.data)),

  approve: (id: string): Promise<Reimbursement> =>
    api.post(`/reimbursements/${id}/approve`).then(r => mapReimbursement(r.data)),

  reject: (id: string, reason: string): Promise<Reimbursement> =>
    api.post(`/reimbursements/${id}/reject`, { justificativaRejeicao: reason })
       .then(r => mapReimbursement(r.data)),

  pay: (id: string): Promise<Reimbursement> =>
    api.post(`/reimbursements/${id}/pay`).then(r => mapReimbursement(r.data)),

  cancel: (id: string): Promise<Reimbursement> =>
    api.post(`/reimbursements/${id}/cancel`).then(r => mapReimbursement(r.data)),

  getHistory: (id: string): Promise<ReimbursementHistory[]> =>
    api.get(`/reimbursements/${id}/history`).then(r => r.data.map(mapHistory)),
};
