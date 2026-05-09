import { useState } from 'react';
import { Reimbursement } from '../types/reimbursement';
import { reimbursementService } from '../services/reimbursementService';

export interface CreateReimbursementData {
  description: string;
  amount: number;
  categoryId: string;
  expenseDate: string;
}

export function useCreateReimbursement() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function create(data: CreateReimbursementData): Promise<Reimbursement> {
    setLoading(true);
    setError(null);
    try {
      return await reimbursementService.create(data);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Erro ao criar solicitação.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { create, loading, error };
}
