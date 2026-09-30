-- ============================================================
-- ZABIX TECH — Schema inicial
-- Rode este arquivo no SQL Editor do Supabase (ou via CLI/migrations)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tipos (enums)
-- ------------------------------------------------------------
do $$ begin
  create type app_role as enum ('usuario', 'tecnico', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_status as enum (
    'aberto', 'em_analise', 'em_atendimento',
    'aguardando_usuario', 'aguardando_terceiro',
    'resolvido', 'cancelado'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_prioridade as enum ('baixa', 'media', 'alta', 'critica');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- Tabelas
-- ------------------------------------------------------------

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  nome text not null,
  email text not null,
  cargo text,
  departamento text,
  avatar_url text,
  role app_role not null default 'usuario',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_categories (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  descricao text
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  descricao text,
  categoria_id uuid references public.ticket_categories (id),
  prioridade ticket_prioridade not null default 'media',
  status ticket_status not null default 'aberto',
  tecnico_id uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.ticket_comments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  comentario text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  descricao text not null,
  categoria text,
  status text not null default 'em_analise',
  valor numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  categoria text,
  quantidade integer not null default 0,
  estoque_minimo integer not null default 0,
  localizacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text not null,
  data_publicacao timestamptz not null default now(),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  mensagem text not null,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  conteudo text not null,
  categoria text,
  autor_id uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Índices úteis
-- ------------------------------------------------------------
create index if not exists idx_tickets_user_id on public.tickets (user_id);
create index if not exists idx_tickets_tecnico_id on public.tickets (tecnico_id);
create index if not exists idx_tickets_status on public.tickets (status);
create index if not exists idx_purchases_user_id on public.purchases (user_id);
create index if not exists idx_notifications_user_id on public.notifications (user_id);
create index if not exists idx_ticket_comments_ticket_id on public.ticket_comments (ticket_id);

-- ------------------------------------------------------------
-- updated_at automático
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['profiles', 'tickets', 'purchases', 'inventory', 'knowledge_base'] loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;
       create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t, t
    );
  end loop;
end $$;

-- ------------------------------------------------------------
-- Criação automática de profile ao registrar usuário no Supabase Auth
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, nome, email, cargo, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'cargo', 'Colaborador'),
    'usuario'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
