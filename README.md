# Zabix Tech — Portal de Serviços de TI

Portal corporativo construído com **React + TypeScript + Tailwind CSS + Supabase**, reproduzindo o layout de login e dashboard das imagens de referência (sidebar azul-marinho escura, banner de boas-vindas, cards de serviço, tabela de chamados e indicadores).

## O que já está pronto e funcional

- **Login real** via Supabase Auth (e-mail/senha), com "lembrar usuário", recuperação de senha e persistência de sessão.
- **Dashboard** com banner, 8 cards de serviço, tabela "Meus Chamados", 4 indicadores, "Acesso Rápido" e "Comunicados" — todos lendo dados reais do Supabase.
- **Chamados**: abrir chamado, meus chamados, todos os chamados, **tela de detalhe do chamado** com comentários, e atribuição de técnico + mudança de status (para técnico/admin).
- **Compras**: solicitar compra e acompanhar compras, gravando/lendo da tabela `purchases`.
- **Almoxarifado**: leitura da tabela `inventory` com alerta de estoque baixo.
- **Base de Conhecimento** e **Comunicados** (lista completa).
- **Financeiro**: Contas a Pagar, Contas a Receber (lançamento pelo admin, leitura para todos) e Relatórios com totais consolidados.
- **RH**: Solicitações, Férias e Ponto (registro de entrada/saída), cada colaborador vendo os próprios registros e o admin vendo todos.
- **Configurações**: cada usuário edita seu próprio perfil (nome, cargo, departamento) e pode disparar a redefinição da própria senha.
- **Administração de usuários** (menu "Administração" → "Usuários", visível só para quem tem `role = admin`):
  - Criar novos usuários (define se a pessoa é **usuário** — só abre chamados —, **técnico** — atende chamados — ou **admin**).
  - Resetar a senha de qualquer usuário instantaneamente (gera uma senha temporária).
  - Mudar o perfil de acesso (`usuario` / `tecnico` / `admin`) de qualquer pessoa a qualquer momento.
- **Banco de dados completo no Supabase**: schema, RLS (usuário/técnico/admin) e dados de exemplo (seed) em `supabase/`.
- Sidebar com todos os menus pedidos (mais "Administração" para admins), header com busca/notificações/menu de usuário, totalmente responsivo.

## Criar e resetar usuários (admin)

Criar um usuário e resetar a senha de alguém exige privilégio de administrador do Supabase (a chamada `service_role`), que **nunca pode ficar no navegador** — senão qualquer pessoa poderia abrir o DevTools e criar contas de admin para si mesma. Por isso essas duas ações rodam em **Edge Functions**, incluídas em `supabase/functions/`:

- `admin-create-user` — recebe nome/e-mail/cargo/perfil, confere que quem chamou é admin, e cria o usuário de verdade no Supabase Auth.
- `admin-reset-password` — confere que quem chamou é admin e define uma nova senha temporária para o usuário indicado.

### Deploy das funções

```bash
npm install -g supabase
supabase login
supabase link --project-ref SEU_PROJECT_REF

supabase functions deploy admin-create-user
supabase functions deploy admin-reset-password
```

Essas funções usam variáveis de ambiente que o Supabase já injeta automaticamente em toda Edge Function (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) — você não precisa configurar nada manualmente além do deploy.

Sem esse deploy, os botões "Novo usuário" e "Resetar senha" na tela de Administração mostram um erro explicando que a função ainda não foi publicada — o restante do sistema continua funcionando normalmente.

## Atribuição de chamados (quem atende)

Ao abrir o detalhe de um chamado (clique no número do chamado em qualquer tabela), administradores e técnicos veem dois campos extras: **Atribuir a** (lista de usuários com perfil técnico/admin) e **Status**. Um usuário comum só vê a conversa e pode comentar, sem poder reatribuir o chamado — isso é reforçado tanto na interface quanto nas políticas de RLS do banco.


## O primeiro administrador

