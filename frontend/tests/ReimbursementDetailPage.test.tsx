import { render, screen, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import ReimbursementDetailPage from '../src/pages/ReimbursementDetailPage';
import { useAuth } from '../src/contexts/AuthContext';
import { useReimbursement } from '../src/hooks/useReimbursement';
import { useReimbursementHistory } from '../src/hooks/useReimbursementHistory';
import { useReimbursementActions } from '../src/hooks/useReimbursementActions';
import { useCategories } from '../src/hooks/useCategories';
import { Reimbursement, ReimbursementStatus } from '../src/types/reimbursement';
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

jest.mock('../src/hooks/useReimbursementHistory', () => ({
  useReimbursementHistory: jest.fn(),
}));

jest.mock('../src/hooks/useReimbursementActions', () => ({
  useReimbursementActions: jest.fn(),
}));

jest.mock('../src/hooks/useCategories', () => ({
  useCategories: jest.fn(),
}));

jest.mock('../src/services/attachmentService', () => ({
  attachmentService: {
    list:   jest.fn().mockResolvedValue([]),
    upload: jest.fn(),
  },
}));

jest.mock('../src/components/ActionButtons', () => ({
  ActionButtons: () => <div data-testid="action-buttons" />,
}));

jest.mock('../src/components/HistoryTimeline', () => ({
  HistoryTimeline: ({ history }: { history: unknown[] }) => (
    <div data-testid="history-timeline">{history.length} itens</div>
  ),
}));

jest.mock('../src/components/AttachmentList', () => ({
  AttachmentList: () => <div data-testid="attachment-list" />,
}));

jest.mock('../src/components/RejectDialog', () => ({
  RejectDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="reject-dialog" /> : null,
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const OWNER_USER = { id: 'user-42', name: 'Julia', email: 'julia@test.com', role: Role.COLABORADOR };

const BASE_REIMBURSEMENT: Reimbursement = {
  id:          '123',
  requesterId: 'user-42',
  categoryId:  'cat-1',
  description: 'Almoço com cliente',
  amount:      150.5,
  expenseDate: '2024-03-10',
  status:      ReimbursementStatus.DRAFT,
  createdAt:   '2024-03-10T12:00:00Z',
  updatedAt:   '2024-03-10T12:00:00Z',
};

const MOCK_ACTIONS = {
  submit:        jest.fn(),
  approve:       jest.fn(),
  reject:        jest.fn(),
  pay:           jest.fn(),
  cancel:        jest.fn(),
  loadingAction: null,
  error:         null,
};

function setupDefaultMocks(overrides: Partial<Reimbursement> = {}) {
  jest.mocked(useAuth).mockReturnValue({
    user:            OWNER_USER,
    token:           'fake-token',
    isAuthenticated: true,
    login:           jest.fn(),
    logout:          jest.fn(),
  });
  jest.mocked(useReimbursement).mockReturnValue({
    data:    { ...BASE_REIMBURSEMENT, ...overrides },
    loading: false,
    error:   null,
    refetch: jest.fn(),
  });
  jest.mocked(useReimbursementHistory).mockReturnValue({
    data:    [],
    loading: false,
    error:   null,
    refetch: jest.fn(),
  });
  jest.mocked(useCategories).mockReturnValue({
    data:    [{ id: 'cat-1', name: 'Alimentação', active: true }],
    loading: false,
    error:   null,
  });
  jest.mocked(useReimbursementActions).mockReturnValue(MOCK_ACTIONS);
}

async function renderPage() {
  await act(async () => {
    render(<ReimbursementDetailPage />);
  });
}

describe('ReimbursementDetailPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    setupDefaultMocks();
  });

  it('shows loading spinner while data is being fetched', async () => {
    jest.mocked(useReimbursement).mockReturnValue({
      data: null, loading: true, error: null, refetch: jest.fn(),
    });
    await renderPage();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    jest.mocked(useReimbursement).mockReturnValue({
      data: null, loading: false, error: 'Erro ao carregar.', refetch: jest.fn(),
    });
    await renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent('Erro ao carregar.');
  });

  it('shows "Solicitação não encontrada" when data is absent', async () => {
    jest.mocked(useReimbursement).mockReturnValue({
      data: null, loading: false, error: null, refetch: jest.fn(),
    });
    await renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent(/solicitação não encontrada/i);
  });

  it('displays the reimbursement description as heading', async () => {
    await renderPage();
    expect(screen.getByRole('heading', { name: 'Almoço com cliente' })).toBeInTheDocument();
  });

  it('displays the status badge', async () => {
    await renderPage();
    expect(screen.getByText('Rascunho')).toBeInTheDocument();
  });

  it('displays the category name from categories list', async () => {
    await renderPage();
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
  });

  it('shows edit button for owner with DRAFT status', async () => {
    await renderPage();
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
  });

  it('hides edit button when status is not DRAFT', async () => {
    setupDefaultMocks({ status: ReimbursementStatus.SUBMITTED });
    await renderPage();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
  });

  it('hides edit button when user is not the owner', async () => {
    jest.mocked(useAuth).mockReturnValue({
      user:            { ...OWNER_USER, id: 'other-user' },
      token:           'fake-token',
      isAuthenticated: true,
      login:           jest.fn(),
      logout:          jest.fn(),
    });
    await renderPage();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
  });

  it('displays rejection reason when present', async () => {
    setupDefaultMocks({
      status:          ReimbursementStatus.REJECTED,
      rejectionReason: 'Nota fiscal inválida.',
    });
    await renderPage();
    expect(screen.getByText('Nota fiscal inválida.')).toBeInTheDocument();
    expect(screen.getByText(/justificativa de rejeição/i)).toBeInTheDocument();
  });

  it('shows "Nenhum registro" when history is empty', async () => {
    await renderPage();
    expect(screen.getByText(/nenhum registro no histórico/i)).toBeInTheDocument();
  });

  it('renders HistoryTimeline when there are history entries', async () => {
    jest.mocked(useReimbursementHistory).mockReturnValue({
      data: [
        { id: 'h1', reimbursementId: '123', userId: 'u1', action: 'CREATED' as any, createdAt: '2024-03-10T12:00:00Z' },
      ],
      loading: false,
      error:   null,
      refetch: jest.fn(),
    });
    await renderPage();
    expect(screen.getByTestId('history-timeline')).toBeInTheDocument();
  });
});