-- Roda só isso no SQL Editor.
-- Reforça a policy de insert: o admin (quem lança as despesas) precisa
-- poder cadastrar uma despesa em nome de QUALQUER pessoa da família
-- (Jackson, Janine ou Victor), não só em nome dele mesmo. Se essa
-- policy tiver sido sobrescrita no painel do Supabase com uma condição
-- tipo "person_id = auth.uid()", é isso que trava o "Salvar" quando o
-- admin tenta lançar uma compra no nome de outra pessoa.

drop policy if exists "so admin insere despesa" on expenses;

create policy "so admin insere despesa"
  on expenses for insert
  to authenticated
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
