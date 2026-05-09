import { ReimbursementStatus } from '../types/reimbursement';
import { Role } from '../types/user';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  status: ReimbursementStatus;
  requesterId: string;
  disabled?: boolean;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onPay?: () => void;
  onCancel?: () => void;
}

export function ActionButtons({ status, requesterId, disabled, ...actions }: Props) {
  const { user } = useAuth();
  if (!user) return null;

  const isOwner      = user.id === requesterId;
  const isGestor     = user.role === Role.GESTOR;
  const isFinanceiro = user.role === Role.FINANCEIRO;

  const base = 'px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none';

  return (
    <div className="flex flex-wrap gap-2">
      {isOwner && status === ReimbursementStatus.DRAFT && (
        <button
          onClick={actions.onSubmit}
          disabled={disabled}
          className={`${base} bg-primary text-primary-foreground hover:bg-primary/90`}
        >
          Enviar para análise
        </button>
      )}
      {isOwner && status === ReimbursementStatus.DRAFT && (
        <button
          onClick={actions.onCancel}
          disabled={disabled}
          className={`${base} bg-muted text-muted-foreground hover:bg-muted/80`}
        >
          Cancelar
        </button>
      )}
      {isGestor && status === ReimbursementStatus.SUBMITTED && (
        <button
          onClick={actions.onApprove}
          disabled={disabled}
          className={`${base} bg-secondary text-secondary-foreground hover:bg-secondary/90`}
        >
          Aprovar
        </button>
      )}
      {isGestor && status === ReimbursementStatus.SUBMITTED && (
        <button
          onClick={actions.onReject}
          disabled={disabled}
          className={`${base} bg-destructive text-destructive-foreground hover:bg-destructive/90`}
        >
          Rejeitar
        </button>
      )}
      {isFinanceiro && status === ReimbursementStatus.APPROVED && (
        <button
          onClick={actions.onPay}
          disabled={disabled}
          className={`${base} bg-accent text-accent-foreground hover:bg-accent/90`}
        >
          Marcar como pago
        </button>
      )}
    </div>
  );
}