O trigger `on_auth_user_created` cria automaticamente todo novo usuário com `role = usuario`. Ou seja, mesmo criando alguém pela tela de Administração como "Administrador", **você precisa de pelo menos um admin já existente para começar** — é o mesmo problema do "ovo e da galinha" de qualquer sistema com papéis. Resolva isso uma única vez, manualmente, pelo passo 3 abaixo (criar o primeiro admin direto no SQL Editor). Depois disso, esse admin já consegue criar todos os próximos usuários pela interface.

## Pré-requisitos

- Node.js 18+
- Uma conta e um projeto no [Supabase](https://supabase.com)

## Passo a passo

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com/dashboard).
2. No **SQL Editor**, rode nesta ordem:
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/migrations/0003_financeiro_rh.sql`
   - `supabase/seed.sql`

### 3. Criar o usuário administrador de teste

1. Vá em **Authentication → Users → Add user** e crie, por exemplo, `admin@zabixtech.com.br` com uma senha.
2. Copie o UUID do usuário criado.
3. No SQL Editor, rode (substituindo o UUID):

```sql
update public.profiles
  set nome = 'Administrador Zabix', cargo = 'Administrador de TI',
      departamento = 'TI', role = 'admin'
  where user_id = 'COLE-AQUI-O-UUID-DO-USUARIO';
```

> O profile de qualquer novo usuário é criado automaticamente pelo trigger `on_auth_user_created` — o UPDATE acima só ajusta a role para `admin`.

### 4. Publicar as Edge Functions (criação e reset de usuários)

```bash
npm install -g supabase
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase functions deploy admin-create-user
supabase functions deploy admin-reset-password
```

### 5. Configurar as variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com os dados do seu projeto (em **Project Settings → API**):

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

A chave `anon` é pública por design — a segurança real vem das políticas de RLS já criadas em `0002_rls.sql`. **Nunca** coloque a `service_role key` no frontend.

### 6. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:5173` e entre com o e-mail/senha do usuário criado no passo 3.

### 7. Build de produção

```bash
npm run build
npm run preview
```

## Estrutura do projeto

```
src/
  assets/            logos e imagem institucional
  components/        Sidebar, Header, cards, tabela de chamados, toasts, ProtectedRoute, AdminRoute, etc.
  contexts/          AuthContext (Supabase Auth)
  lib/supabase.ts    cliente Supabase
  pages/             Login, Dashboard, Configurações, Comunicados...
  pages/tickets/     Novo chamado, meus chamados, todos, detalhe (comentários + atribuição)
  pages/compras/     Solicitar e acompanhar compras
  pages/financeiro/  Contas a pagar/receber e relatórios
  pages/rh/          Solicitações, férias e ponto
  pages/admin/       Gestão de usuários (criar, resetar senha, definir perfil)
  types/database.ts  tipos TypeScript espelhando as tabelas do Supabase
supabase/
  migrations/        schema + RLS + tabelas de Financeiro/RH
  functions/         Edge Functions admin-create-user e admin-reset-password
  seed.sql           dados de demonstração
```

## Papéis de acesso (RLS)

- **usuario**: vê e cria seus próprios chamados/compras/solicitações de RH/férias/ponto; comenta em seus chamados; lê comunicados, base de conhecimento e as contas do Financeiro (sem poder editá-las).
- **tecnico**: também vê e atualiza (status e comentários) os chamados atribuídos a ele.
- **admin**: acesso total — gerencia categorias, estoque, comunicados, base de conhecimento, lançamentos financeiros, todos os chamados/compras/solicitações de RH, e a tela de Administração de usuários.

Tudo isso é reforçado no banco via RLS (não só escondido na interface) — mesmo que alguém adultere o frontend, o Postgres recusa a operação se a política não permitir.

A role de cada usuário fica em `profiles.role` e agora pode ser ajustada diretamente pela tela **Administração → Usuários** (sem precisar mexer no banco).

## Sobre a logo

A logo enviada foi copiada para `src/assets/logo-zabix.png` e já é usada na sidebar, no header do login, no banner do dashboard e como favicon. Basta substituir esse arquivo (mantendo o nome) caso receba uma versão vetorial/oficial diferente.
