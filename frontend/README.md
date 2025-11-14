# Frontend CristalCar ERP

Aplicação Next.js preparada para deploy automático na Vercel.

## Requisitos

- Node.js 18 ou superior
- Conta na [Vercel](https://vercel.com)

## Configuração local

1. Copie `.env.example` para `.env.local` e ajuste a URL da API:
   ```bash
   cp .env.example .env.local
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Deploy na Vercel

1. No dashboard da Vercel, crie um novo projeto importando este repositório do GitHub.
2. Aponte a pasta `frontend` como diretório raiz.
3. Defina as variáveis de ambiente:
   - `NEXT_PUBLIC_API_URL`: URL pública da API hospedada (Railway/Render/etc.).
4. Execute o deploy. Cada novo push na branch selecionada disparará um novo build.

## Boas práticas

- Configure `Preview Deployments` para branches de feature.
- Utilize [Vercel Analytics](https://vercel.com/analytics) para monitorar performance.
- Ajuste regras de cache na API para reduzir latência percebida.
