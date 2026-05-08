import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../src/pages/RegisterPage';
import { authService } from '../src/services/authService';

jest.mock('../src/services/authService', () => ({
  authService: { register: jest.fn() },
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.mocked(authService.register).mockReset();
  });

  it('renders all form fields and submit button', () => {
    renderPage();
    expect(screen.getByLabelText(/^nome$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^e-mail$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('shows link to login page', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument();
  });

  it('shows validation error when name is empty', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => {
      expect(screen.getByText(/nome obrigatório/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/^nome$/i), { target: { value: 'Julia' } });
    fireEvent.change(screen.getByLabelText(/^e-mail$/i), { target: { value: 'nao-e-email' } });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when password is too short', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/^nome$/i), { target: { value: 'Julia' } });
    fireEvent.change(screen.getByLabelText(/^e-mail$/i), { target: { value: 'julia@test.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => {
      expect(screen.getByText(/senha deve ter no mínimo 6 caracteres/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when passwords do not match', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/^nome$/i), { target: { value: 'Julia' } });
    fireEvent.change(screen.getByLabelText(/^e-mail$/i), { target: { value: 'julia@test.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: 'diferente' } });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => {
      expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();
    });
  });

  it('calls authService.register with correct data on valid submit', async () => {
    jest.mocked(authService.register).mockResolvedValueOnce(undefined as any);
    renderPage();
    fireEvent.change(screen.getByLabelText(/^nome$/i), { target: { value: 'Julia Barros' } });
    fireEvent.change(screen.getByLabelText(/^e-mail$/i), { target: { value: 'julia@test.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name:     'Julia Barros',
        email:    'julia@test.com',
        password: 'senha123',
        role:     'COLABORADOR',
      });
    });
  });

  it('shows error when email is already in use (409)', async () => {
    jest.mocked(authService.register).mockRejectedValueOnce({ response: { status: 409 } });
    renderPage();
    fireEvent.change(screen.getByLabelText(/^nome$/i), { target: { value: 'Julia' } });
    fireEvent.change(screen.getByLabelText(/^e-mail$/i), { target: { value: 'julia@test.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => {
      expect(screen.getByText(/este e-mail já está em uso/i)).toBeInTheDocument();
    });
  });

  it('shows generic error on server failure (500)', async () => {
    jest.mocked(authService.register).mockRejectedValueOnce({ response: { status: 500 } });
    renderPage();
    fireEvent.change(screen.getByLabelText(/^nome$/i), { target: { value: 'Julia' } });
    fireEvent.change(screen.getByLabelText(/^e-mail$/i), { target: { value: 'julia@test.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => {
      expect(screen.getByText(/erro ao conectar com o servidor/i)).toBeInTheDocument();
    });
  });
});
