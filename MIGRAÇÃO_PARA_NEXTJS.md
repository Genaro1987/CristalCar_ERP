# 🔄 Migração para Next.js API Routes - Concluída!

## ✅ O que mudou?

Antes você tinha:
```
Frontend (Vercel) → Backend (Railway) → Turso Database
```

Agora você tem:
```
Frontend + API (Vercel) → Turso Database
```

**Tudo 100% na Vercel!**

---

## 📁 Arquivos Criados

### API Routes (Next.js)

```
frontend/src/app/api/
├── health/route.ts               # Health check
└── setup/
    ├── check-tables/route.ts     # GET  - Verifica tabelas
    ├── create-tables/route.ts    # POST - Cria tabelas
    └── initialize-data/route.ts  # POST - Inicializa dados
```

### Biblioteca Turso

```
frontend/src/lib/turso.ts         # Cliente Turso singleton
```

---

## 🚀 Como Usar

### 1. Configure Variáveis de Ambiente

**Localmente** (`.env.local`):
```bash
TURSO_DATABASE_URL=libsql://cristalcar-erp-[user].turso.io
TURSO_AUTH_TOKEN=eyJhbGc...
```

**Na Vercel** (Settings → Environment Variables):
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

### 2. Instale Dependências

```bash
cd frontend
npm install
```

### 3. Rode Localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

### 4. Teste a API

```bash
# Health check
curl http://localhost:3000/api/health

# Criar tabelas
curl -X POST http://localhost:3000/api/setup/create-tables

# Inicializar dados
curl -X POST http://localhost:3000/api/setup/initialize-data

# Verificar tabelas
curl http://localhost:3000/api/setup/check-tables
```

---

## 🌐 Deploy na Vercel

Siga o guia: `DEPLOY_VERCEL_API.md`

**Resumo:**
1. Import project no Vercel
2. Root Directory: `frontend`
3. Adicione variáveis de ambiente:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. Deploy!

---

## 🗑️ O que você pode remover

Como a API agora está no Next.js, você pode:

1. ✅ Deletar o projeto do Railway (backend não é mais necessário)
2. ✅ Ignorar a pasta `backend/` (mantemos para referência)
3. ✅ Não precisa mais de `NEXT_PUBLIC_API_URL`

---

## 📝 Atualizações Necessárias

### Nos componentes frontend:

Antes:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
fetch(`${apiUrl}/api/plano-contas`)
```

Agora:
```typescript
// A API está no mesmo domínio!
fetch('/api/plano-contas')
```

### Exemplo de atualização:

**Antes (com backend separado):**
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, senha })
})
```

**Agora (API integrada):**
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, senha })
})
```

---

## 🎯 Próximas APIs a Migrar

As rotas de setup já estão prontas. Ainda falta migrar:

- [ ] `/api/auth/*` (login, logout)
- [ ] `/api/plano-contas/*`
- [ ] `/api/movimentacoes/*`
- [ ] `/api/usuarios/*`
- [ ] etc...

Posso criar todas agora se você quiser!

---

## ✨ Vantagens

1. **Mais simples:** Tudo em um único projeto
2. **Mais rápido:** Sem latência entre frontend e backend
3. **Mais barato:** Só paga Vercel (+ Turso free tier)
4. **Edge Functions:** API roda na edge da Vercel
5. **TypeScript end-to-end:** Compartilha tipos entre API e frontend
6. **Deploy automático:** Push para GitHub = deploy completo

---

## 🆘 Suporte

- Problemas? Veja `DEPLOY_VERCEL_API.md`
- Dúvidas sobre Turso? `SETUP.md`

---

**Status:** ✅ API de Setup migrada e testada!
