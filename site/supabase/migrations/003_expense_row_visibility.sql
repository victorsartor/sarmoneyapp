-- Roda só isso no SQL Editor.
-- Antes, qualquer pessoa logada conseguia puxar TODAS as despesas via
-- API (o app só escondia na tela). Agora o banco também trava: cada um
-- só consegue ler o apartamento (compartilhado) e as próprias despesas.
-- O admin (Jackson) continua vendo tudo.

drop policy if exists "despesas visiveis pra quem esta logado" on expenses;

create policy "despesas visiveis conforme papel"
  on expenses for select
  to authenticated
  using (
    person_id is null
    or person_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
