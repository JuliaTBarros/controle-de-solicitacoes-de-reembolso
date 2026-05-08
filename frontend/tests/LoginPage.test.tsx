import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../src/pages/LoginPage';

const mockLogin = jest.fn();

jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    login:           mockLogin,
    user:            null,
    token:           null,
    isAuthenticated: false,
    logout:          jest.fn(),
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('renders email and password fields and submit button', () => {
    renderPage();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('shows link to register page', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for password shorter than 6 characters', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText(/senha deve ter no mínimo 6 caracteres/i)).toBeInTheDocument();
    });
  });

  it('calls login with the entered credentials', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderPage();
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'julia@test.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('julia@test.com', 'senha123');
    });
  });

  it('shows error message for invalid credentials (401)', async () => {
    mockLogin.mockRejectedValueOnce({ response: { status: 401 } });
    renderPage();
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText(/e-mail ou senha incorretos/i)).toBeInTheDocument();
    });
  });

  it('shows generic error message on server failure', async () => {
    mockLogin.mockRejectedValueOnce({ response: { status: 500 } });
    renderPage();
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText(/erro ao conectar com o servidor/i)).toBeInTheDocument();
    });
  });
});
