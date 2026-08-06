---
name: novo-projeto
description: >
  Cria uma pasta de projeto nova com `CLAUDE.md` dedicado, depois de uma entrevista curta sobre
  o projeto (cliente, objetivo, entregas previstas). Use quando o usuário disser "novo projeto",
  "novo cliente", "/novo-projeto", "começar projeto pra X" ou pedir pra estruturar um trabalho novo.
---

# /novo-projeto — Pasta de projeto novo com contexto dedicado

Quando o usuário começa um projeto novo (cliente, iniciativa, produto), cria uma pasta com `CLAUDE.md` próprio que herda contexto da raiz e adiciona o que é específico do projeto.

## Workflow

### Passo 1 — Entrevista (4 perguntas)

1. "Qual o nome do projeto ou cliente?"
2. "É um cliente novo, projeto interno ou iniciativa pessoal?"
3. "Qual o objetivo principal? (uma frase)"
4. "Que tipo de entrega vai ter? (ex: ads, site, conteúdo, automação, proposta — pode ser mais de uma)"

### Passo 2 — Decidir local

Baseado na resposta 2:

- **Cliente novo:** criar em `clientes/<Nome>/` (ou na pasta equivalente do perfil — ler `CLAUDE.md` da raiz pra confirmar a convenção)
- **Projeto interno:** criar em `projetos/<nome>/` (criar `projetos/` se não existir)
- **Iniciativa pessoal:** perguntar onde o usuário prefere

### Passo 3 — Estrutura básica

Criar a pasta com:

- `CLAUDE.md` do projeto (instruções específicas + regra de isolamento)
- `briefing.md` (com o que foi coletado na entrevista)
- `identidade/` — **sempre**, pra cliente. É a marca DELE (cores, logo,
  fontes, tom). Começa com um `design-guide.md` em branco a preencher
- `referencias/` — **sempre**, pra cliente. Material de origem: dados
  extraídos do site atual, prints, textos, tabela de preços
- Subpastas conforme as entregas mencionadas (ex: se mencionou "ads e conteúdo", criar `ads/` e `conteudo/`)

**O que NÃO duplicar por cliente:** `scripts/` e `templates/` ficam só na
raiz. São ferramenta, iguais pra todo mundo — copiar significa manter N
cópias que desandam com o tempo. A regra é: **dado duplica, ferramenta
compartilha.**

### Passo 4 — Conteúdo do `CLAUDE.md` do projeto

Template:

```markdown
# [Nome do projeto]

> Projeto criado em [data]. Pasta dedicada — instruções aqui sobrescrevem as da raiz quando relevantes.

## Sobre

[Objetivo da resposta 3]

## Tipo

[Cliente novo / Projeto interno / Iniciativa pessoal]

## Entregas previstas

- [entrega 1 da resposta 4]
- [entrega 2 da resposta 4]
- ...

## Onde salvar o que

- Briefing e contexto: nessa pasta
- Marca do cliente: `identidade/`
- Material de origem (site atual, prints, preços): `referencias/`
- Entregas: cada subpasta criada (ads/, conteudo/, site/, etc.)

## ⚠️ Isolamento — leia antes de produzir qualquer coisa

**A marca daqui é a do [Nome], não a da agência.**

- Identidade visual: usar `identidade/` DESTA pasta. O
  `identidade/design-guide.md` da raiz é a marca do Nick + Sartor e
  **não entra** em entrega de cliente.
- Tom de voz: quem fala é o [Nome] pro público dele. O tom da agência
  (definido no `~/.claude/CLAUDE.md`) vale pra conversa com o Nick,
  não pro material do cliente.
- Se faltar dado de marca, **perguntar ou extrair das fontes do
  cliente** (site, Instagram, logo). Nunca preencher com o padrão da
  raiz nem inventar.
- Não ler nem reaproveitar material de outro cliente em `clientes/`.

## O que herda da raiz

Só regra de operação: como o MazyOS trabalha, fluxo de skills,
convenção de pastas. Nada de marca, tom ou dado de negócio.

## Específico desse projeto

[Vazio — preencher com regras que valem só pra esse projeto, conforme for descobrindo]
```

### Passo 5 — Resumo

Responder pro usuário:

```
Pasta criada: [caminho]
✓ CLAUDE.md do projeto
✓ briefing.md
✓ Subpastas: [lista]

Quando for trabalhar nesse projeto, abre o terminal já dentro da pasta — assim eu carrego o CLAUDE.md específico junto com o da raiz.
```

## Regras

- **Conferir a grafia do nome antes de criar a pasta.** Se o cliente tem
  site ou Instagram, abrir e confirmar como eles escrevem. Renomear pasta
  depois dá retrabalho (já aconteceu: "Academia Elite" → "Academia Ellite")
- Nome de pasta: usar o nome como o usuário falou, sem normalizar agressivamente (manter acentos, espaços viram hífen, mas o nome reconhecível)
- Não criar subpastas que não foram pedidas ("pra organizar melhor"). Só o que foi mencionado nas entregas
- Se o cliente/projeto já existe (pasta com mesmo nome), avisar e perguntar se é pra adicionar dentro ou criar com sufixo
