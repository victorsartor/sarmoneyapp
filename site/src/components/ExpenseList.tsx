import { useState } from "react";
import type { Expense, Profile } from "../types";
import { formatCurrency, formatDay } from "../lib/format";

interface Props {
  expenses: Expense[];
  profiles: Profile[];
  month: string;
  canRemove: boolean;
  onRemove: (expense: Expense) => void;
  onCancelRecurring: (expense: Expense) => void;
  onEdit: (
    expense: Expense,
    changes: { description: string; amount: number; personId?: string | null; purchaseDate?: string | null },
  ) => void;
}

export function ExpenseList({
  expenses,
  profiles,
  month,
  canRemove,
  onRemove,
  onCancelRecurring,
  onEdit,
}: Props) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  function personName(personId: string | null) {
    if (!personId) return "Apartamento (rateado)";
    return profiles.find((p) => p.id === personId)?.name ?? "—";
  }

  function handleRemoveClick(expense: Expense) {
    if (expense.recurring) {
      const confirmed = window.confirm(
        `"${expense.description}" é uma assinatura recorrente. Isso vai remover a cobrança de ${month} em diante (os meses anteriores continuam no histórico). Confirma que quer excluir?`,
      );
      if (!confirmed) return;
      onCancelRecurring(expense);
      return;
    }

    if (expense.installmentTotal && expense.installmentTotal > 1) {
      const confirmed = window.confirm(
        `"${expense.description}" tem ${expense.installmentTotal} parcelas. Isso vai apagar TODAS elas, em todos os meses (não só ${expense.month}). Confirma que quer excluir?`,
      );
      if (!confirmed) return;
      onRemove(expense);
      return;
    }

    const confirmed = window.confirm(
      `Confirma que quer excluir "${expense.description}"?`,
    );
    if (!confirmed) return;
    onRemove(expense);
  }

  if (expenses.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        Nenhuma despesa lançada nesse mês ainda.
      </p>
    );
  }

  const sorted = [...expenses].sort((a, b) =>
    a.category.localeCompare(b.category),
  );

  return (
    <>
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
              <span className="flex items-center gap-2">
                <button
                  onClick={() => setEditingExpense(expense)}
                  className="text-neutral-400 hover:text-emerald-500"
                  aria-label={`Editar ${expense.description}`}
                >
                  ✎
                </button>
                <button
                  onClick={() => handleRemoveClick(expense)}
                  className="text-neutral-400 hover:text-red-500"
                  aria-label={`Remover ${expense.description}`}
                >
                  ×
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          profiles={profiles}
          onCancel={() => setEditingExpense(null)}
          onSave={(changes) => {
            onEdit(editingExpense, changes);
            setEditingExpense(null);
          }}
        />
      )}
    </>
  );
}

function EditExpenseModal({
  expense,
  profiles,
  onCancel,
  onSave,
}: {
  expense: Expense;
  profiles: Profile[];
  onCancel: () => void;
  onSave: (changes: {
    description: string;
    amount: number;
    personId?: string | null;
    purchaseDate?: string | null;
  }) => void;
}) {
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(String(expense.amount));
  const [personId, setPersonId] = useState(expense.personId ?? "");
  const [purchaseDate, setPurchaseDate] = useState(expense.purchaseDate ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!description.trim() || !amount || Number.isNaN(value)) return;

    onSave({
      description: description.trim(),
      amount: value,
      ...(expense.personId !== null ? { personId: personId || null } : {}),
      ...(expense.purchaseDate !== null ? { purchaseDate: purchaseDate || null } : {}),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-5 shadow-lg dark:border-white/10 dark:bg-neutral-900">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Editar despesa
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição"
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min={0}
            step="0.01"
            placeholder="R$ 0,00"
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
          />
          {expense.personId !== null && (
            <select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="rounded-lg border border-black/10 bg-transparent px-2 py-2 text-sm dark:border-white/10"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          {expense.purchaseDate !== null && (
            <input
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              type="date"
              className="rounded-lg border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/10"
            />
          )}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
