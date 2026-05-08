import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import CategoriesPage from '../src/pages/CategoriesPage';
import { useCategories } from '../src/hooks/useCategories';
import { useCategoryActions } from '../src/hooks/useCategoryActions';

jest.mock('../src/components/Layout', () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock('../src/hooks/useCategories', () => ({
  useCategories: jest.fn(),
}));

jest.mock('../src/hooks/useCategoryActions', () => ({
  useCategoryActions: jest.fn(),
}));

// Simplify Radix UI Dialog to avoid Portal/animation issues in jsdom
jest.mock('../src/components/ui/dialog', () => ({
  Dialog:        ({ children, open }: any) => (open ? <div role="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader:  ({ children }: any) => <div>{children}</div>,
  DialogTitle:   ({ children }: any) => <h2>{children}</h2>,
  DialogFooter:  ({ children }: any) => <div>{children}</div>,
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const ACTIVE_CATEGORY   = { id: 'cat-1', name: 'Alimentação', active: true  };
const INACTIVE_CATEGORY = { id: 'cat-2', name: 'Transporte',  active: false };

const mockCreate = jest.fn();
const mockUpdate = jest.fn();

function setupMocks(categories = [ACTIVE_CATEGORY, INACTIVE_CATEGORY], loading = false) {
  jest.mocked(useCategories).mockReturnValue({ data: categories, loading, error: null });
  jest.mocked(useCategoryActions).mockReturnValue({
    create:  mockCreate,
    update:  mockUpdate,
    loading: false,
    error:   null,
  });
}

describe('CategoriesPage', () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockUpdate.mockReset();
    setupMocks();
  });

  it('shows loading spinner while categories are being fetched', () => {
    setupMocks([], true);
    render(<CategoriesPage />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state when no categories exist', () => {
    setupMocks([]);
    render(<CategoriesPage />);
    expect(screen.getByText(/nenhuma categoria cadastrada/i)).toBeInTheDocument();
  });

  it('renders category names in the list', () => {
    render(<CategoriesPage />);
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Transporte')).toBeInTheDocument();
  });

  it('shows "Ativa" and "Inativa" status labels', () => {
    render(<CategoriesPage />);
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(screen.getByText('Inativa')).toBeInTheDocument();
  });

  it('opens the create dialog when "Nova categoria" button is clicked', async () => {
    render(<CategoriesPage />);
    fireEvent.click(screen.getByRole('button', { name: /nova categoria/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /nova categoria/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar categoria/i })).toBeInTheDocument();
    });
  });

  it('opens the edit dialog with pre-filled name when "Editar" is clicked', async () => {
    render(<CategoriesPage />);
    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    fireEvent.click(editButtons[0]);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /editar categoria/i })).toBeInTheDocument();
      expect(screen.getByDisplayValue('Alimentação')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
    });
  });

  it('shows validation error when saving a category with a name that is too short', async () => {
    render(<CategoriesPage />);
    fireEvent.click(screen.getByRole('button', { name: /nova categoria/i }));
    await waitFor(() => screen.getByRole('button', { name: /criar categoria/i }));
    fireEvent.click(screen.getByRole('button', { name: /criar categoria/i }));
    await waitFor(() => {
      expect(screen.getByText(/nome deve ter no mínimo 2 caracteres/i)).toBeInTheDocument();
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('calls update with active=false when "Inativar" is clicked', async () => {
    mockUpdate.mockResolvedValueOnce({ ...ACTIVE_CATEGORY, active: false });
    render(<CategoriesPage />);
    fireEvent.click(screen.getByRole('button', { name: /inativar/i }));
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('cat-1', { active: false });
    });
  });

  it('calls update with active=true when "Ativar" is clicked', async () => {
    mockUpdate.mockResolvedValueOnce({ ...INACTIVE_CATEGORY, active: true });
    render(<CategoriesPage />);
    fireEvent.click(screen.getByRole('button', { name: /^ativar$/i }));
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('cat-2', { active: true });
    });
  });

  it('calls create with correct name when saving a new category', async () => {
    mockCreate.mockResolvedValueOnce({ id: 'cat-new', name: 'Hospedagem', active: true });
    render(<CategoriesPage />);
    fireEvent.click(screen.getByRole('button', { name: /nova categoria/i }));
    await waitFor(() => screen.getByRole('button', { name: /criar categoria/i }));
    fireEvent.change(screen.getByPlaceholderText(/ex: alimentação/i), {
      target: { value: 'Hospedagem' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar categoria/i }));
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({ name: 'Hospedagem' });
    });
  });
});