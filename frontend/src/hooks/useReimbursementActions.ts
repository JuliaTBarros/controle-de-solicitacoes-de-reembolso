import { useState } from 'react';
import { reimbursementService } from '../services/reimbursementService';

type ActionType = 'submit' | 'approve' | 'reject' | 'pay' | 'cancel' | null;

export function useReimbursementActions(id: string) {
  const [loadingAction, setLoadingAction] = useState<ActionType>(null);
  const [error,         setError]         = useState<string | null>(null);

  async function run(action: ActionType, fn: () => Promise<any>) {
    setLoadingAction(action);
    setError(null);
    try {
      return await fn();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Erro ao executar ação.';
      setError(msg);
      throw err;
    } finally {
      setLoadingAction(null);
    }
  }

  const submit  = ()               => run('submit',  () => reimbursementService.submit(id));
  const approve = ()               => run('approve', () => reimbursementService.approve(id));
  const reject  = (reason: string) => run('reject',  () => reimbursementService.reject(id, reason));
  const pay     = ()               => run('pay',     () => reimbursementService.pay(id));
  const cancel  = ()               => run('cancel',  () => reimbursementService.cancel(id));

  return { submit, approve, reject, pay, cancel, loadingAction, error };
}
