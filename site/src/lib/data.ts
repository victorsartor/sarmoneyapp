import { supabase } from "./supabase";
import type {
  ApartmentShare,
  Expense,
  ExpenseCategory,
  Profile,
} from "../types";

interface ExpenseRow {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  month: string;
  person_id: string | null;
  purchase_group_id: string | null;
  installment_number: number | null;
  installment_total: number | null;
  purchase_date: string | null;
  recurring: boolean;
}

interface ShareRow {
  person_id: string;
  month: string;
  percentual: number;
}

const EXPENSE_FIELDS =
  "id, category, description, amount, month, person_id, purchase_group_id, installment_number, installment_total, purchase_date, recurring";

function fromRow(row: ExpenseRow): Expense {
  return {
    id: row.id,
    category: row.category,
    description: row.description,
    amount: row.amount,
    month: row.month,
    personId: row.person_id,
    purchaseGroupId: row.purchase_group_id,
    installmentNumber: row.installment_number,
    installmentTotal: row.installment_total,
    purchaseDate: row.purchase_date,
    recurring: row.recurring,
  };
}

export function monthsFrom(startMonth: string, offset: number): string {
  const [year, month] = startMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, role, percentual")
    .order("percentual", { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchApartmentShares(
  uptoMonth: string,
): Promise<ApartmentShare[]> {
  // Traz só o que já entrou em vigor até o mês visualizado — mudanças
  // marcadas pra meses futuros não podem mexer no passado.
  const { data, error } = await supabase
    .from("apartment_shares")
    .select("person_id, month, percentual")
    .lte("month", uptoMonth);

  if (error) throw error;
  return (data as ShareRow[]).map((row) => ({
    personId: row.person_id,
    month: row.month,
    percentual: row.percentual,
  }));
}

export async function saveApartmentShares(params: {
  month: string;
  shares: { personId: string; percentual: number }[];
}) {
  const rows = params.shares.map((share) => ({
    person_id: share.personId,
    month: params.month,
    percentual: share.percentual,
  }));

  const { data, error } = await supabase
    .from("apartment_shares")
    .upsert(rows, { onConflict: "person_id,month" })
    .select("person_id");

  if (error) throw error;
  // Com RLS ligado, gravação sem policy volta sem erro e sem linha —
  // melhor avisar do que fingir que salvou.
  if (!data || data.length === 0) {
    throw new Error(
      "o banco não deixou salvar a divisão (confere as policies da tabela apartment_shares).",
    );
  }
}

export async function removeApartmentShares(month: string) {
  const { error } = await supabase
    .from("apartment_shares")
    .delete()
    .eq("month", month);

  if (error) throw error;
}

export async function fetchExpensesForMonth(month: string): Promise<Expense[]> {
  // Uma despesa aparece no mês se: (a) não é recorrente e o mês bate
  // exatamente, ou (b) é recorrente, já começou (month <= mês
  // visualizado) e ainda não foi cancelada pra esse mês (active_until
  // nulo ou >= mês visualizado).
  const filter = [
    `and(recurring.eq.false,month.eq.${month})`,
    `and(recurring.eq.true,month.lte.${month},active_until.is.null)`,
    `and(recurring.eq.true,month.lte.${month},active_until.gte.${month})`,
  ].join(",");

  const { data, error } = await supabase
    .from("expenses")
    .select(EXPENSE_FIELDS)
    .or(filter);

  if (error) throw error;
  return (data as ExpenseRow[]).map(fromRow);
}

export async function addApartmentPurchase(params: {
  startMonth: string;
  totalAmount: number;
  installments: number;
  monthlyGrowthPercent: number;
  createdBy: string;
}) {
  const purchaseGroupId = crypto.randomUUID();

  const rows = Array.from({ length: params.installments }, (_, index) => ({
    category: "Aluguel/Condomínio" as const,
    description: "Aluguel/Condomínio",
    amount: round2(
      params.totalAmount *
        (1 + (params.monthlyGrowthPercent / 100) * index),
    ),
    month: monthsFrom(params.startMonth, index),
    person_id: null,
    purchase_group_id: purchaseGroupId,
    installment_number: index + 1,
    installment_total: params.installments,
    created_by: params.createdBy,
  }));

  const { error } = await supabase.from("expenses").insert(rows);
  if (error) throw error;
}

export async function addSingleExpense(params: {
  category: Extract<ExpenseCategory, "Pix" | "Outro">;
  description: string;
  amount: number;
  month: string;
  personId: string;
  createdBy: string;
}) {
  const { error } = await supabase.from("expenses").insert({
    category: params.category,
    description: params.description,
    amount: params.amount,
    month: params.month,
    person_id: params.personId,
    created_by: params.createdBy,
  });

  if (error) throw error;
}

export async function addRecurringExpense(params: {
  category: Extract<ExpenseCategory, "Pix" | "Outro" | "Cartão">;
  description: string;
  amount: number;
  startMonth: string;
  personId: string;
  createdBy: string;
  purchaseDate?: string; // 'YYYY-MM-DD', dia exato (cartão)
}) {
  const { error } = await supabase.from("expenses").insert({
    category: params.category,
    description: params.description,
    amount: params.amount,
    month: params.startMonth,
    person_id: params.personId,
    purchase_date: params.purchaseDate ?? null,
    recurring: true,
    created_by: params.createdBy,
  });

  if (error) throw error;
}

export async function cancelRecurringExpense(id: string, fromMonth: string) {
  // fromMonth é o mês que está sendo visto quando o admin cancela — ele
  // já deve sumir dali em diante, então o último mês ativo é o anterior.
  const lastActiveMonth = monthsFrom(fromMonth, -1);
  const { error } = await supabase
    .from("expenses")
    .update({ active_until: lastActiveMonth })
    .eq("id", id);

  if (error) throw error;
}

export async function addCardPurchase(params: {
  description: string;
  installmentAmount: number;
  installments: number;
  purchaseDate: string; // 'YYYY-MM-DD', dia exato da compra
  personId: string;
  createdBy: string;
}) {
  const purchaseGroupId = crypto.randomUUID();
  // Compra no cartão fecha na fatura do mês seguinte, não no mês da compra.
  const startMonth = monthsFrom(params.purchaseDate.slice(0, 7), 1);

  const rows = Array.from({ length: params.installments }, (_, index) => ({
    category: "Cartão" as const,
    description: params.description,
    amount: params.installmentAmount,
    month: monthsFrom(startMonth, index),
    person_id: params.personId,
    purchase_group_id: purchaseGroupId,
    installment_number: index + 1,
    installment_total: params.installments,
    purchase_date: params.purchaseDate,
    created_by: params.createdBy,
  }));

  const { error } = await supabase.from("expenses").insert(rows);
  if (error) throw error;
}

export async function updateExpense(
  expense: Pick<Expense, "id" | "purchaseGroupId">,
  changes: {
    description: string;
    amount: number;
    personId?: string | null;
    purchaseDate?: string | null;
  },
) {
  const patch = {
    description: changes.description,
    amount: changes.amount,
    ...(changes.personId !== undefined ? { person_id: changes.personId } : {}),
    ...(changes.purchaseDate !== undefined ? { purchase_date: changes.purchaseDate } : {}),
  };

  // Mudar nome ou valor vale pra todos os meses: numa compra parcelada
  // isso é a série inteira; numa assinatura recorrente é uma linha só,
  // que por natureza já aparece em todos os meses.
  const query = expense.purchaseGroupId
    ? supabase
        .from("expenses")
        .update(patch)
        .eq("purchase_group_id", expense.purchaseGroupId)
    : supabase.from("expenses").update(patch).eq("id", expense.id);

  const { error } = await query;
  if (error) throw error;
}

export async function removeExpense(expense: Pick<Expense, "id" | "purchaseGroupId">) {
  // Se a despesa faz parte de uma compra parcelada (cartão ou
  // apartamento), apaga todas as parcelas do grupo — não só a do mês
  // que está sendo visualizado.
  const query = expense.purchaseGroupId
    ? supabase.from("expenses").delete().eq("purchase_group_id", expense.purchaseGroupId)
    : supabase.from("expenses").delete().eq("id", expense.id);

  const { error } = await query;
  if (error) throw error;
}
