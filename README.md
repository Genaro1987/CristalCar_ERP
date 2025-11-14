# CristalCar ERP

Monorepositório para o ERP da CristalCar com separação entre backend (API Turso) e frontend (Next.js na Vercel).

## Estrutura

```
.
├── backend/    # API Node.js integrada ao Turso
├── frontend/   # Frontend Next.js preparado para Vercel
└── README.md   # Visão geral do projeto
```

## Integração Turso ↔ GitHub

1. Crie o banco no [Turso](https://turso.tech) e gere um token de acesso.
2. Adicione `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` como **Secrets** no repositório do GitHub.
3. Configure workflows (ex.: GitHub Actions) para executar migrações e testes a cada push.
4. O backend utiliza o cliente oficial `@libsql/client` para consultas e inserções.

## Integração GitHub ↔ Vercel

1. No painel da [Vercel](https://vercel.com), importe este repositório.
2. Selecione a pasta `frontend` como raiz do projeto e mantenha os scripts padrão do Next.js.
3. Informe `NEXT_PUBLIC_API_URL` nas variáveis de ambiente da Vercel, apontando para a API em produção.
4. Cada push na branch configurada acionará builds automáticos.

## Próximos passos sugeridos

- Adicionar pipeline CI/CD no GitHub para validar lint/teste do backend e frontend.
- Configurar migrações automatizadas do Turso via CLI ou workflows.
- Implementar autenticação JWT na API e páginas protegidas no frontend.
- Monitorar logs e métricas com ferramentas como Grafana, Vercel Analytics e Sentry.
