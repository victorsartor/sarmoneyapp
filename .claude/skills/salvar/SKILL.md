---
name: salvar
description: >
  Salva o trabalho do MazyOS no GitHub (commit + push). Na primeira vez configura o repositório
  remoto. Use quando o usuário disser "salvar", "salva no github", "commit", "push", "/salvar"
  ou pedir backup do trabalho.
---

# /salvar — Salvar no GitHub

Skill de uma função só: garantir que o trabalho do usuário está no GitHub. Fácil pra quem nunca usou git.

## Workflow

### Passo 0 — Descobrir o alvo (SEMPRE, antes de qualquer git)

O hub tem projetos com repositório git próprio dentro dele. Nunca comitar sem
responder duas perguntas antes, **em voz alta pro usuário**:

1. **O que vai nesse commit?**
2. **Pra qual repositório?**

Pular esse passo já é erro, mesmo quando parece óbvio. `git add .` na raiz do hub
não alcança as pastas de projeto (elas estão no `.gitignore`), e rodar git de
dentro de uma delas empurra pra um remote completamente diferente.

**Como levantar:** rodar `git status --short` na raiz **e** em cada pasta de
projeto com `.git` próprio. Depois mostrar o resultado separado por repositório,
nunca numa lista só.

**Mapa dos repositórios** (atualizar quando entrar projeto novo):

| Pasta | Repositório | O que vive lá |
|---|---|---|
| raiz do hub, incluindo `site-agencia/` | `NickolasLima/nick-sartor-portfolio` | contexto da agência, `_memoria/`, skills, templates, identidade, site da própria dupla |
| `planetor/` | `NickolasLima/planetor` | CRM/ERP interno da dupla (ignorado pelo hub) |

**Confirmar antes de empurrar**, sempre, com o usuário:

> "Mudanças em `<pasta>` vão pro repositório `<URL do origin>`. Confirma?"

Só depois do "sim" é que commita.

**Um commit nunca atravessa dois repositórios.** Se os dois tiverem mudança,
perguntar qual salvar primeiro e fazer um de cada vez, do começo ao fim.

**Descobrir em que repo você está de verdade:** `git rev-parse --show-toplevel`
(diz a raiz) e `git remote get-url origin` (diz o destino). Rodar os dois quando
houver qualquer dúvida, e nunca deduzir pelo nome da pasta.

### Primeira vez (repositório não inicializado)

Detectar com `git rev-parse --is-inside-work-tree`. Se falhar:

1. Perguntar:
   > "Esse é o primeiro syncar. Você já tem um repositório criado no GitHub pra esse workspace?
   > 1. Sim, me passa a URL (ex: https://github.com/usuario/nome.git)
   > 2. Não, vou criar agora — me dá um nome pro repositório (ex: meu-mazyos)"

2. **Se opção 1:** rodar `git init`, `git add .`, `git commit -m "Setup inicial do MazyOS"`, `git branch -M main`, `git remote add origin <URL>`, `git push -u origin main`.

3. **Se opção 2:** verificar se o `gh` CLI está instalado (`gh --version`). 
   - Se sim: rodar `git init`, criar commit inicial, e `gh repo create <nome> --private --source=. --push`.
   - Se não: instruir o usuário a instalar `gh` (https://cli.github.com/) ou criar o repo manualmente em github.com/new e voltar com a URL.

### Commits seguintes (já configurado)

Rodar depois do Passo 0, uma vez por repositório escolhido.

1. Rodar `git status` **na raiz daquele repositório**. Se não tiver mudanças, responder "Tá tudo sincronizado, sem mudança nova" e parar.

2. `git pull` antes de commitar, pra não colidir com quem estiver trabalhando do outro lado.

3. Mostrar o `git status` curto pro usuário, junto com o destino, e perguntar:
   > "Isso aqui vai pro `<URL do origin>`. Quer descrever a mudança em uma frase ou usa o resumo automático?"

4. Se o usuário fornecer mensagem, usar. Se não, gerar uma mensagem baseada nos arquivos alterados (1 linha, em português, formato: "Atualiza X" ou "Adiciona Y" ou "Cria proposta pra cliente Z").

5. Adicionar **caminho por caminho** (`git add <caminho>`), nunca `git add .`, `git add -A` nem `git commit -a`. Conferir o que foi de fato preparado com `git diff --cached --name-only` e mostrar pro usuário. Isso evita arrastar pro commit arquivo de outra frente de trabalho, ou segredo esquecido na pasta.

6. `git commit -m "<mensagem>"` → `git push`.

7. Confirmar com link do repositório (extrair de `git remote get-url origin`):
   > "Sincronizado. Ver no GitHub: <URL>"

### Regras por projeto

Cada projeto pode ter regra própria de commit no `AGENTS.md` ou `CLAUDE.md` dele.
**Ler esse arquivo antes de commitar naquele projeto**, porque ele manda mais que
esta skill. O que já se sabe:

- **`planetor/`**: duas IAs trabalham no mesmo repo. `git pull` obrigatório antes de começar e antes de commitar; adicionar caminho por caminho; rodar `npx tsc --noEmit` e não commitar com erro de tipo; push rejeitado se resolve com `git pull --rebase`, nunca `--force`; segredo mora só no `.env.local`, que não vai pro Git.

#### `planetor/`: nunca push direto na `main`

A `main` é produção: publica em `planetor.vercel.app`, ligada no Supabase com os
leads reais. Push nela sobe pro ar na hora, sem ninguém olhar antes.

O trabalho do Sartor vai pra branch **`homologacao`**, que publica em
`planetor-git-homologacao-nickosar.vercel.app`, com projeto Supabase próprio e
banco vazio. Lá dá pra clicar em tudo, inclusive apagar, sem tocar em dado real.

Fluxo:

1. `git checkout homologacao` e `git pull`. Se ela estiver atrás da `main`,
   sincronizar antes (`git merge origin/main`), senão o teste roda em cima de
   código velho.
2. Commitar e dar push na `homologacao`. A Vercel constrói sozinha.
3. Mandar o endereço pro usuário e esperar ele validar na tela.
4. Aprovado, abrir PR de `homologacao` pra `main`. O CI roda typecheck, os 130
   testes e o lint no PR.
5. Merge só depois do CI verde e do ok do usuário.

**Branch com outro nome não serve pra ver rodando.** As variáveis de ambiente da
Vercel estão presas a `Preview` + `Custom Preview Branch: homologacao`. Qualquer
outra branch constrói sem `DATABASE_URL` nem chaves do Supabase e quebra no
`src/proxy.ts` com "Internal Server Error" em texto puro, antes de abrir
qualquer tela. Branch de trabalho separada pode existir, mas pra enxergar o
resultado ela tem que chegar na `homologacao`.

Ler `docs/ambiente-homologacao.md` no planetor antes de mexer em deploy ou em
variável de ambiente. Armadilha registrada lá: variável marcada como Sensitive
na Vercel aparece **vazia** ao editar, e já derrubou o login de produção uma vez.

## Regras

- Nunca usar `--force` sem o usuário pedir explicitamente
- Nunca rodar `git reset --hard` ou outras destrutivas sem confirmação clara
- Se o push falhar por divergência (alguém comitou no remoto), avisar o usuário e oferecer `git pull --rebase` antes de tentar de novo
- Se o usuário ainda não tiver `git` configurado (`user.name` / `user.email`), perguntar e configurar com `git config --global` na primeira vez
