# Controle de Solicitações de Reembolso

Aplicação fullstack — backend Node.js/Express/TypeScript + frontend React/TypeScript.

## Pré-requisitos
- Node.js >= 18
- npm ou yarn

## Rodando o projeto

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Usuários de teste (seed)

| E-mail                    | Senha    | Perfil      |
|---------------------------|----------|-------------|
| colaborador@test.com      | 123456   | COLABORADOR |
| gestor@test.com           | 123456   | GESTOR      |
| financeiro@test.com       | 123456   | FINANCEIRO  |
| admin@test.com            | 123456   | ADMIN       |
