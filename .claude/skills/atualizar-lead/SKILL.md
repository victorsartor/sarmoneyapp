---
name: atualizar-lead
description: >
  Ao terminar um site, preenche/atualiza o lead certo no CRM do Notion (banco "🧲 Leads / CRM"):
  grava a URL do site em "Site" e move o "Status" pra fase certa (Deploy Feito). Use quando o
  usuário disser "atualiza o lead", "marca o site do cliente X", "/atualizar-lead", ou logo depois
  de fazer o deploy de um site (encaixa no fim do fluxo do /aprovar-post e de qualquer entrega de site).
---

# /atualizar-lead — Atualiza o lead no CRM depois de entregar o site

Fecha o loop do MazyOS: terminou/deu deploy num site → o CRM do Notion reflete isso
sozinho. Grava a **URL do site** e move o **Status** do lead pra fase certa, sem o
usuário precisar abrir o Notion.

## Quando usar / NÃO usar

- **Usar:** logo após um deploy de site (fim do `/aprovar-post` ou entrega manual), ou quando
  o usuário pedir pra registrar/atualizar o lead de um cliente.
- **NÃO usar:** se o site ainda não existe ou não subiu — não inventar URL. Se não dá pra
  confirmar a URL pública, parar e perguntar.

## Referências do banco (Notion)

- Banco: **🧲 Leads / CRM** — `https://app.notion.com/p/577a6b441edc4dd3a61b6bc828b9d1b4`
- Data source (pra SQL/query): `collection://9fb4f70c-6616-426c-b4e1-40e081edc34d`
- Título do lead: propriedade **`Nome do Lead`**
- Propriedades que essa skill escreve:
  - **`Site`** — tipo `url` → a URL pública do site
  - **`Status`** — tipo `select`, opções válidas (usar **exatamente** o texto, com emoji):
    `👀 Não visto` · `✅ Qualificado` · `🔧 Em Produção` · `❌ Desaprovado` ·
    `🗄️ Arquivado` · `Em contato com Cliente` · `Deploy Feito`
  - **`Link Google Maps`** — tipo `url` → o link do perfil do Google Maps do cliente
  - **`Instagram`** — tipo `url` → o link do perfil do Instagram (`https://instagram.com/<user>`)
  - **`WhatsApp`** — tipo `phone_number` → o número de contato (formato E.164, ex.: `+5548992221827`)

> Os IDs acima podem mudar se o banco for recriado. Se um `update` falhar por schema,
> refazer o `fetch` do banco pra pegar nomes/opções atuais antes de tentar de novo.

## Argumentos

`/atualizar-lead [nome do lead] [url do site] [status]`

Tudo opcional — a skill infere o que faltar:

- **nome do lead** — se não vier, inferir do contexto (nome da pasta do projeto / cliente
  atual). Ex.: trabalhando em `clientes/Academia-Ellite/` → lead "Academia Ellite".
- **url do site** — se não vier, tentar pegar do deploy recém-feito (saída do `/aprovar-post`,
  `SITE_URL` do `.env`, ou `git remote`/config de deploy). Se não achar, perguntar.
- **status** — se não vier, usar **`Deploy Feito`** (é o caso padrão de "terminei o site").
  Se o site ficou pronto mas ainda não subiu, usar `🔧 Em Produção`.

Além disso, quando disponíveis no contexto do projeto (briefing, rodapé/contato do site,
`_memoria/empresa.md`, ficha do cliente), preencher também:

- **Link Google Maps** · **Instagram** · **WhatsApp** do cliente.

Esses três são **oportunistas**: preencher só quando houver valor confiável. Nunca inventar —
campo sem fonte fica como está.

## Workflow

### Passo 1 — Descobrir o lead

Achar a linha certa no banco pelo nome. Preferir SQL exato e, se não bater, busca aproximada:

