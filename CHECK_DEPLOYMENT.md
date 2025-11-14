# ✅ Checklist de Verificação de Deploy

Use este checklist para garantir que tudo está configurado corretamente.

## 📋 Pré-Deploy

### 1. Turso Database

- [ ] Turso CLI instalado (`turso --version`)
- [ ] Login realizado (`turso auth login`)
- [ ] Database criado (`turso db create cristalcar-erp`)
- [ ] URL obtida (`turso db show cristalcar-erp`)
- [ ] Token gerado (`turso db tokens create cristalcar-erp`)

### 2. Backend Local

- [ ] Arquivo `backend/.env` criado com:
  - [ ] `TURSO_DATABASE_URL`
  - [ ] `TURSO_AUTH_TOKEN`
  - [ ] `JWT_SECRET`
  - [ ] `PORT`
  - [ ] `ALLOWED_ORIGINS`

- [ ] Dependências instaladas (`cd backend && npm install`)
- [ ] Tabelas criadas (`npm run db:push`)
- [ ] Conexão verificada (`npm run db:check`)
- [ ] Banco inicializado (`npm run db:init`)
- [ ] Servidor rodando (`npm run dev`)
- [ ] Health check funcionando: `curl http://localhost:4000/health`

### 3. Frontend Local

- [ ] Arquivo `frontend/.env.local` criado com:
  - [ ] `NEXT_PUBLIC_API_URL=http://localhost:4000`

- [ ] Dependências instaladas (`cd frontend && npm install`)
- [ ] Build sem erros (`npm run build`)
- [ ] Servidor rodando (`npm run dev`)
- [ ] Acesso funcionando: `http://localhost:3000`
- [ ] Login funcionando (admin/admin123)

## 🚀 Deploy

### 4. Backend em Produção (Railway/Render)

**Railway:**
- [ ] Projeto criado no Railway
- [ ] Repositório conectado
- [ ] Root Directory: `backend`
- [ ] Variáveis de ambiente configuradas:
  - [ ] `TURSO_DATABASE_URL`
  - [ ] `TURSO_AUTH_TOKEN`
  - [ ] `JWT_SECRET` (diferente do desenvolvimento!)
  - [ ] `NODE_ENV=production`
  - [ ] `ALLOWED_ORIGINS` (URL da Vercel)
- [ ] Deploy realizado com sucesso
- [ ] URL copiada (ex: `https://cristalcar-api.up.railway.app`)
- [ ] Health check funcionando: `curl https://[sua-url]/health`

**OU Render:**
- [ ] Web Service criado
- [ ] Repositório conectado
- [ ] Environment: Node
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Variáveis de ambiente configuradas (mesmas acima)
- [ ] Deploy realizado com sucesso
- [ ] URL copiada
- [ ] Health check funcionando

### 5. Frontend na Vercel

**Via Dashboard:**
- [ ] Projeto importado do GitHub
- [ ] Framework: Next.js
- [ ] Root Directory: `frontend`
- [ ] Variável de ambiente `NEXT_PUBLIC_API_URL` configurada (URL do backend)
- [ ] Deploy realizado com sucesso
- [ ] URL copiada (ex: `https://cristalcar-erp.vercel.app`)
- [ ] Site acessível no navegador

**OU via CLI:**
- [ ] Vercel CLI instalado (`npm i -g vercel`)
- [ ] Login realizado (`vercel login`)
- [ ] Deploy realizado (`cd frontend && vercel --prod`)
- [ ] Variável de ambiente configurada (`vercel env add`)
- [ ] Redeploy realizado

### 6. Atualizar CORS

- [ ] Atualizar `ALLOWED_ORIGINS` no backend com a URL da Vercel
- [ ] Redeploy do backend
- [ ] Testar conexão entre frontend e backend

## 🧪 Testes de Integração

### 7. Testar Sistema Completo

- [ ] **Página de Login**
  - [ ] Carrega sem erros
  - [ ] Login funciona com admin/admin123
  - [ ] Token é salvo no localStorage
  - [ ] Redireciona para dashboard

