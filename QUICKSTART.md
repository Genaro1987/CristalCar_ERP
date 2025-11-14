# 🚀 Início Rápido - CristalCar ERP

Guia rápido para colocar o sistema no ar em 15 minutos.

## ⚡ Configuração Rápida

### 1. Configure o Turso (5 min)

```bash
# Instalar CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login e criar DB
turso auth login
turso db create cristalcar-erp

# Obter credenciais (copie para usar no próximo passo)
turso db show cristalcar-erp
turso db tokens create cristalcar-erp
```

### 2. Configure o Backend (5 min)

```bash
cd backend

# Instalar dependências
npm install

# Criar .env (cole suas credenciais do Turso)
cat > .env << 'EOF'
TURSO_DATABASE_URL=cole-sua-url-aqui
TURSO_AUTH_TOKEN=cole-seu-token-aqui
JWT_SECRET=mude-para-algo-super-secreto-e-aleatorio
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
EOF

# Criar tabelas no Turso
npm run db:push

# Verificar conexão
npm run db:check

# Inicializar dados (cria admin/admin123)
npm run db:init

# Rodar servidor
npm run dev
```

**Servidor rodando em:** http://localhost:4000

### 3. Configure o Frontend (5 min)

```bash
cd frontend

# Instalar dependências
npm install

# Criar .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF

# Rodar aplicação
npm run dev
```

**Frontend rodando em:** http://localhost:3000

### 4. Acesse o Sistema

1. Abra: http://localhost:3000
2. Login: `admin` / `admin123`
3. Pronto! 🎉

---

## 🌐 Deploy Rápido para Produção

### Backend (Railway - 3 min)

1. Acesse [railway.app](https://railway.app)
2. New Project → Deploy from GitHub → Selecione o repo
3. Configure:
   - Root: `backend`
   - Adicione as mesmas variáveis do .env (EXCETO `ALLOWED_ORIGINS`)
4. Copie a URL gerada

### Frontend (Vercel - 3 min)

1. Acesse [vercel.com](https://vercel.com)
2. Import Project → Selecione o repo
3. Configure:
   - Framework: Next.js
   - Root: `frontend`
   - Add env: `NEXT_PUBLIC_API_URL` = URL do Railway
4. Deploy

### Finalize

1. Volte no Railway
2. Adicione variável: `ALLOWED_ORIGINS` = URL da Vercel
3. Redeploy
4. Acesse a URL da Vercel e faça login!

---

## 📝 Comandos Úteis

```bash
# Backend
npm run dev          # Rodar servidor
npm run db:check     # Verificar conexão Turso
npm run db:init      # Inicializar dados
npm run db:push      # Criar/atualizar tabelas

# Frontend
npm run dev          # Rodar aplicação
npm run build        # Build produção
npm run lint         # Verificar erros

# Turso
turso db shell cristalcar-erp    # Acessar banco
turso db show cristalcar-erp     # Ver informações
```

---

## ❓ Problemas?

**Erro de conexão com Turso:**
```bash
npm run db:check  # Ver detalhes do erro
```

**Backend não inicia:**
- Verifique se todas as variáveis do .env estão preenchidas
- Verifique se a porta 4000 está livre

**Frontend não conecta:**
- Verifique se `NEXT_PUBLIC_API_URL` está correto
- Verifique se o backend está rodando

**Login não funciona:**
- Execute: `npm run db:init` no backend
- Credenciais: admin/admin123

---

## 📚 Próximos Passos

1. ✅ Altere a senha do admin
2. ✅ Crie usuários adicionais
3. ✅ Configure o plano de contas da sua empresa
4. ✅ Comece a registrar movimentações
5. ✅ Explore os relatórios

---

**Precisa de ajuda?** Veja `SETUP.md` para instruções detalhadas.

**Checklist completo:** Veja `CHECK_DEPLOYMENT.md`
