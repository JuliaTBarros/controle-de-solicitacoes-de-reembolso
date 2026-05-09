import { useState, useEffect } from 'react';
import { Reimbursement } from '../types/reimbursement';
import { reimbursementService } from '../services/reimbursementService';

export function useReimbursements(filters?: object) {
  const [data,    setData]    = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    reimbursementService.list(filters)
      .then(setData)
      .catch(err => setError(err.response?.data?.message ?? 'Erro ao carregar solicitações.'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
