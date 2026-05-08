import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReimbursementForm } from '../src/components/ReimbursementForm';
import { useCategories } from '../src/hooks/useCategories';

jest.mock('../src/hooks/useCategories', () => ({
  useCategories: jest.fn(),
}));

const CATEGORIES = [
  { id: 'cat-1', name: 'Alimentação', active: true  },
  { id: 'cat-2', name: 'Transporte',  active: true  },
  { id: 'cat-3', name: 'Hospedagem',  active: false },
];

function mockCats(loading = false) {
  jest.mocked(useCategories).mockReturnValue({ data: CATEGORIES, loading, error: null });
}

describe('ReimbursementForm', () => {
  const onSaveDraft    = jest.fn();
  const onSendToReview = jest.fn();

  beforeEach(() => {
    onSaveDraft.mockReset();
    onSendToReview.mockReset();
    mockCats();
  });

  it('shows loading spinner while categories are loading', () => {
    mockCats(true);
    render(<ReimbursementForm onSaveDraft={onSaveDraft} onSendToReview={onSendToReview} />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders only active categories in the select', () => {
    render(<ReimbursementForm onSaveDraft={onSaveDraft} onSendToReview={onSendToReview} />);
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Transporte')).toBeInTheDocument();
    expect(screen.queryByText('Hospedagem')).not.toBeInTheDocument();
  });

  it('shows validation error when description is too short', async () => {
    render(<ReimbursementForm onSaveDraft={onSaveDraft} onSendToReview={onSendToReview} />);
    fireEvent.click(screen.getByRole('button', { name: /salvar rascunho/i }));
    await waitFor(() => {
      expect(screen.getByText(/descrição deve ter no mínimo 5 caracteres/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when amount is zero or missing', async () => {
    render(<ReimbursementForm onSaveDraft={onSaveDraft} onSendToReview={onSendToReview} />);
    fireEvent.change(screen.getByPlaceholderText(/descreva detalhadamente/i), {
      target: { value: 'Almoço de negócios' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar rascunho/i }));
    await waitFor(() => {
      expect(screen.getByText(/valor deve ser maior que zero/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when no category is selected', async () => {
    render(<ReimbursementForm onSaveDraft={onSaveDraft} onSendToReview={onSendToReview} />);
    fireEvent.change(screen.getByPlaceholderText(/descreva detalhadamente/i), {
      target: { value: 'Almoço de negócios' },
    });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar rascunho/i }));
    await waitFor(() => {
      expect(screen.getByText(/selecione uma categoria/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when expense date is missing', async () => {
    render(<ReimbursementForm onSaveDraft={onSaveDraft} onSendToReview={onSendToReview} />);
    fireEvent.change(screen.getByPlaceholderText(/descreva detalhadamente/i), {
      target: { value: 'Almoço de negócios' },
    });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '50' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cat-1' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar rascunho/i }));
    await waitFor(() => {
      expect(screen.getByText(/data da despesa obrigatória/i)).toBeInTheDocument();
    });
  });

  it('shows "Salvando…" and disables buttons when isSaving is true', () => {
    render(
      <ReimbursementForm
        onSaveDraft={onSaveDraft}
        onSendToReview={onSendToReview}
        isSaving
      />,
    );
    expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /enviar para análise/i })).toBeDisabled();
  });

  it('shows "Enviando…" and disables buttons when isSending is true', () => {
    render(
      <ReimbursementForm
        onSaveDraft={onSaveDraft}
        onSendToReview={onSendToReview}
        isSending
      />,
    );
    expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /salvar rascunho/i })).toBeDisabled();
  });
});