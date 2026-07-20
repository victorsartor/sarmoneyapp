-- Roda só isso no SQL Editor (o schema.sql principal já foi aplicado antes).
-- Adiciona o dia exato da compra, usado nas parcelas do cartão.

alter table expenses add column if not exists purchase_date date;
