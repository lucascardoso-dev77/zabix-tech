-- ============================================================
-- ZABIX TECH — Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.ticket_categories enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_comments enable row level security;
alter table public.purchases enable row level security;
alter table public.inventory enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.departments enable row level security;
alter table public.knowledge_base enable row level security;

-- ------------------------------------------------------------
-- Funções auxiliares (security definer para evitar recursão de RLS)
-- ------------------------------------------------------------
create or replace function public.current_role()
returns app_role as $$
  select role from public.profiles where user_id = auth.uid();
$$ language sql stable security definer set search_path = public;

create or replace function public.is_admin()
returns boolean as $$
  select public.current_role() = 'admin';
$$ language sql stable security definer set search_path = public;

create or replace function public.is_tecnico_or_admin()
returns boolean as $$
  select public.current_role() in ('tecnico', 'admin');
$$ language sql stable security definer set search_path = public;

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (user_id = auth.uid() or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "profiles_admin_manage" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- ticket_categories — leitura para todos autenticados, gestão para admin
-- ------------------------------------------------------------
create policy "categories_select_all" on public.ticket_categories
  for select using (auth.uid() is not null);

create policy "categories_admin_manage" on public.ticket_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- tickets
-- ------------------------------------------------------------
create policy "tickets_select_own" on public.tickets
  for select using (user_id = auth.uid());

create policy "tickets_select_assigned" on public.tickets
  for select using (tecnico_id = auth.uid());

create policy "tickets_select_admin_tecnico" on public.tickets
  for select using (public.is_tecnico_or_admin());

create policy "tickets_insert_own" on public.tickets
  for insert with check (user_id = auth.uid());

create policy "tickets_update_own_open" on public.tickets
  for update using (user_id = auth.uid() and status = 'aberto')
  with check (user_id = auth.uid());

create policy "tickets_update_assigned_tecnico" on public.tickets
  for update using (tecnico_id = auth.uid())
  with check (tecnico_id = auth.uid());

create policy "tickets_admin_manage" on public.tickets
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- ticket_comments
-- ------------------------------------------------------------
create policy "comments_select_related" on public.ticket_comments
  for select using (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_comments.ticket_id
        and (t.user_id = auth.uid() or t.tecnico_id = auth.uid())
    )
    or public.is_admin()
  );

create policy "comments_insert_related" on public.ticket_comments
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.tickets t
      where t.id = ticket_comments.ticket_id
        and (t.user_id = auth.uid() or t.tecnico_id = auth.uid() or public.is_admin())
    )
  );

-- ------------------------------------------------------------
-- purchases
-- ------------------------------------------------------------
create policy "purchases_select_own" on public.purchases
  for select using (user_id = auth.uid() or public.is_admin());

create policy "purchases_insert_own" on public.purchases
  for insert with check (user_id = auth.uid());

create policy "purchases_admin_manage" on public.purchases
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- inventory — leitura para todos autenticados, gestão para admin
-- ------------------------------------------------------------
create policy "inventory_select_all" on public.inventory
  for select using (auth.uid() is not null);

create policy "inventory_admin_manage" on public.inventory
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- announcements — leitura pública (ativos) para autenticados, gestão admin
-- ------------------------------------------------------------
create policy "announcements_select_active" on public.announcements
  for select using (ativo = true or public.is_admin());

create policy "announcements_admin_manage" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- notifications
-- ------------------------------------------------------------
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());

create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notifications_admin_insert" on public.notifications
  for insert with check (public.is_admin() or user_id = auth.uid());

-- ------------------------------------------------------------
-- departments — leitura para todos autenticados
-- ------------------------------------------------------------
create policy "departments_select_all" on public.departments
  for select using (auth.uid() is not null);

create policy "departments_admin_manage" on public.departments
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- knowledge_base — leitura para todos autenticados, gestão admin
-- ------------------------------------------------------------
create policy "kb_select_all" on public.knowledge_base
  for select using (auth.uid() is not null);

create policy "kb_admin_manage" on public.knowledge_base
  for all using (public.is_admin()) with check (public.is_admin());
