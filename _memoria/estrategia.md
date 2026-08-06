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
Apartamento é rateado automaticamente por percentual entre os três
(começou 48% Jackson / 31% Janine / 21% Victor). Cartão é comprado
parcelado e atribuído a uma pessoa — as parcelas aparecem sozinhas nos
meses seguintes (uma por mês). Pix/Outro é lançamento avulso atribuído a
uma pessoa, direto no mês.

Como os três acessam de aparelhos diferentes, o app precisa de backend
compartilhado — decidido usar Supabase (Postgres + Auth, plano grátis).
Setup feito e em funcionamento (2026-07-20): projeto criado, schema +
migrações aplicadas, os 3 usuários cadastrados, `.env` configurado. A
pasta `site/supabase/` (schema e migrações) foi removida do repositório
em 2026-07-23 — o banco em produção é a única fonte de verdade do
schema hoje, então mudanças de estrutura são feitas direto no SQL Editor
do Supabase.

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

Progresso (2026-07-27): app publicado em produção, com lançar/editar/
excluir despesas funcionando (confirmação antes de excluir). Corrigido
bug em que o dropdown de pessoa não sincronizava com os perfis
carregados — "Salvar" silenciosamente não fazia nada pra quem não fosse
a pessoa padrão do formulário.

Progresso (2026-08-05): percentuais do rateio do apartamento deixaram
de ser fixos no banco — agora tem um formulário ("Divisão do apartamento
(%)") pra o admin editar a qualquer momento, com validação de que a soma
fecha em 100%. Corrigida também a regra da parcela do cartão: a primeira
parcela cai na fatura do mês seguinte ao da compra, não no mês em que a
compra foi feita (fechamento de fatura).

Regra de divisão por mês (2026-08-05): a mudança de percentual não
reescreve o passado — vale do mês em que foi feita em diante, e os meses
anteriores continuam com a divisão antiga. Guardado na tabela
`apartment_shares` (person_id, month, percentual), com o `percentual` do
perfil servindo de valor original enquanto não houver mudança
registrada. Por isso a proporção inicial 48/31/21 não é mais fixa — hoje
está 47/31/22.

Regra de edição (2026-08-05): mudar nome ou valor de uma despesa vale
pra todos os meses, sem perguntar. Numa compra parcelada isso atinge a
série inteira; numa assinatura recorrente é uma linha só, que por
natureza já aparece em todos os meses. Antes a edição mexia só no mês
aberto, o que deixava as parcelas seguintes com o valor velho.

Progresso (2026-08-05, fim do dia): filtro por pessoa na lista de
despesas (botões com os 3 nomes, multi-seleção, só pro admin — com
filtro ativo o apartamento sai da lista por ser rateado entre todos);
indicador de carregamento e tratamento de erro com "tentar de novo" na
carga dos dados; animações discretas de entrada, hover e foco, todas
desligadas por `prefers-reduced-motion`.

Restrição de uso (2026-08-05): os pais acessam o app principalmente pelo
celular, então o layout precisa funcionar bem em tela estreita (~375px).
Cabeçalho e lista de despesas ajustados pra empilhar no celular e voltar
a uma linha só no desktop.

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
