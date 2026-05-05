# Controle de Solicitações de Reembolso

Aplicação fullstack — backend Node.js/Express/TypeScript + frontend React/TypeScript.

## Pré-requisitos

- Node.js >= 18
- npm

---

## Backend

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

O `.env` já vem com os valores corretos para desenvolvimento local — nenhuma alteração é necessária para rodar.

### 3. Criar e migrar o banco de dados

```bash
npx prisma migrate dev
```

Isso cria o arquivo `prisma/dev.db` (SQLite) e aplica todas as migrations.

### 4. Popular o banco com dados de teste

```bash
npx prisma db seed
```

Insere os usuários e categorias iniciais (ver tabela abaixo).

### 5. Iniciar o servidor

```bash
npm run dev
```

API disponível em: `http://localhost:3333`

---

### Resetar o banco de dados

Se precisar apagar e recriar o banco do zero:

```bash
npx prisma migrate reset
```

Esse comando apaga o banco, reaplica todas as migrations e executa o seed automaticamente.

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Interface disponível em: `http://localhost:5173`

---

## Usuários de teste (seed)

| E-mail               | Senha  | Perfil      |
|----------------------|--------|-------------|
| colaborador@test.com | 123456 | COLABORADOR |
| gestor@test.com      | 123456 | GESTOR      |
| financeiro@test.com  | 123456 | FINANCEIRO  |
| admin@test.com       | 123456 | ADMIN       |
