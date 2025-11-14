# Backend CristalCar ERP

Serviço Node.js responsável por expor uma API REST integrada ao banco de dados Turso.

## Requisitos

- Node.js 18 ou superior
- Conta no [Turso](https://turso.tech) com banco provisionado

## Configuração local

1. Copie `.env.example` para `.env` e preencha com as credenciais do seu banco Turso:
   ```bash
   cp .env.example .env
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute a API em modo desenvolvimento:
   ```bash
   npm run dev
   ```

A API fica disponível em `http://localhost:4000` por padrão.

### Endpoints iniciais

- `GET /health`: retorna status e horário do servidor.
- `GET /customers`: busca até 100 clientes (tabela `customers`).
- `POST /customers`: cadastra um cliente.

> **Observação:** A tabela `customers` deve existir no banco Turso com o schema:
> ```sql
> CREATE TABLE IF NOT EXISTS customers (
>   id TEXT PRIMARY KEY,
>   name TEXT NOT NULL,
>   email TEXT UNIQUE NOT NULL
> );
> ```

## Deploy automático via GitHub Actions

1. Crie os **GitHub Secrets** no repositório:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
2. Crie um workflow que faça `npm install` e `npm test`/`npm run lint` conforme a necessidade.
3. Utilize a action `vercel/turso-action` ou scripts customizados para migrações automáticas quando necessário.

Isso garante que o backend seja provisionado com as credenciais corretas ao ser implantado em qualquer plataforma (Railway, Render, Fly.io, etc.).
