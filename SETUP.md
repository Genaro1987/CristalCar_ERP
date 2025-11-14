# Guia de Configuração Turso e Vercel

Este guia detalha o processo completo de configuração do Turso Database e deploy na Vercel.

## 1. Configurar Turso Database

### Instalar Turso CLI

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (PowerShell)
irm get.tur.so/install.ps1 | iex
```

### Criar e Configurar Database

```bash
# 1. Fazer login no Turso
turso auth login

# 2. Criar banco de dados
turso db create cristalcar-erp

# 3. Obter URL do banco
turso db show cristalcar-erp
# Copie a URL que aparece (ex: libsql://cristalcar-erp-[usuario].turso.io)

# 4. Gerar token de autenticação
turso db tokens create cristalcar-erp
# Copie o token gerado

# 5. (Opcional) Acessar shell do banco para verificar
turso db shell cristalcar-erp
```

### Variáveis de Ambiente Backend

Crie o arquivo `backend/.env`:

```bash
cd backend

cat > .env << 'EOF'
# Turso Database
TURSO_DATABASE_URL=libsql://cristalcar-erp-[SEU-USUARIO].turso.io
TURSO_AUTH_TOKEN=[SEU-TOKEN-AQUI]

# Server
PORT=4000
NODE_ENV=development

# JWT Secret (MUDE EM PRODUÇÃO!)
JWT_SECRET=cristalcar-super-secret-key-change-in-production-xyz123

# CORS - URLs permitidas (separadas por vírgula)
ALLOWED_ORIGINS=http://localhost:3000,https://cristalcar-erp.vercel.app
EOF
```

### Criar Tabelas no Turso

```bash
# Dentro da pasta backend
npm install
npm run db:push

# Verificar se as tabelas foram criadas
turso db shell cristalcar-erp

# No shell do Turso, execute:
.tables
# Você deve ver todas as 18 tabelas criadas
```

## 2. Configurar Vercel

### Opção A: Via Interface Web (Recomendado)

1. **Acesse [vercel.com](https://vercel.com)** e faça login

2. **Importe o Repositório:**
   - Clique em "Add New Project"
   - Selecione o repositório `CristalCar_ERP`
   - Clique em "Import"

3. **Configure o Projeto:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

4. **Adicione Variáveis de Ambiente:**

   Clique em "Environment Variables" e adicione:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | URL do seu backend (veja seção 3) |

5. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build completar
   - Copie a URL gerada (ex: `https://cristalcar-erp.vercel.app`)

### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Navegar para pasta frontend
cd frontend

# Deploy
vercel

# Seguir as instruções:
# - Link to existing project? No
# - What's your project's name? cristalcar-erp
# - In which directory is your code located? ./
# - Want to override the settings? No

# Deploy para produção
vercel --prod
```

### Configurar Variáveis de Ambiente via CLI

```bash
# Adicionar variável de ambiente
vercel env add NEXT_PUBLIC_API_URL

# Quando solicitado:
# - Valor: URL do backend (ex: https://cristalcar-api.railway.app)
# - Environments: Production, Preview, Development (selecionar todos)
```

## 3. Deploy do Backend

### Opção A: Railway

1. **Acesse [railway.app](https://railway.app)**

2. **Criar Novo Projeto:**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha `CristalCar_ERP`

3. **Configurar:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Adicionar Variáveis de Ambiente:**
   ```
   TURSO_DATABASE_URL=libsql://cristalcar-erp-[usuario].turso.io
   TURSO_AUTH_TOKEN=[seu-token]
   JWT_SECRET=[seu-secret-seguro]
   PORT=4000
   NODE_ENV=production
   ALLOWED_ORIGINS=https://cristalcar-erp.vercel.app
   ```

5. **Deploy:**
   - Railway fará deploy automaticamente
   - Copie a URL gerada (ex: `https://cristalcar-api.up.railway.app`)
   - Adicione esta URL como `NEXT_PUBLIC_API_URL` na Vercel

### Opção B: Render

