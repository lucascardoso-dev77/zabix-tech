-- ============================================================
-- ZABIX TECH — Dados de demonstração
-- Rode depois das migrations. Crie primeiro o usuário admin pelo
-- painel do Supabase (Authentication > Users) ou pelo signUp da API,
-- copie o UUID gerado e substitua ADMIN_USER_ID abaixo antes de rodar
-- o bloco de perfil administrador.
-- ============================================================

insert into public.departments (nome) values
  ('TI'), ('Financeiro'), ('RH'), ('Compras'), ('Operações')
on conflict (nome) do nothing;

insert into public.ticket_categories (nome, descricao) values
  ('Hardware', 'Problemas com equipamentos físicos'),
  ('Software', 'Problemas com sistemas e aplicativos'),
  ('Redes', 'Conectividade, Wi-Fi e rede interna'),
  ('Sistemas', 'ERPs e sistemas corporativos (ex: Protheus)'),
  ('Acesso', 'Permissões e credenciais de acesso'),
  ('Impressoras', 'Impressoras e periféricos de impressão'),
  ('Compras', 'Solicitações relacionadas a compras'),
  ('Outros', 'Demais solicitações')
on conflict (nome) do nothing;

insert into public.announcements (titulo, descricao, data_publicacao, ativo) values
  ('Manutenção no sistema Protheus', 'No dia 23/09/2025, das 22h às 02h, haverá manutenção no ambiente Protheus.', now() - interval '1 day', true),
  ('Novo procedimento de compras', 'A partir de 01/10/2025, todas as solicitações de compras deverão ser feitas pelo portal.', now() - interval '3 days', true),
  ('Atualização de antivírus', 'Foi liberada uma nova versão do antivírus corporativo. Verifique se o seu computador já foi atualizado.', now() - interval '5 days', true);

insert into public.inventory (codigo, nome, categoria, quantidade, estoque_minimo, localizacao) values
  ('INV-001', 'Notebook Dell Latitude 5440', 'Equipamentos', 6, 3, 'Almoxarifado - Prateleira A1'),
  ('INV-002', 'Monitor LG 24" Full HD', 'Equipamentos', 14, 5, 'Almoxarifado - Prateleira A2'),
  ('INV-003', 'Mouse sem fio Logitech', 'Periféricos', 32, 10, 'Almoxarifado - Gaveta B1'),
  ('INV-004', 'Toner HP LaserJet 105A', 'Suprimentos', 4, 6, 'Almoxarifado - Prateleira C1'),
  ('INV-005', 'Cabo de rede Cat6 (metro)', 'Redes', 180, 50, 'Almoxarifado - Prateleira C3')
on conflict (codigo) do nothing;

-- ------------------------------------------------------------
-- Usuário administrador de teste
-- ------------------------------------------------------------
-- 1) Crie o usuário no painel do Supabase: Authentication > Users > Add user
--    e-mail: admin@zabixtech.com.br | senha: defina uma senha forte
-- 2) Copie o UUID gerado e rode o comando abaixo substituindo o valor:
--
-- update public.profiles
--   set nome = 'Administrador Zabix', cargo = 'Administrador de TI',
--       departamento = 'TI', role = 'admin'
--   where user_id = 'COLE-AQUI-O-UUID-DO-USUARIO';
--
-- O profile já é criado automaticamente pelo trigger on_auth_user_created;
-- este UPDATE só ajusta o cargo e a role para administrador.
