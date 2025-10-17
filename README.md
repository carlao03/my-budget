# FinanceApp

Aplicacao web construida com Next.js e Supabase para gerenciar financas pessoais. Este guia explica como executar o projeto em ambiente local.

## Pre-requisitos
- **Node.js** >= 18.18 (Next.js 15 depende de Node 18 ou superior). Verifique com `node --version`.
- **pnpm** >= 8. Com Node 18 ou mais novo voce pode ativar o Corepack (`corepack enable pnpm`). Em alternativa, instale via `npm install -g pnpm`.
- Uma conta no **Supabase** para criar o banco de dados e habilitar a autenticacao.

## Como iniciar
1. **Clonar o repositorio** (ou baixar o codigo fonte).
2. **Instalar dependencias**:
   ```powershell
   pnpm install
   ```
3. **Configurar variaveis de ambiente** criando um arquivo `.env.local` na raiz do projeto:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<sua-instancia>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-chave-anon>
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   # Opcional: redirecionamento usado durante o fluxo de cadastro
   # NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
   ```
   > Mantenha este arquivo fora de commits publicos; ele contem segredos do Supabase.

4. **Preparar o banco Supabase**:
   - Crie um projeto no painel do Supabase, copie a URL e a anon key para o `.env.local`.
   - No SQL Editor do Supabase, execute `scripts/001_create_tables.sql` e depois `scripts/002_seed_default_categories.sql` para criar e popular as tabelas padrao.

5. **Executar em modo desenvolvimento**:
   ```powershell
   pnpm dev
   ```
   A aplicacao ficara disponivel em `http://localhost:3000`.

## Scripts uteis
- `pnpm dev`: inicia o servidor de desenvolvimento com hot reload.
- `pnpm lint`: roda o ESLint.
- `pnpm build`: gera o build de producao.
- `pnpm start`: levanta o servidor em modo producao (requer `pnpm build` antes).

## Estrutura principal
- `app/`: rotas, layouts e componentes server/client do Next.js.
- `components/`: componentes de UI reutilizaveis.
- `lib/`: integracoes com Supabase, contexto de autenticacao e utilitarios.
- `scripts/`: scripts SQL para inicializar o banco Supabase.
- `styles/`: estilos globais (Tailwind CSS).

## Dicas e solucao de problemas
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estao definidos antes de iniciar o servidor.
- Caso os emails de confirmacao do Supabase nao redirecionem corretamente, ajuste `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` para uma URL valida da aplicacao.
- Rode `pnpm lint` antes de gerar o build para capturar problemas comuns.
- Ao trocar de branch, execute `pnpm install` para garantir que `node_modules/` esteja atualizado.

Seguindo esses passos o projeto deve rodar localmente sem problemas. Boas contribuicoes!
