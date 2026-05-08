import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RejectDialog } from '../src/components/RejectDialog';

const mockOnClose   = jest.fn();
const mockOnConfirm = jest.fn();

describe('RejectDialog', () => {
  beforeEach(() => {
    mockOnClose.mockReset();
    mockOnConfirm.mockReset();
  });

  it('renders nothing when open is false', () => {
    const { container } = render(
      <RejectDialog open={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the dialog title and textarea when open', () => {
    render(<RejectDialog open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    expect(screen.getByText(/rejeitar solicitação/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/descreva o motivo da rejeição/i)).toBeInTheDocument();
  });

  it('renders "Confirmar Rejeição" submit button', () => {
    render(<RejectDialog open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    expect(screen.getByRole('button', { name: /confirmar rejeição/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting an empty reason', async () => {
    render(<RejectDialog open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: /confirmar rejeição/i }));
    await waitFor(() => {
      expect(screen.getByText(/justificativa obrigatória/i)).toBeInTheDocument();
    });
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm with the entered reason when submitting valid input', async () => {
    mockOnConfirm.mockResolvedValueOnce(undefined);
    render(<RejectDialog open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    fireEvent.change(screen.getByPlaceholderText(/descreva o motivo da rejeição/i), {
      target: { value: 'Nota fiscal inválida.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirmar rejeição/i }));
    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('Nota fiscal inválida.');
    });
  });

  it('calls onClose when the cancel button is clicked', () => {
    render(<RejectDialog open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: /^cancelar$/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('disables buttons while loading', () => {
    render(
      <RejectDialog open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} loading={true} />,
    );
    expect(screen.getByRole('button', { name: /rejeitando/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^cancelar$/i })).toBeDisabled();
  });
});