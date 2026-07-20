# Estratégia

> O que importa agora. Prioridades, metas, prazos.
> O Claude usa isso pra decidir o que sugerir primeiro e o que adiar.
> Atualize sempre que as prioridades mudarem.

## Fase

Projeto pessoal solo, ainda em construção (SARmoney — gestão financeira familiar).

Início do desenvolvimento do app web em `site/` (2026-07-20) — React +
Vite + TypeScript + Tailwind v4.

Regra de negócio definida (2026-07-20): três logins fixos — Jackson
(admin, único que lança despesas), Janine e Victor (só acompanham).
Apartamento é rateado automaticamente 48% Jackson / 31% Janine / 21%
Victor. Cartão é comprado parcelado e atribuído a uma pessoa — as
parcelas aparecem sozinhas nos meses seguintes (uma por mês). Pix/Outro
é lançamento avulso atribuído a uma pessoa, direto no mês.

Como os três acessam de aparelhos diferentes, o app precisa de backend
compartilhado — decidido usar Supabase (Postgres + Auth, plano grátis).
Setup feito e em funcionamento (2026-07-20): projeto criado, schema +
migrações aplicadas, os 3 usuários cadastrados, `.env` configurado — ver
`site/supabase/README.md` pra referência de como foi montado.

Ajuste de regra (2026-07-20): apartamento agora é parcelado como um
financiamento (nº de parcelas + rentabilidade % ao mês), não um
lançamento único por mês. Rentabilidade decidida como crescimento
simples (linear sobre o valor original), rateada sempre pela % fixa de
cada um — não crescimento composto nem valor fixo somado por pessoa
(isso desfaria a proporção 48/31/21 com o tempo). Compra no cartão
agora registra o dia exato da compra, não só o mês.

Regra de visibilidade (2026-07-20): Janine e Victor só veem, na tela e
no banco (RLS), o apartamento (compartilhado) e as próprias despesas —
nunca a despesa individual um do outro. Jackson (admin) vê tudo.

Função de assinatura recorrente (2026-07-20): Pix e Cartão podem ser
marcados como recorrentes (ex: Netflix, Claude AI) — cobram todo mês
sem número fixo de parcelas, até o admin cancelar. Cancelar remove a
cobrança a partir do mês que estava sendo visto (inclusive), mantendo os
meses anteriores no histórico. Já apagar uma despesa parcelada (cartão
ou apartamento) remove a série inteira, em todos os meses — usado pra
corrigir lançamento errado, não pra encerrar algo em andamento.

## Prioridade principal

Gargalo: falta de constância / preguiça pra tocar o projeto sozinho. A
prioridade é manter ritmo de execução, não deixar o projeto parado.

## O que pode esperar

Identidade visual (cores, fonte, logo) — ainda não definida, sem urgência
por não ser produto público.

## Contexto com prazo

Nenhum prazo externo — ritmo definido pelo próprio criador.

## Candidata a skill

O criador mencionou que "codar" é a tarefa que mais repete toda semana.
Candidata natural pra rodar `/mapear-rotinas` e transformar em skill
própria (ex: automatizar partes recorrentes do desenvolvimento do
SARMONEYAPP).
