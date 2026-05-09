import { useState } from 'react';
import { Reimbursement } from '../types/reimbursement';
import { reimbursementService } from '../services/reimbursementService';

export interface UpdateReimbursementData {
  description: string;
  amount: number;
  categoryId: string;
  expenseDate: string;
}

export function useUpdateReimbursement() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function update(id: string, data: UpdateReimbursementData): Promise<Reimbursement> {
    setLoading(true);
    setError(null);
    try {
      return await reimbursementService.update(id, data);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Erro ao atualizar solicitação.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { update, loading, error };
}
