-- SARMONEYAPP — schema do Supabase
-- Rodar isso inteiro uma vez no SQL Editor do projeto Supabase
-- (https://app.supabase.com/project/_/sql/new)

create extension if not exists "pgcrypto";

-- Um perfil por pessoa da família. O id é o mesmo id do usuário criado
-- em Authentication > Users no painel do Supabase.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role text not null check (role in ('admin', 'membro')),
  percentual numeric not null default 0 check (percentual >= 0 and percentual <= 100),
  created_at timestamptz not null default now()
);

-- Despesas. Aluguel/Condomínio não usa person_id (ele é rateado entre
-- todos os perfis pelo percentual de cada um). Cartão e Pix usam
-- person_id pra dizer de quem é aquela despesa.
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('Aluguel/Condomínio', 'Cartão', 'Pix', 'Outro')),
  description text not null,
  amount numeric not null check (amount > 0),
  month text not null, -- formato 'YYYY-MM'
  person_id uuid references profiles (id),
  purchase_group_id uuid, -- agrupa as parcelas de uma mesma compra no cartão ou apartamento
  installment_number int,
  installment_total int,
  purchase_date date, -- dia exato da compra (hoje só usado no Cartão)
  recurring boolean not null default false, -- assinatura tipo Netflix: cobra todo mês até ser cancelada
  active_until text, -- 'YYYY-MM', só usado quando recurring=true; null = ainda ativa
  created_by uuid references profiles (id) not null,
  created_at timestamptz not null default now()
);

create index if not exists expenses_month_idx on expenses (month);

alter table profiles enable row level security;
alter table expenses enable row level security;

-- Qualquer pessoa logada (Jackson, Janine, Victor) pode ver os perfis
-- (nome, papel, percentual) — não é informação sensível.
create policy "perfis visiveis pra quem esta logado"
  on profiles for select
  to authenticated
  using (true);

-- Cada um só vê o apartamento (compartilhado) e as próprias despesas.
-- O admin (Jackson) vê tudo.
create policy "despesas visiveis conforme papel"
  on expenses for select
  to authenticated
  using (
    person_id is null
    or person_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Só o admin (Jackson) pode criar, editar ou apagar despesas.
create policy "so admin insere despesa"
  on expenses for insert
  to authenticated
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "so admin edita despesa"
  on expenses for update
  to authenticated
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "so admin apaga despesa"
  on expenses for delete
  to authenticated
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Só o admin pode editar percentuais dos perfis.
create policy "so admin edita perfil"
  on profiles for update
  to authenticated
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------------
-- Depois de rodar o SQL acima, crie os 3 usuários em
-- Authentication > Users > Add user (email + senha, qualquer email
-- serve, ex: jackson@sarmoneyapp.local) e rode o insert abaixo
-- substituindo os UUIDs pelos ids gerados pra cada usuário.
-- ---------------------------------------------------------------

-- insert into profiles (id, name, role, percentual) values
--   ('<uuid-do-jackson>', 'Jackson', 'admin', 48),
--   ('<uuid-da-janine>', 'Janine', 'membro', 31),
--   ('<uuid-do-victor>', 'Victor', 'membro', 21);
