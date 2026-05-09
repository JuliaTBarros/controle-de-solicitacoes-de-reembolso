import { useNavigate } from 'react-router-dom';
import { Reimbursement } from '../types/reimbursement';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate } from '../lib/formatters';

interface Props {
  reimbursement: Reimbursement;
}

export function ReimbursementCard({ reimbursement }: Props) {
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/reimbursements/${reimbursement.id}`)}
      onKeyDown={e => e.key === 'Enter' && navigate(`/reimbursements/${reimbursement.id}`)}
      className="flex items-center justify-between p-4 bg-card border rounded-lg cursor-pointer hover:bg-muted/40 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{reimbursement.description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDate(reimbursement.expenseDate)}
        </p>
      </div>
      <div className="flex items-center gap-4 ml-4 shrink-0">
        <span className="text-sm font-bold tabular-nums">
          {formatCurrency(reimbursement.amount)}
        </span>
        <StatusBadge status={reimbursement.status} />
      </div>
    </div>
  );
}
