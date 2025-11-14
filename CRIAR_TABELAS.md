# 🔧 Como Criar as Tabelas no Turso

## Opção 1: Via API (RECOMENDADO - Mais Fácil)

Seu backend já está rodando no Railway. Use essa URL para criar as tabelas:

### 1. Verificar se o backend está funcionando

Abra no navegador ou use curl:

```bash
# Substitua pela URL do seu Railway
https://SEU-BACKEND-URL.railway.app/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```

### 2. Criar todas as tabelas

**Via Navegador ou Postman:**

Faça uma requisição POST para:

```
POST https://SEU-BACKEND-URL.railway.app/api/setup/create-tables
```

**Via curl:**

```bash
curl -X POST https://SEU-BACKEND-URL.railway.app/api/setup/create-tables
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Todas as 15 tabelas foram criadas com sucesso!",
  "tables": [
    "funcionarios",
    "usuarios",
    "plano_contas",
    ...
  ]
}
```

### 3. Verificar se as tabelas foram criadas

```bash
# Via curl
curl https://SEU-BACKEND-URL.railway.app/api/setup/check-tables
```

Deve mostrar as 15 tabelas criadas.

### 4. Inicializar dados (usuário admin, plano de contas básico)

Agora você precisa rodar o script de inicialização.

**Se tiver acesso ao Railway CLI:**

```bash
railway run npm run db:init
```

**OU acesse via SSH e execute:**

```bash
# No Railway, vá em Settings → Connect
# Copie o comando railway shell
railway shell
npm run db:init
exit
```

**OU crie via API de setup (vou criar essa rota agora):**

---

## Opção 2: Via Turso CLI Local

Se preferir, pode criar localmente:

```bash
# 1. Entre no seu banco
turso db shell cristalcar-erp

# 2. Dentro do shell do Turso, cole as tabelas uma por uma
# (veja o arquivo backend/src/routes/setup.js para os SQLs)

# 3. Sair
.quit
```

---

## Opção 3: Via Drizzle Kit (Requer acesso local ao .env)

```bash
cd backend

# Certifique-se que .env está configurado com:
# TURSO_DATABASE_URL=...
# TURSO_AUTH_TOKEN=...

npm run db:push
```

---

## ⚡ Solução Mais Rápida (Use essa!)

1. Abra o navegador
2. Vá em: `https://SEU-BACKEND-RAILWAY.railway.app/api/setup/create-tables`
3. Clique para fazer a requisição POST (ou use extensão como Talend API Tester)
4. Pronto! Tabelas criadas!

---

## 🔍 Verificar se deu certo

Acesse:
```
https://SEU-BACKEND-RAILWAY.railway.app/api/setup/check-tables
```

Se mostrar 15 tabelas, sucesso! ✅

---

## ⚠️ Erro "Method not allowed"?

Se der erro ao acessar direto no navegador, use:

**Chrome Extension:**
- Instale: "Talend API Tester" ou "Postman"

**Ou use curl no terminal:**
```bash
curl -X POST https://SEU-BACKEND-RAILWAY.railway.app/api/setup/create-tables
```

---

## 🎯 Passo 2: Inicializar Dados (Admin + Dados Básicos)

Depois de criar as tabelas, inicialize os dados:

```bash
curl -X POST https://SEU-BACKEND-RAILWAY.railway.app/api/setup/initialize-data
```

**Isso cria:**
- ✅ Usuário: `admin` / `admin123`
- ✅ 8 contas básicas no plano de contas
- ✅ Banco "Caixa Geral"

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Dados inicializados com sucesso!",
  "created": {
    "users": 1,
    "accounts": 8,
    "banks": 1
  },
  "credentials": {
    "username": "admin",
    "password": "admin123",
    "warning": "⚠️ ALTERE A SENHA APÓS O PRIMEIRO LOGIN!"
  }
}
```

## ✅ Pronto!

Agora você pode:
1. Acessar o frontend na Vercel
2. Fazer login com: `admin` / `admin123`
3. Começar a usar o sistema!

---

## 📋 Resumo dos 3 Passos

```bash
# 1. Criar tabelas
curl -X POST https://SEU-BACKEND.railway.app/api/setup/create-tables

# 2. Inicializar dados
curl -X POST https://SEU-BACKEND.railway.app/api/setup/initialize-data

# 3. Verificar
curl https://SEU-BACKEND.railway.app/api/setup/check-tables
```

Feito! Sistema pronto para uso! 🎉