```
mcp__notion__notion-query-data-sources (mode sql)
  data_source_urls: ["collection://9fb4f70c-6616-426c-b4e1-40e081edc34d"]
  query: SELECT url, "Nome do Lead", "Site", "Status"
         FROM "collection://9fb4f70c-6616-426c-b4e1-40e081edc34d"
         WHERE "Nome do Lead" LIKE ?
  params: ["%<nome>%"]
```

- **0 resultados:** avisar que não achou o lead e perguntar se é pra criar um novo ou se o
  nome está diferente no CRM. Não criar lead sem confirmação.
- **1 resultado:** seguir.
- **2+ resultados:** listar os candidatos (nome + status atual) e perguntar qual.

### Passo 2 — Confirmar a URL do site

- Ter uma URL pública final (ex.: `https://cliente.com.br` ou o domínio do Netlify/Vercel).
- Se possível, validar que está no ar antes de gravar:
  ```bash
  curl -sf -o /dev/null -w "%{http_code}" "<url>"   # esperar 200
  ```
- Sem URL confiável, **parar e perguntar** — não gravar URL chutada.

### Passo 3 — Mostrar o diff e confirmar

Antes de escrever, mostrar o antes → depois:

```
Lead:         <Nome do Lead>
Site:         <valor atual ou vazio>  →  <nova URL>
Status:       <status atual>          →  <novo status>
Google Maps:  <valor atual ou vazio>  →  <novo link>      (só se mudar)
Instagram:    <valor atual ou vazio>  →  <novo link>      (só se mudar)
WhatsApp:     <valor atual ou vazio>  →  <novo número>    (só se mudar)
```

Mostrar no diff só as linhas que vão mudar. Campos que continuam vazios (sem fonte) não
aparecem.

Pedir "confirma? (sim/não)". Só seguir com sim. (Se o usuário já passou tudo explícito no
comando e mandou aplicar, pode pular a pergunta.)

### Passo 4 — Atualizar a página

```
mcp__notion__notion-update-page
  page_id: <url/id do lead do Passo 1>
  command: update_properties
  properties:
    "Site": "<nova URL>"
    "Status": "<novo status — texto exato com emoji>"
    "Link Google Maps": "<link>"          # só se tiver valor novo
    "Instagram": "<link>"                  # só se tiver valor novo
    "WhatsApp": "<+55...>"                  # só se tiver valor novo
```

Só mandar as propriedades que mudam. Não tocar em `Site`, `Google Maps`, `Instagram` nem
`WhatsApp` se o valor não mudou (ou se não há fonte confiável pra ele).

### Passo 5 — Confirmar

```
✓ Lead atualizado no CRM: <Nome do Lead>
  Site:   <nova URL>
  Status: <novo status>
  Abrir:  <url da página no Notion>
```

## Encaixe no fluxo MazyOS

- Fim natural do `/aprovar-post` e de qualquer entrega de site: deploy no ar → rodar essa skill
  pra o CRM refletir. Ao terminar um site sem essa skill ter rodado, oferecer:
  > "Quer que eu atualize o lead no CRM (Site + Status) com essa entrega?"
- É uma skill de agência (CRM compartilhado Nick/Sartor), não específica de um cliente — vale
  pra qualquer projeto de site do hub.

## Regras

1. **Nunca inventar URL, status, número nem link.** Na dúvida, perguntar ou deixar o campo como está.
2. **Nunca criar lead novo sem confirmação** — essa skill atualiza; criação é decisão do usuário.
3. **Status sempre com o texto exato** das opções (incluindo emoji) — valor errado é rejeitado
   ou cria opção duplicada.
4. **Mostrar o diff antes de gravar**, salvo quando o usuário já mandou aplicar explicitamente.
5. **Escrita mínima:** só as propriedades que mudaram.
6. **WhatsApp em E.164** (`+55` + DDD + número) — números de Floripa/SC começam em `+5548...`.
   `Instagram` e `Google Maps` como URL completa (`https://...`), não só o @ ou o nome.
