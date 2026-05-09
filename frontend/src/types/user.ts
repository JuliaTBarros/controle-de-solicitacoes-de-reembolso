export enum Role {
  COLABORADOR = 'COLABORADOR',
  GESTOR      = 'GESTOR',
  FINANCEIRO  = 'FINANCEIRO',
  ADMIN       = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: User;
}
