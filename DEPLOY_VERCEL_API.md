# 🚀 Deploy 100% Vercel - API Integrada

Agora o projeto está **100% na Vercel** com Next.js API Routes!

## ✅ Vantagens

- ✅ Tudo em um único lugar (Vercel)
- ✅ Sem necessidade de Railway/Render
- ✅ API e Frontend no mesmo deploy
- ✅ Mais simples e econômico
- ✅ Edge Functions da Vercel

---

## 📋 Configuração na Vercel

### 1. Importe o Projeto

1. Acesse https://vercel.com/login
2. Clique em **"Add New..."** → **"Project"**
3. Selecione o repositório **CristalCar_ERP**
4. Clique em **"Import"**

### 2. Configure o Projeto

**IMPORTANTE:**

- **Framework Preset:** Next.js
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (padrão)
- **Output Directory:** `.next` (padrão)
- **Install Command:** `npm install` (padrão)

### 3. Adicione Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

| Name | Value | Exemplo |
|------|-------|---------|
| `TURSO_DATABASE_URL` | Sua URL do Turso | `libsql://cristalcar-erp-[user].turso.io` |
| `TURSO_AUTH_TOKEN` | Seu token do Turso | `eyJhbGc...` (token completo) |

**⚠️ IMPORTANTE:**
- Essas variáveis são **Server-Side Only** (usadas apenas nas API Routes)
- Não precisa de `NEXT_PUBLIC_API_URL` porque a API está integrada!

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Anote a URL gerada (ex: `https://cristalcar-erp.vercel.app`)

---

## 🔧 Inicializar o Banco de Dados

Depois do deploy, inicialize o banco:

### Passo 1: Criar Tabelas

Acesse no navegador ou use curl:

```bash
curl -X POST https://SUA-URL.vercel.app/api/setup/create-tables
```

**Ou abra no navegador:**
```
https://SUA-URL.vercel.app/api/setup/create-tables
```

(Use uma extensão como "Talend API Tester" para fazer POST)

### Passo 2: Inicializar Dados

```bash
curl -X POST https://SUA-URL.vercel.app/api/setup/initialize-data
```

Isso cria:
- ✅ Usuário `admin` / `admin123`
- ✅ 8 contas básicas
- ✅ Banco "Caixa Geral"

### Passo 3: Verificar

```bash
curl https://SUA-URL.vercel.app/api/setup/check-tables
```

Deve retornar 15 tabelas.

---

## ✅ Pronto!

Agora acesse:

```
https://SUA-URL.vercel.app
```

Login: `admin` / `admin123`

---

## 🔍 Testar API

```bash
# Health check
curl https://SUA-URL.vercel.app/api/health

# Verificar tabelas
curl https://SUA-URL.vercel.app/api/setup/check-tables
```

---

## 📝 Arquitetura Final

```
Vercel Deploy
├── Frontend (Next.js Pages)
├── API Routes (/api/*)
│   ├── /api/health
│   ├── /api/setup/*
│   ├── /api/auth/*
│   └── ... (todas as APIs)
└── Turso Database (cloud)
```

**Tudo 100% Web! 🎉**

---

## ⚙️ Próximos Passos

Agora você pode:

1. ✅ Deletar o backend do Railway (não é mais necessário)
2. ✅ Acessar o sistema via Vercel
3. ✅ Começar a usar!

---

## 🆘 Problemas?

### Erro: "TURSO_DATABASE_URL não configurado"

- Vá em Settings → Environment Variables na Vercel
- Adicione `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`
- Redeploy

### API não responde

- Verifique logs: Vercel Dashboard → Deployment → Functions
- Certifique-se que Root Directory = `frontend`

### Frontend carrega mas API não

- API Routes ficam em: `https://seu-app.vercel.app/api/*`
- Teste: `https://seu-app.vercel.app/api/health`
