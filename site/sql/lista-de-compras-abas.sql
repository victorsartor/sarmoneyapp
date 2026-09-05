-- Divide a lista de compras em duas abas: comida e limpeza/higiene.
-- Rode uma vez no SQL Editor do Supabase (dashboard > SQL Editor > New query)
-- ANTES de subir o deploy — o app novo já lê essa coluna.
-- O que já estava na lista vira comida, que é o que o pai vinha anotando.

alter table public.shopping_items
  add column if not exists kind text not null default 'comida'
  check (kind in ('comida', 'limpeza'));
