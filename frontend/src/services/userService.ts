import { api } from '../lib/api';
import { User, Role } from '../types/user';

function mapUser(raw: any): User {
  return {
    id:    String(raw.id),
    name:  raw.nome,
    email: raw.email,
    role:  raw.perfil as Role,
  };
}

export const userService = {
  list: (): Promise<User[]> =>
    api.get('/users').then(r => r.data.map(mapUser)),
};
