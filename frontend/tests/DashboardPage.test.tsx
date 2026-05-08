import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import DashboardPage from '../src/pages/DashboardPage';
import { Role } from '../src/types/user';
import { ReimbursementStatus } from '../src/types/reimbursement';
import { useAuth } from '../src/contexts/AuthContext';
import { useReimbursements } from '../src/hooks/useReimbursements';

// Isolate from sidebar and routing complexity
jest.mock('../src/components/Layout', () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../src/hooks/useReimbursements', () => ({
  useReimbursements: jest.fn(),
}));

function makeUser(role: Role) {
  return { id: '42', name: 'Test User', email: 'test@test.com', role };
}

function mockAuth(role: Role) {
  jest.mocked(useAuth).mockReturnValue({
    user: makeUser(role),
    token: null,
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  });
}

const EMPTY_REIMBURSEMENTS = { data: [] as never[], loading: false, error: null };

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.mocked(useReimbursements).mockReturnValue(EMPTY_REIMBURSEMENTS);
  });

  describe('title by role', () => {
    it('shows "Minhas Solicitações" for COLABORADOR', () => {
      mockAuth(Role.COLABORADOR);
      render(<MemoryRouter><DashboardPage /></MemoryRouter>);
      expect(screen.getByText('Minhas Solicitações')).toBeInTheDocument();
    });

    it('shows "Solicitações para Análise" for GESTOR', () => {
      mockAuth(Role.GESTOR);
      render(<MemoryRouter><DashboardPage /></MemoryRouter>);
      expect(screen.getByText('Solicitações para Análise')).toBeInTheDocument();
    });

    it('shows "Solicitações para Pagamento" for FINANCEIRO', () => {
      mockAuth(Role.FINANCEIRO);
      render(<MemoryRouter><DashboardPage /></MemoryRouter>);
      expect(screen.getByText('Solicitações para Pagamento')).toBeInTheDocument();
    });

    it('shows "Todas as Solicitações" for ADMIN', () => {
      mockAuth(Role.ADMIN);
      render(<MemoryRouter><DashboardPage /></MemoryRouter>);
      expect(screen.getByText('Todas as Solicitações')).toBeInTheDocument();
    });
  });

  describe('"Nova solicitação" button', () => {
    it('is visible for COLABORADOR', () => {
      mockAuth(Role.COLABORADOR);
      render(<MemoryRouter><DashboardPage /></MemoryRouter>);
      expect(screen.getByRole('button', { name: /nova solicitação/i })).toBeInTheDocument();
    });

    it.each([Role.GESTOR, Role.FINANCEIRO, Role.ADMIN])(
      'is hidden for %s',
      (role) => {
        mockAuth(role);
        render(<MemoryRouter><DashboardPage /></MemoryRouter>);
        expect(screen.queryByRole('button', { name: /nova solicitação/i })).not.toBeInTheDocument();
      },
    );
  });

  describe('loading and empty states', () => {
    it('shows loading spinner while fetching', () => {
      mockAuth(Role.COLABORADOR);
      jest.mocked(useReimbursements).mockReturnValue({ data: [], loading: true, error: null });
      render(<MemoryRouter><DashboardPage /></MemoryRouter>);
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows empty state message for COLABORADOR with no data', () => {
      mockAuth(Role.COLABORADOR);
      render(<MemoryRouter><DashboardPage /></MemoryRouter>);
      expect(screen.getByText(/você ainda não tem solicitações/i)).toBeInTheDocument();
    });

    it('shows error alert when API fails', () => {
      mockAuth(Role.COLABORADOR);
      jest.mocked(useReimbursements).mockReturnValue({ data: [], loading: false, error: 'Falha de rede' });
      render(<MemoryRouter><DashboardPage /></MemoryRouter>);
      expect(screen.getByText('Falha de rede')).toBeInTheDocument();
    });
  });

  describe('reimbursement list', () => {
    it('renders a card for each reimbursement returned by the API', () => {
      mockAuth(Role.COLABORADOR);
      jest.mocked(useReimbursements).mockReturnValue({
        loading: false,
        error:   null,
        data: [
          {
            id: '1', requesterId: '42', categoryId: '1',
            description: 'Almoço cliente', amount: 85.5,
            expenseDate: '2024-03-10', status: ReimbursementStatus.DRAFT,
            createdAt: '2024-03-10T12:00:00Z', updatedAt: '2024-03-10T12:00:00Z',
          },
          {
            id: '2', requesterId: '42', categoryId: '2',
            description: 'Uber aeroporto', amount: 42.0,
            expenseDate: '2024-03-11', status: ReimbursementStatus.SUBMITTED,
            createdAt: '2024-03-11T08:00:00Z', updatedAt: '2024-03-11T08:00:00Z',
          },
        ],
      });
      render(<MemoryRouter><DashboardPage /></MemoryRouter>);
      expect(screen.getByText('Almoço cliente')).toBeInTheDocument();
      expect(screen.getByText('Uber aeroporto')).toBeInTheDocument();
    });
  });
});
