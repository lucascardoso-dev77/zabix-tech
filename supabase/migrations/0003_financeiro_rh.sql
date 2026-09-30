-- ============================================================
-- ZABIX TECH — Tabelas adicionais (Financeiro e RH)
-- ============================================================

do $$ begin
  create type conta_status as enum ('pendente', 'pago', 'atrasado', 'cancelado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rh_status as enum ('pendente', 'aprovado', 'reprovado', 'concluido');
exception when duplicate_object then null; end $$;

create table if not exists public.contas_pagar (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  fornecedor text,
  valor numeric(12, 2) not null,
  vencimento date not null,
  status conta_status not null default 'pendente',
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contas_receber (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  cliente text,
  valor numeric(12, 2) not null,
  vencimento date not null,
  status conta_status not null default 'pendente',
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rh_solicitacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tipo text not null,
  descricao text not null,
  status rh_status not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ferias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data_inicio date not null,
  data_fim date not null,
  dias integer not null,
  status rh_status not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ponto (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null default current_date,
  entrada timestamptz,
  saida timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_rh_solicitacoes_user on public.rh_solicitacoes (user_id);
create index if not exists idx_ferias_user on public.ferias (user_id);
create index if not exists idx_ponto_user_data on public.ponto (user_id, data);

do $$
declare t text;
begin
  foreach t in array array['contas_pagar', 'contas_receber', 'rh_solicitacoes', 'ferias'] loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;
       create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t, t
    );
  end loop;
end $$;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table public.contas_pagar enable row level security;
alter table public.contas_receber enable row level security;
alter table public.rh_solicitacoes enable row level security;
alter table public.ferias enable row level security;
alter table public.ponto enable row level security;

-- Financeiro: leitura para todos autenticados, gestão apenas admin
create policy "contas_pagar_select_all" on public.contas_pagar
  for select using (auth.uid() is not null);
create policy "contas_pagar_admin_manage" on public.contas_pagar
  for all using (public.is_admin()) with check (public.is_admin());

create policy "contas_receber_select_all" on public.contas_receber
  for select using (auth.uid() is not null);
create policy "contas_receber_admin_manage" on public.contas_receber
  for all using (public.is_admin()) with check (public.is_admin());

-- RH: cada usuário vê e cria as próprias solicitações; admin vê e gerencia todas
create policy "rh_solicitacoes_select_own_or_admin" on public.rh_solicitacoes
  for select using (user_id = auth.uid() or public.is_admin());
create policy "rh_solicitacoes_insert_own" on public.rh_solicitacoes
  for insert with check (user_id = auth.uid());
create policy "rh_solicitacoes_admin_manage" on public.rh_solicitacoes
  for all using (public.is_admin()) with check (public.is_admin());

create policy "ferias_select_own_or_admin" on public.ferias
  for select using (user_id = auth.uid() or public.is_admin());
create policy "ferias_insert_own" on public.ferias
  for insert with check (user_id = auth.uid());
create policy "ferias_admin_manage" on public.ferias
  for all using (public.is_admin()) with check (public.is_admin());

create policy "ponto_select_own_or_admin" on public.ponto
  for select using (user_id = auth.uid() or public.is_admin());
create policy "ponto_insert_own" on public.ponto
  for insert with check (user_id = auth.uid());
create policy "ponto_update_own" on public.ponto
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
