import { useState, useEffect, useCallback } from 'react';
import { ReimbursementHistory } from '../types/reimbursement';
import { reimbursementService } from '../services/reimbursementService';

export function useReimbursementHistory(id: string) {
  const [data,    setData]    = useState<ReimbursementHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    reimbursementService.getHistory(id)
      .then(setData)
      .catch(err => setError(err.response?.data?.message ?? 'Erro ao carregar histórico.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
