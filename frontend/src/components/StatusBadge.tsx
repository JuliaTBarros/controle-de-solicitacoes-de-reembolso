import { ReimbursementStatus, STATUS_LABELS } from '../types/reimbursement';
import { cn } from '@/lib/utils';

const STATUS_CLASSES: Record<ReimbursementStatus, string> = {
  DRAFT:     'bg-muted text-muted-foreground',
  SUBMITTED: 'bg-primary/10 text-primary',
  APPROVED:  'bg-secondary/10 text-secondary',
  REJECTED:  'bg-destructive/10 text-destructive',
  PAID:      'bg-accent/10 text-accent',
  CANCELED:  'bg-muted text-muted-foreground',
};

interface Props {
  status: ReimbursementStatus;
}

export function StatusBadge({ status }: Props) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', STATUS_CLASSES[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
