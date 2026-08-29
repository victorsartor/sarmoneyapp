# SARMONEYAPP

App web de gestão financeira familiar. Não é produto público — só o
Jackson (admin, único que lança despesas), a Janine e o Victor usam.

Quem é o projeto, como ele fala e o que está em foco vive em `_memoria/`.
Aqui ficam só as regras de trabalho no código, que aquele conteúdo não
cobre.

## Onde fica o quê

- `site/` — o app (React 19 + Vite + TypeScript + Tailwind v4 + Supabase)
- `site/src/lib/data.ts` — toda conversa com o Supabase passa por aqui;
  os componentes não chamam o client direto
- `site/sql/` — SQL de tabela nova, guardado antes de ser rodado à mão
- `_memoria/`, `identidade/`, `marketing/`, `saidas/`, `dados/`,
  `scripts/`, `templates/` — workspace do MazyOS, não têm a ver com o app

## Regras do app

**Celular primeiro.** Os pais usam quase só pelo celular. Toda mudança de
UI é validada em ~375px, não no desktop. Layout empilha no mobile e só
vira linha única a partir do breakpoint `sm:`. Botão de ícone precisa de
área de toque de verdade, não só um glifo.

O Chrome headless no Windows força janela de ~500px, então
`--window-size=375` não dá viewport de 375px. Pra testar de verdade,
embutir a página num `<iframe width="375">` dentro de uma página harness —
as media queries são avaliadas contra a largura do iframe.

**Schema do Supabase.** O banco em produção é a fonte de verdade — não tem
migração automática. Tabela nova: escrever o SQL em `site/sql/`, e o
Victor roda no SQL Editor do dashboard. O app precisa continuar de pé
enquanto a tabela não existe (mostrar erro na área afetada, não quebrar a
tela toda).

**Deploy.** Push na `main` → a Vercel deploya sozinha. Não tem staging,
então o que sobe vai direto pro celular dos pais.

**Antes de entregar:** `npm run build` (roda `tsc -b` junto) e `npx oxlint`
dentro de `site/`. Prop ou campo que ficou sem uso sai — o projeto já
passou por limpeza de código morto e não deve reacumular.

## Escrita

Código, comentário e commit em português. Comentário explica *por que*
aquilo está ali (a regra de negócio, o bug que evita), não o que a linha
faz. Commits no imperativo, como os que já estão no histórico.
