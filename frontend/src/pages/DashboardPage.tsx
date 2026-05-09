import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useReimbursements } from '../hooks/useReimbursements';
import { Role } from '../types/user';
import { ReimbursementStatus, STATUS_LABELS } from '../types/reimbursement';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorAlert } from '../components/ErrorAlert';
import { ReimbursementCard } from '../components/ReimbursementCard';
import { Button } from '../components/ui/button';
import { cn } from '@/lib/utils';

type StatusFilter = ReimbursementStatus | 'ALL';

interface DashboardConfig {
  title: string;
  emptyMessage: string;
  filterStatuses: ReimbursementStatus[];
}

const DASHBOARD_CONFIG: Record<Role, DashboardConfig> = {
  [Role.COLABORADOR]: {
    title:         'Minhas Solicitações',
    emptyMessage:  'Você ainda não tem solicitações.',
    filterStatuses: Object.values(ReimbursementStatus),
  },
  [Role.GESTOR]: {
    title:         'Solicitações para Análise',
    emptyMessage:  'Nenhuma solicitação no momento.',
    filterStatuses: [
      ReimbursementStatus.SUBMITTED,
      ReimbursementStatus.APPROVED,
      ReimbursementStatus.REJECTED,
    ],
  },
  [Role.FINANCEIRO]: {
    title:         'Solicitações para Pagamento',
    emptyMessage:  'Nenhuma solicitação no momento.',
    filterStatuses: [ReimbursementStatus.APPROVED, ReimbursementStatus.PAID],
  },
  [Role.ADMIN]: {
    title:         'Todas as Solicitações',
    emptyMessage:  'Nenhuma solicitação encontrada.',
    filterStatuses: Object.values(ReimbursementStatus),
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error } = useReimbursements();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  if (!user) return null;

  const config = DASHBOARD_CONFIG[user.role];

  const filtered = statusFilter === 'ALL'
    ? data
    : data.filter(r => r.status === statusFilter);

  function countByStatus(status: ReimbursementStatus) {
    return data.filter(r => r.status === status).length;
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{config.title}</h1>
            {!loading && data.length > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {data.length} {data.length === 1 ? 'solicitação' : 'solicitações'} no total
              </p>
            )}
          </div>
          {user.role === Role.COLABORADOR && (
            <Button onClick={() => navigate('/reimbursements/new')}>
              <Plus className="w-4 h-4" />
              Nova solicitação
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={statusFilter === 'ALL'}
            onClick={() => setStatusFilter('ALL')}
          >
            Todos
            {!loading && <CountBadge count={data.length} active={statusFilter === 'ALL'} />}
          </FilterButton>

          {config.filterStatuses.map(status => {
            const count = countByStatus(status);
            return (
              <FilterButton
                key={status}
                active={statusFilter === status}
                onClick={() => setStatusFilter(status)}
              >
                {STATUS_LABELS[status]}
                {!loading && <CountBadge count={count} active={statusFilter === status} />}
              </FilterButton>
            );
          })}
        </div>

        {loading && <LoadingSpinner />}

        {!loading && error && <ErrorAlert message={error} />}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            message={
              statusFilter === 'ALL'
                ? config.emptyMessage
                : `Nenhuma solicitação com status "${STATUS_LABELS[statusFilter as ReimbursementStatus]}".`
            }
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map(r => (
              <ReimbursementCard key={r.id} reimbursement={r} />
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function CountBadge({ count, active }: { count: number; active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-bold',
        active
          ? 'bg-primary-foreground/20 text-primary-foreground'
          : 'bg-muted-foreground/20 text-muted-foreground',
      )}
    >
      {count}
    </span>
  );
}
