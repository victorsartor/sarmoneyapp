# Configurando o Supabase

Passo a passo pra deixar o backend (banco de dados + login) funcionando.

## 1. Criar o projeto

1. Crie uma conta grátis em [supabase.com](https://supabase.com) (se ainda não tiver)
2. Crie um projeto novo (escolha uma senha de banco e guarde — não é a
   mesma senha do login do app)
3. Espere o projeto terminar de provisionar (leva ~2 min)

## 2. Rodar o schema

1. No painel do projeto, vá em **SQL Editor** → **New query**
2. Cole o conteúdo de `schema.sql` (nessa mesma pasta) e rode

Isso cria as tabelas `profiles` e `expenses` com as permissões certas
(só o admin edita despesas, todo mundo logado consegue ver).

## 3. Criar os 3 usuários

Em **Authentication → Users → Add user**, crie um usuário pra cada um,
com esses emails exatos (senha é livre, cada um escolhe a sua):

- `jackson@sarmoneyapp.local`
- `janine@sarmoneyapp.local`
- `victor@sarmoneyapp.local`

Depois de criar, copie o **User UID** de cada um (aparece na lista de
usuários) e volte no SQL Editor pra rodar:

```sql
insert into profiles (id, name, role, percentual) values
  ('<uuid-do-jackson>', 'Jackson', 'admin', 48),
  ('<uuid-da-janine>', 'Janine', 'membro', 31),
  ('<uuid-do-victor>', 'Victor', 'membro', 21);
```

## 4. Pegar a URL e a chave do projeto

Em **Settings → API**:

- **Project URL** → cola em `VITE_SUPABASE_URL`
- **anon public key** → cola em `VITE_SUPABASE_ANON_KEY`

Copie `.env.example` pra `.env` (na raiz de `site/`) e preencha os dois
valores. Depois é só `npm run dev`.

## Se os percentuais mudarem

É só rodar no SQL Editor:

```sql
update profiles set percentual = <novo valor> where name = '<nome>';
```
