export type Role = "admin" | "membro";

export interface Profile {
  id: string;
  name: string;
  role: Role;
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
  activeUntil: string | null; // 'YYYY-MM', último mês em que uma recorrente ainda cobra
  createdBy: string;
}
