# CristalCar ERP

Sistema ERP completo para gestão de empresa do segmento automotivo, com foco em fluxo de caixa, DRE e conciliação financeira.

## Tecnologias

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (tema laranja e cinza)
- **shadcn/ui** (componentes)
- **Recharts** (gráficos)
- **React Hook Form** + **Zod** (formulários)
- **TanStack Table** (tabelas)
- **Vercel** (deploy)

### Backend
- **Node.js** + **Express**
- **Turso Database** (SQLite distribuído)
- **Drizzle ORM**
- **JWT** (autenticação)
- **bcryptjs** (hash de senhas)
- **xml2js** (importação de NF-e)

## Estrutura do Projeto

```
.
├── backend/          # API Node.js com Express
│   ├── src/
│   │   ├── db/      # Schema e configuração do banco
│   │   ├── routes/  # Rotas da API
│   │   └── middleware/ # Middlewares (auth, etc)
│   └── package.json
│
└── frontend/        # Frontend Next.js
    ├── src/
    │   ├── app/     # Páginas (App Router)
    │   ├── components/ # Componentes reutilizáveis
    │   └── lib/     # Utilitários
    └── package.json
```

## Funcionalidades Implementadas

### Módulo Administrativo
- Cadastro de funcionários
- Cadastro de usuários com controle de acesso
- Sistema de login e autenticação JWT
- Importação de arquivos

### Finanças
- **Plano de Contas** (até 9 níveis hierárquicos)
  - Receitas e despesas
  - Classificação fixo/variável
  - Vinculação com objetivos
- **Plano DRE** (Demonstração do Resultado do Exercício)
  - Estrutura customizável
  - Vinculação com plano de contas
- **Cadastro de Bancos**
  - Gestão de contas bancárias
  - Saldos iniciais

### Movimentação Financeira
- Registro de entradas e saídas
- Vinculação com plano de contas
- Integração com notas fiscais
- Conciliação bancária
- Múltiplas formas de pagamento

### Faturamento (Vendas)
- Importação de XML de NF-e
- Registro de vencimentos
- Controle de recebimentos
- Dados completos de clientes

### Compras
- Importação de XML de NF-e
- Registro de pagamentos
- Controle de fornecedores
- 3 formas de importação:
  - Manual
  - E-mail (planejado)
  - API SEFAZ (planejado)

### Objetivos e Metas
- Cadastro de metas trimestrais
- Distribuição automática por semana
- Acompanhamento meta vs realizado

### Relatórios
- **DRE** completo por período
- **Fluxo de Caixa** detalhado
- **Objetivos vs Realizado**
- Exportação Excel e PDF

## Configuração e Instalação

### Pré-requisitos

1. Node.js 18+ instalado
2. Conta no [Turso](https://turso.tech)
3. (Opcional) Conta na [Vercel](https://vercel.com)

### 1. Configurar Turso Database

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Fazer login
turso auth login

# Criar banco de dados
turso db create cristalcar-erp

# Obter URL e token
turso db show cristalcar-erp
turso db tokens create cristalcar-erp
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cat > .env << EOF
TURSO_DATABASE_URL=libsql://cristalcar-erp-[seu-usuario].turso.io
TURSO_AUTH_TOKEN=[seu-token]
JWT_SECRET=seu-secret-key-super-seguro
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
EOF

# Gerar migrations (cria as tabelas)
npm run db:push

# Iniciar servidor de desenvolvimento
npm run dev
```

O backend estará rodando em `http://localhost:4000`

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

### 4. Primeiro Acesso

1. Acesse `http://localhost:3000/login`
2. Se for o primeiro acesso, o sistema pedirá para criar o usuário administrador
3. Após criar, faça login com as credenciais criadas

## Deploy

### Backend (Render, Railway, ou similar)

1. Crie um novo serviço
2. Conecte o repositório GitHub
3. Configure as variáveis de ambiente:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS` (URL do frontend na Vercel)
   - `NODE_ENV=production`
4. Build command: `cd backend && npm install`
5. Start command: `cd backend && npm start`

### Frontend (Vercel)

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Deploy
cd frontend
vercel

# Ou conecte o repositório GitHub diretamente na interface da Vercel
```

**Configurações na Vercel:**
- Framework: Next.js
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `.next`
- Environment Variables:
  - `NEXT_PUBLIC_API_URL`: URL do backend em produção

## Schema do Banco de Dados

### Principais Tabelas

- `funcionarios` - Cadastro de funcionários
- `usuarios` - Usuários do sistema
- `plano_contas` - Plano de contas (9 níveis)
- `plano_dre` - Estrutura do DRE
- `dre_contas_vinculadas` - Vinculação DRE x Plano de Contas
- `bancos` - Contas bancárias
- `movimentacoes` - Movimentações financeiras
- `notas_fiscais_venda` - NF-e de vendas
- `vendas_parcelas` - Parcelas das vendas
- `notas_fiscais_compra` - NF-e de compras
- `compras_parcelas` - Parcelas das compras
- `objetivos` - Metas trimestrais
- `objetivos_semanas` - Distribuição semanal das metas
- `arquivos_importados` - Log de importações
- `logs_auditoria` - Auditoria do sistema

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/setup` - Criar primeiro usuário admin
- `GET /api/auth/check-setup` - Verificar se precisa setup

### Módulos (todos requerem autenticação)
- `/api/funcionarios` - CRUD de funcionários
- `/api/usuarios` - CRUD de usuários
- `/api/plano-contas` - CRUD plano de contas
- `/api/plano-dre` - CRUD plano DRE
- `/api/bancos` - CRUD bancos
- `/api/movimentacoes` - CRUD movimentações
- `/api/notas-fiscais-venda` - NF-e vendas
- `/api/notas-fiscais-compra` - NF-e compras
- `/api/objetivos` - Metas e objetivos
- `/api/relatorios/dre` - Relatório DRE
- `/api/relatorios/fluxo-caixa` - Fluxo de caixa

## Funcionalidades Futuras

- [ ] Importação automática de XML por e-mail
- [ ] Integração com API SEFAZ
- [ ] Dashboard com gráficos interativos (Recharts)
- [ ] Exportação PDF completa
- [ ] Gestão de estoque
- [ ] Ordem de serviço
- [ ] CRM básico
- [ ] Notificações por e-mail
- [ ] Backup automático

## Contribuindo

Este é um projeto privado para a CristalCar. Contate o administrador para mais informações.

## Suporte

Para suporte, entre em contato com a equipe de TI.

## Licença

Propriedade da CristalCar - Todos os direitos reservados
