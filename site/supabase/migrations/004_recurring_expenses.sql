-- Roda só isso no SQL Editor.
-- Suporte a despesa recorrente (assinatura tipo Netflix): um Pix ou
-- Outro que cobra todo mês, sem número fixo de parcelas, até o admin
-- cancelar.

alter table expenses add column if not exists recurring boolean not null default false;
alter table expenses add column if not exists active_until text; -- 'YYYY-MM', null = ainda ativa
