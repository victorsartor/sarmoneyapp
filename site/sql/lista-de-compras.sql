-- Tabela da aba "Lista de compras".
-- Rode uma vez no SQL Editor do Supabase (dashboard > SQL Editor > New query).
-- É a lista da casa: qualquer pessoa logada vê e mexe em tudo.

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  done boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.shopping_items enable row level security;

create policy "logados leem a lista"
  on public.shopping_items for select
  to authenticated using (true);

create policy "logados adicionam item"
  on public.shopping_items for insert
  to authenticated with check (true);

create policy "logados marcam item"
  on public.shopping_items for update
  to authenticated using (true) with check (true);

create policy "logados removem item"
  on public.shopping_items for delete
  to authenticated using (true);
