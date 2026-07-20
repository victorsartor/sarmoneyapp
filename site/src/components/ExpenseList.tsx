import type { Expense, Profile } from "../types";
import { formatCurrency, formatDay } from "../lib/format";

interface Props {
  expenses: Expense[];
  profiles: Profile[];
  month: string;
  canRemove: boolean;
  onRemove: (expense: Expense) => void;
  onCancelRecurring: (expense: Expense) => void;
}

export function ExpenseList({
  expenses,
  profiles,
  month,
  canRemove,
  onRemove,
  onCancelRecurring,
}: Props) {
  if (expenses.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        Nenhuma despesa lançada nesse mês ainda.
      </p>
    );
  }

  function personName(personId: string | null) {
    if (!personId) return "Apartamento (rateado)";
    return profiles.find((p) => p.id === personId)?.name ?? "—";
  }

  function handleRemoveClick(expense: Expense) {
    if (expense.recurring) {
      const confirmed = window.confirm(
        `"${expense.description}" é uma assinatura recorrente. Isso vai remover a cobrança de ${month} em diante (os meses anteriores continuam no histórico). Confirma?`,
      );
      if (!confirmed) return;
      onCancelRecurring(expense);
      return;
    }

    if (expense.installmentTotal && expense.installmentTotal > 1) {
      const confirmed = window.confirm(
        `"${expense.description}" tem ${expense.installmentTotal} parcelas. Isso vai apagar TODAS elas, em todos os meses (não só ${expense.month}). Confirma?`,
      );
      if (!confirmed) return;
    }
    onRemove(expense);
  }

  const sorted = [...expenses].sort((a, b) =>
    a.category.localeCompare(b.category),
  );

  return (
    <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
      {sorted.map((expense) => (
        <li key={expense.id} className="flex items-center gap-3 py-2 text-sm">
          <span className="flex-1 truncate">
            <span className="font-medium">{expense.description}</span>
            <span className="ml-2 text-xs text-neutral-400">
              {personName(expense.personId)}
              {expense.purchaseDate ? ` · ${formatDay(expense.purchaseDate)}` : ""}
              {expense.installmentTotal
                ? ` · ${expense.installmentNumber}/${expense.installmentTotal}`
                : ""}
              {expense.recurring ? " · assinatura" : ""}
            </span>
          </span>
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
            {expense.category}
          </span>
          <span className="w-24 text-right tabular-nums">
            {formatCurrency(expense.amount)}
          </span>
          {canRemove && (
            <button
              onClick={() => handleRemoveClick(expense)}
              className="text-neutral-400 hover:text-red-500"
              aria-label={`Remover ${expense.description}`}
            >
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
