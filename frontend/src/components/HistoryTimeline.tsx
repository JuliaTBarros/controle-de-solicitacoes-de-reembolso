import { ReimbursementHistory, HistoryAction, ACTION_LABELS } from '../types/reimbursement';
import { formatDateTime } from '../lib/formatters';
import { cn } from '@/lib/utils';

const ACTION_DOT: Record<HistoryAction, string> = {
  CREATED:   'bg-muted-foreground',
  UPDATED:   'bg-muted-foreground',
  SUBMITTED: 'bg-primary',
  APPROVED:  'bg-green-600',
  REJECTED:  'bg-destructive',
  PAID:      'bg-amber-600',
  CANCELED:  'bg-muted-foreground',
};

interface Props {
  history: ReimbursementHistory[];
}

export function HistoryTimeline({ history }: Props) {
  const sorted = [...history].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-0">
      {sorted.map((item, index) => (
        <div key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center shrink-0">
            <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', ACTION_DOT[item.action])} />
            {index < sorted.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1" />
            )}
          </div>
          <div className="pb-5 min-w-0">
            <p className="text-sm font-semibold leading-tight">
              {ACTION_LABELS[item.action]}
            </p>
            {item.observation && (
              <p className="text-sm text-muted-foreground mt-0.5">{item.observation}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {formatDateTime(item.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
