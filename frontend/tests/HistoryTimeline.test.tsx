import { render, screen } from '@testing-library/react';
import { HistoryTimeline } from '../src/components/HistoryTimeline';
import { HistoryAction } from '../src/types/reimbursement';

const makeEntry = (id: string, action: HistoryAction, createdAt: string, observation?: string) => ({
  id,
  reimbursementId: 'reimb-1',
  userId:          'user-1',
  action,
  createdAt,
  observation,
});

describe('HistoryTimeline', () => {
  it('renders the action label for each history entry', () => {
    const history = [
      makeEntry('1', HistoryAction.CREATED,   '2024-03-10T08:00:00Z'),
      makeEntry('2', HistoryAction.SUBMITTED,  '2024-03-10T10:00:00Z'),
      makeEntry('3', HistoryAction.APPROVED,   '2024-03-10T14:00:00Z'),
    ];
    render(<HistoryTimeline history={history} />);
    expect(screen.getByText('Criada')).toBeInTheDocument();
    expect(screen.getByText('Enviada para análise')).toBeInTheDocument();
    expect(screen.getByText('Aprovada')).toBeInTheDocument();
  });

  it('shows the observation when present', () => {
    const history = [
      makeEntry('1', HistoryAction.REJECTED, '2024-03-10T08:00:00Z', 'Nota fiscal ilegível.'),
    ];
    render(<HistoryTimeline history={history} />);
    expect(screen.getByText('Nota fiscal ilegível.')).toBeInTheDocument();
  });

  it('does not render an observation element when observation is absent', () => {
    const history = [
      makeEntry('1', HistoryAction.CREATED, '2024-03-10T08:00:00Z'),
    ];
    render(<HistoryTimeline history={history} />);
    expect(screen.queryByText(/observation/i)).not.toBeInTheDocument();
  });

  it('renders all action label variants', () => {
    const history = [
      makeEntry('1', HistoryAction.CREATED,   '2024-03-01T00:00:00Z'),
      makeEntry('2', HistoryAction.UPDATED,   '2024-03-02T00:00:00Z'),
      makeEntry('3', HistoryAction.SUBMITTED, '2024-03-03T00:00:00Z'),
      makeEntry('4', HistoryAction.APPROVED,  '2024-03-04T00:00:00Z'),
      makeEntry('5', HistoryAction.REJECTED,  '2024-03-05T00:00:00Z'),
      makeEntry('6', HistoryAction.PAID,      '2024-03-06T00:00:00Z'),
      makeEntry('7', HistoryAction.CANCELED,  '2024-03-07T00:00:00Z'),
    ];
    render(<HistoryTimeline history={history} />);
    expect(screen.getByText('Criada')).toBeInTheDocument();
    expect(screen.getByText('Atualizada')).toBeInTheDocument();
    expect(screen.getByText('Enviada para análise')).toBeInTheDocument();
    expect(screen.getByText('Aprovada')).toBeInTheDocument();
    expect(screen.getByText('Rejeitada')).toBeInTheDocument();
    expect(screen.getByText('Paga')).toBeInTheDocument();
    expect(screen.getByText('Cancelada')).toBeInTheDocument();
  });

  it('displays entries in reverse chronological order (newest first)', () => {
    const history = [
      makeEntry('1', HistoryAction.CREATED,  '2024-03-01T08:00:00Z'),
      makeEntry('2', HistoryAction.APPROVED, '2024-03-15T08:00:00Z'),
    ];
    render(<HistoryTimeline history={history} />);
    const body = document.body.innerHTML;
    expect(body.indexOf('Aprovada')).toBeLessThan(body.indexOf('Criada'));
  });

  it('renders a date/time string for each entry', () => {
    const history = [
      makeEntry('1', HistoryAction.CREATED, '2024-03-10T08:00:00Z'),
    ];
    render(<HistoryTimeline history={history} />);
    expect(screen.getByText(/2024|03|10/)).toBeInTheDocument();
  });
});