1. **Acesse [render.com](https://render.com)**

2. **Criar Web Service:**
   - "New +" → "Web Service"
   - Conecte o repositório GitHub
   - Nome: `cristalcar-api`

3. **Configurar:**
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Variáveis de Ambiente:**
   Adicione as mesmas variáveis da Railway

5. **Deploy:**
   - Clique em "Create Web Service"
   - Copie a URL (ex: `https://cristalcar-api.onrender.com`)

## 4. Atualizar Frontend com URL do Backend

Depois de fazer deploy do backend:

1. **Via Vercel Dashboard:**
   - Acesse seu projeto na Vercel
   - Settings → Environment Variables
   - Edite `NEXT_PUBLIC_API_URL`
   - Valor: URL do backend (ex: `https://cristalcar-api.railway.app`)
   - Salve e faça redeploy

2. **Via CLI:**
   ```bash
   cd frontend
   vercel env add NEXT_PUBLIC_API_URL production
   # Cole a URL do backend

   # Redeploy
   vercel --prod
   ```

## 5. Verificar Conexões

### Testar Backend

```bash
# Substitua pela URL do seu backend
curl https://cristalcar-api.railway.app/health

# Deve retornar:
# {"status":"ok","timestamp":"2025-11-14T..."}
```

### Testar Frontend

1. Acesse a URL do Vercel (ex: `https://cristalcar-erp.vercel.app`)
2. Você deve ver a página de login
3. Tente fazer setup do primeiro usuário

### Verificar Conexão Turso

```bash
# Conectar ao banco
turso db shell cristalcar-erp

# Verificar se há dados
SELECT * FROM usuarios LIMIT 5;
SELECT COUNT(*) FROM plano_contas;

# Sair
.quit
```

## 6. Configurar Domínio Customizado (Opcional)

### Na Vercel:

1. Settings → Domains
2. Adicione seu domínio (ex: `erp.cristalcar.com`)
3. Configure DNS conforme instruções da Vercel

### No Backend (Railway/Render):

1. Configure domínio customizado (ex: `api.cristalcar.com`)
2. Atualize `NEXT_PUBLIC_API_URL` na Vercel
3. Atualize `ALLOWED_ORIGINS` no backend

## 7. Monitoramento

### Turso Database:

```bash
# Ver estatísticas do banco
turso db show cristalcar-erp

# Ver uso
turso db usage cristalcar-erp
```

### Vercel:

- Dashboard: Analytics e Logs
- Acesse: https://vercel.com/[seu-usuario]/cristalcar-erp

### Backend:

- Railway: https://railway.app (Metrics e Logs)
- Render: https://dashboard.render.com (Logs)

## 8. Troubleshooting

### Erro: "TURSO_DATABASE_URL não configurado"

- Verifique se as variáveis de ambiente estão corretas
- No Railway/Render, vá em Variables e confirme os valores

### Erro: "CORS blocked"

- Adicione a URL do frontend em `ALLOWED_ORIGINS`
- Formato: `https://seu-app.vercel.app` (sem barra no final)

### Erro: "Token inválido"

- Gere novo token no Turso: `turso db tokens create cristalcar-erp`
- Atualize `TURSO_AUTH_TOKEN` no backend

### Frontend não conecta ao Backend:

- Verifique `NEXT_PUBLIC_API_URL` na Vercel
- Teste a URL do backend diretamente no navegador
- Verifique logs do backend

## 9. Comandos Úteis

```bash
# Turso
turso db list                          # Listar todos os bancos
turso db show cristalcar-erp          # Ver detalhes
turso db destroy cristalcar-erp       # Deletar banco (CUIDADO!)

# Vercel
vercel ls                              # Listar projetos
vercel logs [url]                      # Ver logs
vercel env ls                          # Listar variáveis

# Git
git push origin main                   # Trigger deploy automático
```

## 10. Backup e Segurança

### Backup Turso:

```bash
# Exportar dados
turso db shell cristalcar-erp ".dump backup.sql"

# Restaurar
turso db shell cristalcar-erp < backup.sql
```

### Secrets:

- Nunca commite arquivos `.env`
- Use secrets do GitHub para CI/CD
- Rotacione tokens regularmente

## Suporte

- **Turso:** https://docs.turso.tech
- **Vercel:** https://vercel.com/docs
- **Railway:** https://docs.railway.app
- **Render:** https://render.com/docs

---

✅ Após seguir estes passos, seu ERP CristalCar estará 100% operacional na nuvem!
