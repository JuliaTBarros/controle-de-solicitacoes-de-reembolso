# Controle de Solicitações de Reembolso

Aplicação fullstack para gerenciar o ciclo completo de solicitações de reembolso, desde a criação pelo colaborador até o pagamento pelo financeiro, com controle de acesso baseado em perfis e rastreio de auditoria.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack e Tecnologias](#stack-e-tecnologias)
- [Arquitetura](#arquitetura)
- [Como Rodar](#como-rodar)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Usuários de Teste](#usuários-de-teste)
- [Perfis e Permissões](#perfis-e-permissões)
- [Fluxo de Status](#fluxo-de-status)
- [Endpoints da API](#endpoints-da-api)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Diferenciais Implementados](#diferenciais-implementados)
- [Decisões Técnicas](#decisões-técnicas)

---

## Visão Geral

O sistema cobre três fases do processo de reembolso:

1. **Solicitação** — o colaborador cria, edita e envia a solicitação com anexos e categoria
2. **Análise** — o gestor aprova ou rejeita (com justificativa obrigatória)
3. **Pagamento** — o financeiro registra o pagamento das solicitações aprovadas

Cada transição de status gera um registro no histórico de auditoria, garantindo rastreabilidade completa.

---

## Stack e Tecnologias

### Backend

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js >= 18 |
| Framework | Express 4 |
| Linguagem | TypeScript 5 (strict) |
| Banco de dados | SQLite via `@prisma/adapter-libsql` |
| ORM | Prisma 7 |
| Autenticação | JWT (`jsonwebtoken`) |
| Hash de senha | bcryptjs |
| Validação | Zod |
| Datas | dayjs |
| Testes | Jest + Supertest |

### Frontend

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 |
| Linguagem | TypeScript 5 (strict) |
| Build | Vite 7 |
| Roteamento | React Router 6 |
| Estado global | Context API |
| HTTP | Axios |
| Formulários | React Hook Form + Zod |
| UI | shadcn/ui (Radix UI + Tailwind CSS) |
| Notificações | Sonner |
| Tema | next-themes (dark/light) |
| Ícones | lucide-react |
| Testes | Jest + React Testing Library |

---

## Arquitetura

O backend segue uma **arquitetura em camadas** (Clean Architecture simplificada):

```
backend/src/
├── domain/           # Entidades, interfaces, value objects, erros de domínio
├── application/      # Use Cases e DTOs
├── infrastructure/   # Prisma repositories, JWT, bcrypt
├── presentation/     # Controllers, routes, middlewares, validators (Zod)
└── shared/           # Container de injeção de dependência
```

Cada operação de negócio é encapsulada em um **Use Case** dedicado. Os repositórios são definidos como interfaces no domínio e implementados na infraestrutura, permitindo a inversão de dependência.

O frontend segue separação por responsabilidade:

```
frontend/src/
├── contexts/    # AuthContext, ThemeContext
├── pages/       # Uma pasta por tela principal
├── components/  # Componentes reutilizáveis
├── hooks/       # Custom hooks de dados e ações
├── services/    # Camada de acesso à API (Axios)
├── types/       # Tipos TypeScript compartilhados
└── lib/         # Utilitários, schemas Zod, formatadores
```

---

## Como Rodar

### Pré-requisitos

- Node.js >= 18
- npm

### Backend

```bash
# 1. Instalar dependências
cd backend
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# O .env já vem com valores corretos para desenvolvimento — nenhuma alteração necessária

# 3. Criar o banco e aplicar migrations
npx prisma migrate dev

# 4. Popular com dados de teste
npx prisma db seed

# 5. Iniciar o servidor
npm run dev
```

API disponível em: **http://localhost:3333**

> Para resetar o banco do zero: `npx prisma migrate reset` (apaga, recria e executa seed automaticamente)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Interface disponível em: **http://localhost:5173**

---

## Scripts Disponíveis

### Backend

```bash
npm run dev          # Servidor com hot reload (ts-node-dev)
npm run build        # Compila TypeScript
npm run start        # Inicia o servidor compilado
npm test             # Executa todos os testes
npm run test:coverage # Testes com relatório de cobertura
npm run lint         # Verifica erros de lint
npm run lint:fix     # Corrige erros de lint automaticamente
```

### Frontend

```bash
npm run dev          # Servidor de desenvolvimento (Vite)
npm run build        # Build de produção
npm run preview      # Preview do build de produção
npm test             # Executa todos os testes
npm run lint         # Verifica erros de lint
npm run lint:fix     # Corrige erros de lint automaticamente
```

---

## Usuários de Teste

Criados automaticamente pelo seed (`npx prisma db seed`):

| E-mail               | Senha  | Perfil      |
|----------------------|--------|-------------|
| colaborador@test.com | 123456 | COLABORADOR |
| gestor@test.com      | 123456 | GESTOR      |
| financeiro@test.com  | 123456 | FINANCEIRO  |
| admin@test.com       | 123456 | ADMIN       |

---

## Perfis e Permissões

| Perfil | Pode fazer |
|--------|-----------|
| **COLABORADOR** | Criar solicitações, editar rascunhos próprios, enviar, cancelar, adicionar anexos |
| **GESTOR** | Ver solicitações enviadas, aprovar, rejeitar (com justificativa obrigatória) |
| **FINANCEIRO** | Ver solicitações aprovadas, registrar pagamento |
| **ADMIN** | Criar/editar/ativar/desativar categorias, listar usuários |

As permissões são validadas tanto no middleware de rota quanto dentro de cada Use Case.

---

## Fluxo de Status

```
RASCUNHO ──► ENVIADO ──► APROVADO ──► PAGO
   │              │
   └──► CANCELADO◄┘

ENVIADO ──► REJEITADO
```

| Status | Quem pode transicionar | Para |
|--------|------------------------|------|
| RASCUNHO | COLABORADOR (dono) | ENVIADO, CANCELADO |
| ENVIADO | GESTOR | APROVADO, REJEITADO |
| ENVIADO | COLABORADOR (dono) | CANCELADO |
| APROVADO | FINANCEIRO | PAGO |

REJEITADO, PAGO e CANCELADO são estados finais — sem transições possíveis.

---

## Endpoints da API

Todas as rotas (exceto login e registro) requerem o header `Authorization: Bearer <token>`.

### Autenticação

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `POST` | `/auth/login` | Login com e-mail e senha | Público |

### Usuários

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `POST` | `/users` | Registrar novo usuário | Público |
| `GET` | `/users` | Listar usuários | ADMIN |

### Solicitações de Reembolso

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/reimbursements` | Listar solicitações (filtrado por perfil) | Autenticado |
| `POST` | `/reimbursements` | Criar nova solicitação | COLABORADOR |
| `GET` | `/reimbursements/:id` | Detalhes de uma solicitação | Autenticado |
| `PUT` | `/reimbursements/:id` | Editar solicitação (somente RASCUNHO) | COLABORADOR |
| `POST` | `/reimbursements/:id/submit` | Enviar para análise | COLABORADOR |
| `POST` | `/reimbursements/:id/cancel` | Cancelar solicitação | COLABORADOR |
| `POST` | `/reimbursements/:id/approve` | Aprovar solicitação | GESTOR |
| `POST` | `/reimbursements/:id/reject` | Rejeitar com justificativa | GESTOR |
| `POST` | `/reimbursements/:id/pay` | Registrar pagamento | FINANCEIRO |
| `GET` | `/reimbursements/:id/history` | Histórico de auditoria | Autenticado |

### Anexos

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `POST` | `/reimbursements/:id/attachments` | Adicionar anexo | COLABORADOR |
| `GET` | `/reimbursements/:id/attachments` | Listar anexos | Autenticado |

### Categorias

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/categories` | Listar categorias ativas | Autenticado |
| `POST` | `/categories` | Criar categoria | ADMIN |
| `PUT` | `/categories/:id` | Editar/ativar/desativar categoria | ADMIN |

---

## Funcionalidades Implementadas

### Backend
- [x] Registro e login de usuários com JWT
- [x] Hash de senha com bcryptjs
- [x] Middleware de autenticação (Bearer token)
- [x] Middleware de autorização por perfil
- [x] Validação de entrada com Zod em todas as rotas
- [x] Middleware global de tratamento de erros com códigos HTTP padronizados
- [x] CRUD de solicitações de reembolso com controle de status
- [x] Validação de transições de status (regras de negócio)
- [x] Histórico de auditoria automático em cada transição
- [x] Upload de anexos (nome, URL, tipo de arquivo)
- [x] CRUD de categorias com ativação/desativação
- [x] Listagem de usuários (ADMIN)
- [x] Filtragem de solicitações por perfil (colaborador vê só as próprias; gestor/financeiro/admin veem todas)
- [x] Seed com usuários e categorias iniciais
- [x] Testes de integração (auth, reembolsos, categorias, usuários)
- [x] Testes unitários (entidades de domínio, value objects)

### Frontend
- [x] Tela de login com validação
- [x] Tela de cadastro de novo usuário
- [x] Dashboard com estatísticas e lista de solicitações recentes
- [x] Listagem de solicitações com busca e filtro por status
- [x] Formulário de criação de solicitação
- [x] Formulário de edição (somente rascunhos)
- [x] Tela de detalhes com histórico visual (timeline)
- [x] Botões de ação condicionais por perfil e status
- [x] Dialog de rejeição com campo de justificativa obrigatório
- [x] Listagem e adição de anexos
- [x] Página de gerenciamento de categorias (ADMIN)
- [x] Rotas protegidas por autenticação e por perfil
- [x] Context API para estado de autenticação
- [x] Notificações toast (Sonner) para feedback de ações
- [x] Suporte a dark/light mode
- [x] Layout responsivo com Tailwind CSS
- [x] Testes de componentes e páginas (React Testing Library)

---

## Diferenciais Implementados

- **Arquitetura limpa**: separação explícita em camadas (domain / application / infrastructure / presentation) com injeção de dependência via container
- **Value Objects**: `ReembolsoStatus` e `Dinheiro` encapsulam regras de domínio
- **Erros de domínio**: hierarquia de erros customizados (`ConflictError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`) mapeados para HTTP no middleware
- **Testes unitários de domínio**: entidades e value objects testados de forma isolada
- **Dark mode**: alternância de tema persistida com next-themes
- **Feedback visual rico**: loading states, empty states, toast notifications e status badges coloridos

---

## Decisões Técnicas

### Cancelamento após ENVIADO
A especificação permite que o colaborador cancele uma solicitação mesmo após o envio. Essa transição (ENVIADO → CANCELADO) foi mantida intencionalmente, pois evita que o colaborador fique preso aguardando uma resposta do gestor em casos de erro de envio.

### Anexos somente no RASCUNHO
Anexos só podem ser adicionados enquanto a solicitação está em rascunho. Após o envio, a solicitação torna-se imutável para garantir a integridade do que foi analisado pelo gestor.

### Validação em dois níveis
As permissões são checadas tanto no middleware de rota (perfil do token JWT) quanto dentro do Use Case (dono do recurso, estado atual). Isso evita que erros de configuração de rota exponham dados indevidos.

### SQLite com adaptador LibSQL
O banco SQLite é acessado via `@prisma/adapter-libsql`, que oferece melhor compatibilidade com o driver nativo e está alinhado com o futuro suporte a Turso. Para desenvolvimento local, não exige nenhuma configuração adicional.

### Status no frontend vs. backend
O backend usa os nomes em português (RASCUNHO, ENVIADO, etc.) conforme a especificação. O frontend mapeia esses valores nos serviços de API, mantendo consistência com os contratos REST sem duplicar lógica de status em dois idiomas.

### Injeção de dependência manual
Um container simples em `shared/container.ts` instancia e conecta repositórios e use cases. Optei por não usar um framework de DI para manter o projeto sem dependências desnecessárias e fácil de rastrear.
