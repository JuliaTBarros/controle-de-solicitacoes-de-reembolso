import { api } from '../lib/api';
import { User, LoginResponse, Role } from '../types/user';

function mapUser(raw: any): User {
  return {
    id:    String(raw.id),
    name:  raw.nome,
    email: raw.email,
    role:  raw.perfil as Role,
  };
}

export const authService = {
  login: (email: string, password: string): Promise<LoginResponse> =>
    api.post('/auth/login', { email, senha: password })
       .then(r => ({ token: r.data.token, user: mapUser(r.data.user) })),

  register: (data: { name: string; email: string; password: string; role?: string }): Promise<User> =>
    api.post('/users', { nome: data.name, email: data.email, senha: data.password, perfil: data.role })
       .then(r => mapUser(r.data)),
};
