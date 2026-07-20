// Lista fixa de quem pode logar. Os emails aqui precisam ser os mesmos
// cadastrados em Authentication > Users no painel do Supabase — veja
// supabase/README.md pro passo a passo.
export const FAMILY_LOGINS = [
  { name: "Jackson", email: "jackson@sarmoneyapp.local" },
  { name: "Janine", email: "janine@sarmoneyapp.local" },
  { name: "Victor", email: "victor@sarmoneyapp.local" },
] as const;
