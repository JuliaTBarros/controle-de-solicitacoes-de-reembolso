import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButtons } from '../src/components/ActionButtons';
import { useAuth } from '../src/contexts/AuthContext';
import { ReimbursementStatus } from '../src/types/reimbursement';
import { Role } from '../src/types/user';

jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

function makeUser(role: Role, id = 'user-42') {
  return { id, name: 'Test User', email: 'test@test.com', role };
}

const BASE_PROPS = {
  requesterId: 'user-42',
  disabled:    false,
  onSubmit:    jest.fn(),
  onApprove:   jest.fn(),
  onReject:    jest.fn(),
  onPay:       jest.fn(),
  onCancel:    jest.fn(),
};

describe('ActionButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('COLABORADOR (owner)', () => {
    beforeEach(() => {
      jest.mocked(useAuth).mockReturnValue({ user: makeUser(Role.COLABORADOR) } as any);
    });

    it('shows "Enviar para análise" and "Cancelar" when status is DRAFT', () => {
      render(<ActionButtons status={ReimbursementStatus.DRAFT} {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: /enviar para análise/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('shows no buttons when status is SUBMITTED', () => {
      render(<ActionButtons status={ReimbursementStatus.SUBMITTED} {...BASE_PROPS} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows no buttons when status is APPROVED', () => {
      render(<ActionButtons status={ReimbursementStatus.APPROVED} {...BASE_PROPS} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onSubmit when "Enviar para análise" is clicked', () => {
      render(<ActionButtons status={ReimbursementStatus.DRAFT} {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: /enviar para análise/i }));
      expect(BASE_PROPS.onSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when "Cancelar" is clicked', () => {
      render(<ActionButtons status={ReimbursementStatus.DRAFT} {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
      expect(BASE_PROPS.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('GESTOR', () => {
    beforeEach(() => {
      jest.mocked(useAuth).mockReturnValue({ user: makeUser(Role.GESTOR, 'gestor-1') } as any);
    });

    it('shows "Aprovar" and "Rejeitar" when status is SUBMITTED', () => {
      render(<ActionButtons status={ReimbursementStatus.SUBMITTED} {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: /^aprovar$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^rejeitar$/i })).toBeInTheDocument();
    });

    it('shows no buttons when status is DRAFT', () => {
      render(<ActionButtons status={ReimbursementStatus.DRAFT} {...BASE_PROPS} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows no buttons when status is APPROVED', () => {
      render(<ActionButtons status={ReimbursementStatus.APPROVED} {...BASE_PROPS} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onApprove when "Aprovar" is clicked', () => {
      render(<ActionButtons status={ReimbursementStatus.SUBMITTED} {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: /^aprovar$/i }));
      expect(BASE_PROPS.onApprove).toHaveBeenCalledTimes(1);
    });

    it('calls onReject when "Rejeitar" is clicked', () => {
      render(<ActionButtons status={ReimbursementStatus.SUBMITTED} {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: /^rejeitar$/i }));
      expect(BASE_PROPS.onReject).toHaveBeenCalledTimes(1);
    });
  });

  describe('FINANCEIRO', () => {
    beforeEach(() => {
      jest.mocked(useAuth).mockReturnValue({ user: makeUser(Role.FINANCEIRO, 'fin-1') } as any);
    });

    it('shows "Marcar como pago" only when status is APPROVED', () => {
      render(<ActionButtons status={ReimbursementStatus.APPROVED} {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: /marcar como pago/i })).toBeInTheDocument();
    });

    it('shows no buttons when status is SUBMITTED', () => {
      render(<ActionButtons status={ReimbursementStatus.SUBMITTED} {...BASE_PROPS} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows no buttons when status is DRAFT', () => {
      render(<ActionButtons status={ReimbursementStatus.DRAFT} {...BASE_PROPS} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onPay when "Marcar como pago" is clicked', () => {
      render(<ActionButtons status={ReimbursementStatus.APPROVED} {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: /marcar como pago/i }));
      expect(BASE_PROPS.onPay).toHaveBeenCalledTimes(1);
    });
  });

  it('renders nothing when there is no authenticated user', () => {
    jest.mocked(useAuth).mockReturnValue({ user: null } as any);
    const { container } = render(
      <ActionButtons status={ReimbursementStatus.DRAFT} {...BASE_PROPS} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('disables all buttons when disabled prop is true', () => {
    jest.mocked(useAuth).mockReturnValue({ user: makeUser(Role.GESTOR, 'gestor-1') } as any);
    render(<ActionButtons status={ReimbursementStatus.SUBMITTED} {...BASE_PROPS} disabled />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });
});