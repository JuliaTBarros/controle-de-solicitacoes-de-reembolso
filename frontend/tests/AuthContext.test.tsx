import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

// Quebra a cadeia de import que chega em api.ts (import.meta não suportado no Jest/CommonJS)
jest.mock('../src/services/authService', () => ({
  authService: { login: jest.fn() },
}));

const TOKEN = 'fake-jwt-token';
const USER  = { id: '1', name: 'Julia Barros', email: 'julia@test.com', role: 'COLABORADOR' };

function TestConsumer() {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <div>
      <span data-testid="status">{isAuthenticated ? 'autenticado' : 'não autenticado'}</span>
      <span data-testid="name">{user?.name ?? ''}</span>
      <button onClick={logout}>Sair</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts unauthenticated when localStorage is empty', () => {
    renderWithProvider();
    expect(screen.getByTestId('status')).toHaveTextContent('não autenticado');
    expect(screen.getByTestId('name')).toHaveTextContent('');
  });

  it('initializes as authenticated when token and user exist in localStorage', () => {
    localStorage.setItem('@reimburse:token', TOKEN);
    localStorage.setItem('@reimburse:user', JSON.stringify(USER));
    renderWithProvider();
    expect(screen.getByTestId('status')).toHaveTextContent('autenticado');
    expect(screen.getByTestId('name')).toHaveTextContent('Julia Barros');
  });

  it('logout clears state and localStorage', async () => {
    localStorage.setItem('@reimburse:token', TOKEN);
    localStorage.setItem('@reimburse:user', JSON.stringify(USER));
    renderWithProvider();

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('não autenticado');
    });
    expect(localStorage.getItem('@reimburse:token')).toBeNull();
    expect(localStorage.getItem('@reimburse:user')).toBeNull();
  });
});
