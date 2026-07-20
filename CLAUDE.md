# SARMONEYAPP — MazyOS

> Molde adaptado pro perfil **freelancer solo / projeto pessoal** — aqui
> não tem cliente externo pagando, o "cliente" é a própria família do
> criador. O sistema gira em torno de manter o SARMONEYAPP evoluindo e
> organizado, sem depender de captação, entrega pra terceiros ou cobrança.

## O que é esse workspace

Operação do SARMONEYAPP — ferramenta interna de gestão financeira
familiar. Aqui ficam a memória do projeto, a identidade visual (quando
definida) e o que for produzido em torno dele.

**Estrutura de pastas:**
- `_memoria/` — quem é o projeto, como ele fala, foco atual
- `identidade/` — identidade visual (ainda em branco)
- `marketing/` — se algum dia o projeto virar algo mais público
- `saidas/` — documentos e materiais pontuais
- `dados/` — arquivos a analisar
- `scripts/` — scripts de apoio

## Quem sou

Criador solo do SARMONEYAPP, um projeto pessoal/familiar de gestão
financeira. Sem equipe, sem clientes externos.

## O projeto

- Ferramenta interna de gestão financeira familiar
- Divide e organiza despesas mensais (aluguel/condomínio, cartão, Pix)
- Rateio por porcentagem entre os membros da família
- Não é produto público

## Como trabalho

Solo, no meu ritmo. O maior obstáculo hoje é constância — manter o
projeto avançando semana a semana em vez de deixar parado.

## Tom de voz

Direto, técnico-simples, sem enfeite nem tom comercial (ver
`_memoria/preferencias.md` para o exemplo real de escrita).

Evitar: jargão técnico desnecessário, fala de coach/guru.

## Regras do sistema

- Projeto novo/relacionado → registrar em `_memoria/estrategia.md`
- "Codar" foi identificado como a tarefa mais repetitiva — candidata a
  virar skill via `/mapear-rotinas`
- Outras regras a adicionar conforme o uso

---

Sua empresa roda em cima desse arquivo. Aqui ficam as regras de operação
do MazyOS — como o Claude lê o contexto, aprende com correções, mantém
tudo atualizado e cria skills novas conforme a operação evolui.

Esse arquivo é editável.

---

## Contexto do negócio

No início de toda conversa, ler os seguintes arquivos (quando existirem
e estiverem preenchidos):

1. `_memoria/empresa.md` — quem é o usuário, o que faz, como funciona o negócio
2. `_memoria/preferencias.md` — tom de voz, estilo de escrita, o que evitar
3. `_memoria/estrategia.md` — foco atual, prioridades, prazos

Usar essas informações como base pra qualquer resposta ou decisão. Ao
sugerir prioridades, formatos ou abordagens, considerar o foco atual
descrito em `estrategia.md`.

Pra qualquer tarefa visual (carrossel, post, landing page), consultar
`identidade/design-guide.md` como referência de estilo.

Não é necessário listar o que foi lido nem confirmar a leitura. Apenas
usar o contexto naturalmente.

---

## Fluxo de trabalho

Antes de executar qualquer tarefa, verificar se existe skill relevante
em `.claude/skills/`. Se encontrar, seguir as instruções da skill. Se
não encontrar, executar a tarefa normalmente.

Ao concluir uma tarefa que não tinha skill mas parece repetível (o
usuário provavelmente vai pedir de novo no futuro), perguntar:

> "Isso pode virar uma skill pra próxima vez. Quer que eu crie?"

Não perguntar pra tarefas pontuais ou perguntas simples. Só quando o
padrão de repetição for claro.

---

## Aprender com correções

Quando o usuário corrigir algo, melhorar uma resposta ou dar uma
instrução que parece permanente (frases como "na verdade é assim", "não
faça mais isso", "prefiro assim", "sempre que...", "evita...", "da
próxima vez..."), perguntar:

> "Quer que eu salve isso pra não precisar repetir?"

Se sim, identificar onde faz mais sentido salvar:

- **Sobre o negócio** (clientes, serviços, mercado) → `_memoria/empresa.md`
- **Sobre preferências e estilo** (tom de voz, formato, o que evitar) → `_memoria/preferencias.md`
- **Sobre prioridades e foco** (projetos, metas, prazos) → `_memoria/estrategia.md`
- **Regra de comportamento nessa pasta** → próprio `CLAUDE.md`

Salvar com uma linha nova clara, sem reformatar o arquivo inteiro.
Confirmar mostrando a linha adicionada.

Não perguntar se a correção for óbvia de contexto imediato (ex: "na
verdade o arquivo se chama X"). Só perguntar quando a informação tiver
valor duradouro.

---

## Manter contexto atualizado

Ao terminar uma tarefa que mudou algo relevante (mudança de foco,
processo novo, ferramenta instalada, estrutura alterada), perguntar:

> "Isso mudou algo no teu contexto. Quer que eu atualize a memória?"

Se sim, identificar o que atualizar:

- **Ferramenta, estrutura, decisão técnica** → `_memoria/empresa.md`
- **Mudança de prioridade ou foco** → `_memoria/estrategia.md`
- **Tom ou estilo** → `_memoria/preferencias.md`
- **Pasta, regra de organização, skill criada** → `CLAUDE.md`
- **Visual (cores, fontes, logo)** → `identidade/design-guide.md`

Mostrar o que vai mudar antes de salvar. Não reformatar o arquivo
inteiro, só adicionar ou editar a linha relevante.

**Quando NÃO perguntar:**
- Tarefas pontuais sem impacto no contexto
- Perguntas simples ou conversas sem ação
- Mudanças já salvas pelo bloco "Aprender com correções"

**Dica:** rode `/atualizar` pra uma varredura completa quando houver dúvida.

---

## Criação de skills

Quando o usuário pedir skill nova:

1. Verificar se existe template relevante em `templates/skills/`. Se
   existir, usar como base e adaptar pro contexto
2. Perguntar se é específica desse projeto ou útil em qualquer:
   - Específica → `.claude/skills/nome-da-skill/SKILL.md` (local)
   - Universal → `~/.claude/skills/nome-da-skill/SKILL.md` (global)
3. Ler `_memoria/empresa.md` e `_memoria/preferencias.md` pra calibrar
   o conteúdo da skill ao contexto do negócio
4. Se a skill precisar de arquivos de apoio (templates, exemplos),
   criar dentro da pasta da skill
5. Seguir o fluxo da skill-creator nativa do Claude Code