- [ ] **Dashboard**
  - [ ] Carrega corretamente
  - [ ] Estatísticas aparecem
  - [ ] Menu lateral funciona
  - [ ] Header aparece

- [ ] **Plano de Contas**
  - [ ] Lista carrega
  - [ ] Modal de criação abre
  - [ ] Consegue criar nova conta
  - [ ] Nova conta aparece na lista

- [ ] **Movimentações**
  - [ ] Lista carrega
  - [ ] Modal de criação abre
  - [ ] Consegue criar movimentação
  - [ ] Nova movimentação aparece na lista

### 8. Testar APIs Diretamente

```bash
# Substitua [BACKEND_URL] pela sua URL

# 1. Health Check
curl https://[BACKEND_URL]/health

# 2. Login
curl -X POST https://[BACKEND_URL]/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","senha":"admin123"}'

# 3. Listar Plano de Contas (substitua [TOKEN])
curl https://[BACKEND_URL]/api/plano-contas \
  -H "Authorization: Bearer [TOKEN]"

# 4. Listar Movimentações
curl https://[BACKEND_URL]/api/movimentacoes \
  -H "Authorization: Bearer [TOKEN]"
```

## 🔒 Segurança

### 9. Checklist de Segurança

- [ ] Senha do admin alterada
- [ ] `JWT_SECRET` em produção é diferente do desenvolvimento
- [ ] `JWT_SECRET` tem pelo menos 32 caracteres aleatórios
- [ ] Arquivos `.env` não foram commitados no Git
- [ ] `ALLOWED_ORIGINS` está configurado corretamente (não usar `*` em produção)
- [ ] HTTPS está ativado (Vercel e Railway/Render fazem isso automaticamente)
- [ ] Tokens do Turso são secretos e não compartilhados

## 📊 Monitoramento

### 10. Configurar Monitoramento

**Turso:**
- [ ] Verificar uso: `turso db usage cristalcar-erp`
- [ ] Monitorar queries lentas no dashboard

**Vercel:**
- [ ] Analytics ativado
- [ ] Logs sendo capturados
- [ ] Alertas configurados

**Backend:**
- [ ] Logs acessíveis no Railway/Render
- [ ] Métricas de uso disponíveis
- [ ] Alertas de erro configurados (opcional)

## 🎯 Performance

### 11. Otimizações

- [ ] Frontend:
  - [ ] Build otimizado (`npm run build` sem warnings)
  - [ ] Images otimizadas
  - [ ] Lighthouse score > 80

- [ ] Backend:
  - [ ] Índices criados no Turso (se necessário)
  - [ ] Rate limiting configurado (opcional)
  - [ ] Cache configurado (opcional)

## 📝 Documentação

### 12. Documentação Atualizada

- [ ] URLs de produção atualizadas no README
- [ ] Credenciais de acesso documentadas
- [ ] Processo de backup documentado
- [ ] Contatos de suporte definidos

## 🎉 Finalização

### 13. Go Live

- [ ] Todos os itens acima verificados
- [ ] Equipe treinada no sistema
- [ ] Dados de teste criados
- [ ] Backup inicial realizado
- [ ] Domínio customizado configurado (opcional)
- [ ] Sistema em produção! 🚀

---

## 🆘 Problemas Comuns

### Frontend não carrega
```bash
# Verificar logs
vercel logs [url]

# Verificar variáveis de ambiente
vercel env ls
```

### Backend não responde
```bash
# Railway
railway logs

# Render
# Ver logs no dashboard
```

### Erro de CORS
```bash
# Atualizar ALLOWED_ORIGINS no backend
# Formato: https://seu-app.vercel.app (sem barra no final)
```

### Erro de autenticação
```bash
# Verificar se JWT_SECRET é o mesmo em prod
# Gerar novo token se necessário
```

### Banco não conecta
```bash
# Verificar tokens
turso db tokens create cristalcar-erp

# Verificar URL
turso db show cristalcar-erp
```

---

**Data da última verificação:** _________

**Responsável:** _________

**Status:** ⬜ Desenvolvimento | ⬜ Homologação | ⬜ Produção
