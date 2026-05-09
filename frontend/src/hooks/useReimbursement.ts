import { useState, useEffect, useCallback } from 'react';
import { Reimbursement } from '../types/reimbursement';
import { reimbursementService } from '../services/reimbursementService';

export function useReimbursement(id: string) {
  const [data,    setData]    = useState<Reimbursement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    reimbursementService.getById(id)
      .then(setData)
      .catch(err => setError(err.response?.data?.message ?? 'Erro ao carregar solicitação.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
