import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../src/components/StatusBadge';
import { ReimbursementStatus } from '../src/types/reimbursement';

describe('StatusBadge', () => {
  it.each([
    [ReimbursementStatus.DRAFT,     'Rascunho'],
    [ReimbursementStatus.SUBMITTED, 'Enviado'],
    [ReimbursementStatus.APPROVED,  'Aprovado'],
    [ReimbursementStatus.REJECTED,  'Rejeitado'],
    [ReimbursementStatus.PAID,      'Pago'],
    [ReimbursementStatus.CANCELED,  'Cancelado'],
  ])('renders correct label for status %s', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('applies destructive style for REJECTED', () => {
    render(<StatusBadge status={ReimbursementStatus.REJECTED} />);
    const badge = screen.getByText('Rejeitado');
    expect(badge.className).toMatch(/destructive/);
  });

  it('applies primary style for SUBMITTED', () => {
    render(<StatusBadge status={ReimbursementStatus.SUBMITTED} />);
    const badge = screen.getByText('Enviado');
    expect(badge.className).toMatch(/primary/);
  });
});
