export type Role = "admin" | "membro";

export interface Profile {
  id: string;
  name: string;
  role: Role;
  percentual: number; // divisão original, usada até a 1ª mudança registrada
}

// Mudança na divisão do apartamento. Vale do mês registrado em diante,
// até existir outra mudança mais nova.
export interface ApartmentShare {
  personId: string;
  month: string; // 'YYYY-MM'
  percentual: number;
}

export const EXPENSE_CATEGORIES = [
  "Aluguel/Condomínio",
  "Cartão",
  "Pix",
  "Outro",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  month: string; // 'YYYY-MM'
  personId: string | null; // null = Aluguel/Condomínio, rateado entre todos
  purchaseGroupId: string | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
  purchaseDate: string | null; // 'YYYY-MM-DD', dia exato (hoje só usado no Cartão)
  recurring: boolean; // assinatura tipo Netflix: cobra todo mês até ser cancelada
}
