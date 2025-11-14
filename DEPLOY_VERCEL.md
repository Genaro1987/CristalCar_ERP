# Vercel - Deploy Manual (Recomendado)

## Passos para Deploy na Vercel

### 1. Acesse o Dashboard da Vercel

1. Vá em: https://vercel.com/login
2. Faça login com sua conta GitHub

### 2. Importe o Projeto

1. Clique em **"Add New..."** → **"Project"**
2. Selecione o repositório **CristalCar_ERP**
3. Clique em **"Import"**

### 3. Configure o Projeto

**IMPORTANTE - Configure assim:**

- **Framework Preset:** Next.js
- **Root Directory:** Clique em "Edit" e digite: `frontend`
- **Build Command:** `npm run build` (deixe padrão)
- **Output Directory:** `.next` (deixe padrão)
- **Install Command:** `npm install` (deixe padrão)

### 4. Adicione Variável de Ambiente

Antes de fazer deploy, clique em **"Environment Variables"** e adicione:

**Name:** `NEXT_PUBLIC_API_URL`
**Value:** (Cole a URL do seu backend Railway)

Exemplo: `https://cristalcar-erp-production.up.railway.app`

**IMPORTANTE:**
- Não coloque barra `/` no final da URL
- Use a URL completa que o Railway te deu

### 5. Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Quando terminar, clique na URL gerada

### 6. Se der erro 404

Se ainda der 404, faça isso:

1. No dashboard da Vercel, vá em **Settings**
2. Em **General** → **Root Directory**
3. Confirme que está: `frontend`
4. Se mudou algo, clique em **"Deployments"**
5. No último deployment, clique nos 3 pontinhos → **"Redeploy"**

---

## Desabilitar GitHub Actions (Temporariamente)

Vamos desabilitar o workflow automático até configurar os secrets:

No seu repositório GitHub:
1. Settings → Actions → General
2. Em "Actions permissions", selecione: "Disable actions"

Ou renomeie o arquivo:
- `.github/workflows/deploy.yml` → `.github/workflows/deploy.yml.disabled`
