import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import EditReimbursementPage from '../src/pages/EditReimbursementPage';
import { useAuth } from '../src/contexts/AuthContext';
import { useReimbursement } from '../src/hooks/useReimbursement';
import { useUpdateReimbursement } from '../src/hooks/useUpdateReimbursement';
import { ReimbursementStatus } from '../src/types/reimbursement';
import { Role } from '../src/types/user';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams:   () => ({ id: '123' }),
  useNavigate: () => mockNavigate,
}));

jest.mock('../src/components/Layout', () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../src/hooks/useReimbursement', () => ({
  useReimbursement: jest.fn(),
}));

jest.mock('../src/hooks/useUpdateReimbursement', () => ({
  useUpdateReimbursement: jest.fn(),
}));

jest.mock('../src/services/reimbursementService', () => ({
  reimbursementService: { submit: jest.fn() },
}));

jest.mock('../src/components/ReimbursementForm', () => ({
  ReimbursementForm: () => <div data-testid="reimbursement-form" />,
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const OWNER_USER = { id: 'user-42', name: 'Julia', email: 'julia@test.com', role: Role.COLABORADOR };

const DRAFT_REIMBURSEMENT = {
  id: '123',
  requesterId: 'user-42',
  categoryId:  'cat-1',
  description: 'Almoço de negócios',
  amount:      150,
  expenseDate: '2024-03-10',
  status:      ReimbursementStatus.DRAFT,
  createdAt:   '2024-03-10T12:00:00Z',
  updatedAt:   '2024-03-10T12:00:00Z',
};

function mockAuthAs(user: typeof OWNER_USER) {
  jest.mocked(useAuth).mockReturnValue({
    user,
    token:           'fake-token',
    isAuthenticated: true,
    login:           jest.fn(),
    logout:          jest.fn(),
  });
}

describe('EditReimbursementPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockAuthAs(OWNER_USER);
    jest.mocked(useUpdateReimbursement).mockReturnValue({ update: jest.fn(), loading: false, error: null });
  });

  it('shows loading spinner while data is being fetched', () => {
    jest.mocked(useReimbursement).mockReturnValue({
      data: null, loading: true, error: null, refetch: jest.fn(),
    });
    render(<EditReimbursementPage />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', () => {
    jest.mocked(useReimbursement).mockReturnValue({
      data: null, loading: false, error: 'Não encontrado.', refetch: jest.fn(),
    });
    render(<EditReimbursementPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Não encontrado.');
  });

  it('shows "Solicitação não encontrada" when data is absent', () => {
    jest.mocked(useReimbursement).mockReturnValue({
      data: null, loading: false, error: null, refetch: jest.fn(),
    });
    render(<EditReimbursementPage />);
    expect(screen.getByRole('alert')).toHaveTextContent(/solicitação não encontrada/i);
  });

  it('redirects to detail page when status is not DRAFT', async () => {
    jest.mocked(useReimbursement).mockReturnValue({
      data:    { ...DRAFT_REIMBURSEMENT, status: ReimbursementStatus.SUBMITTED },
      loading: false,
      error:   null,
      refetch: jest.fn(),
    });
    render(<EditReimbursementPage />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/reimbursements/123', { replace: true });
    });
  });

  it('redirects to detail page when user is not the owner', async () => {
    mockAuthAs({ ...OWNER_USER, id: 'other-user' });
    jest.mocked(useReimbursement).mockReturnValue({
      data:    DRAFT_REIMBURSEMENT,
      loading: false,
      error:   null,
      refetch: jest.fn(),
    });
    render(<EditReimbursementPage />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/reimbursements/123', { replace: true });
    });
  });

  it('renders the form with page title when user is owner and status is DRAFT', () => {
    jest.mocked(useReimbursement).mockReturnValue({
      data:    DRAFT_REIMBURSEMENT,
      loading: false,
      error:   null,
      refetch: jest.fn(),
    });
    render(<EditReimbursementPage />);
    expect(screen.getByText('Editar Solicitação')).toBeInTheDocument();
    expect(screen.getByTestId('reimbursement-form')).toBeInTheDocument();
  });
});