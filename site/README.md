# site/ — app web do SARMONEYAPP

App de gestão financeira familiar com login pra Jackson (admin), Janine
e Victor.

- **Jackson** lança as despesas: apartamento (rateado automaticamente
  48% Jackson / 31% Janine / 21% Victor), compras parceladas no cartão
  (aparecem sozinhas nos meses seguintes, uma parcela por mês) e Pix ou
  despesas avulsas atribuídas a uma pessoa.
- **Janine e Victor** logam só pra acompanhar: quanto cada um deve pagar
  no mês, com o detalhamento de apartamento + individual.

Stack: React + Vite + TypeScript + Tailwind v4 + [Supabase](https://supabase.com)
(banco de dados + login). Sem Supabase configurado, o app não roda —
veja `supabase/README.md` pro passo a passo de setup (uma vez só).

## Rodando local

```
npm install
cp .env.example .env   # preencha com a URL e a anon key do seu projeto Supabase
npm run dev
```

## Build de produção

```
npm run build
```

Gera a pasta `dist/`, pronta pra hospedar em qualquer serviço de site
estático (Netlify, Vercel, etc.) — lembrando de configurar as mesmas
variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) no
serviço de hospedagem.
