import { useState } from "react";
import type { Expense, Profile } from "../types";
import { formatCurrency, formatDay } from "../lib/format";

interface Props {
  expenses: Expense[];
  profiles: Profile[];
  month: string;
  isAdmin: boolean;
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
  isAdmin,
  onRemove,
  onCancelRecurring,
  onEdit,
}: Props) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  // null = ninguém filtrado, mostra tudo. Guardar assim evita depender de
  // um efeito pra sincronizar quando a lista de perfis chega do banco.
  const [selectedPeople, setSelectedPeople] = useState<string[] | null>(null);

  function isPersonSelected(personId: string) {
    return selectedPeople === null || selectedPeople.includes(personId);
  }

  function togglePerson(personId: string) {
    const current = selectedPeople ?? profiles.map((p) => p.id);
    const next = current.includes(personId)
      ? current.filter((id) => id !== personId)
      : [...current, personId];

    setSelectedPeople(next.length === profiles.length ? null : next);
  }

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

  // Com filtro ativo mostramos só o gasto individual de quem está
  // marcado — o apartamento é rateado entre todos, não é gasto de
  // ninguém em específico.
  const visible =
    selectedPeople === null
      ? expenses
      : expenses.filter((e) => e.personId && selectedPeople.includes(e.personId));

  const sorted = [...visible].sort((a, b) =>
    a.category.localeCompare(b.category),
  );

  return (
    <>
      {isAdmin && profiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => togglePerson(p.id)}
              aria-pressed={isPersonSelected(p.id)}
              className={
                isPersonSelected(p.id)
                  ? "rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                  : "rounded-full border border-black/10 px-3 py-1 text-xs text-neutral-500 hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
              }
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {expenses.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Nenhuma despesa lançada nesse mês ainda.
        </p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Ninguém selecionado tem despesa nesse mês.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
          {sorted.map((expense) => (
            <li
              key={expense.id}
              className="flex flex-col gap-1.5 py-3 text-sm sm:flex-row sm:items-center sm:gap-3 sm:py-2"
            >
              <span className="min-w-0 flex-1 truncate">
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
              <span className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                  {expense.category}
                </span>
                <span className="w-20 text-right tabular-nums sm:w-24">
                  {formatCurrency(expense.amount)}
                </span>
                {isAdmin && (
                  <span className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="rounded-lg p-2 text-neutral-400 hover:text-emerald-500"
                      aria-label={`Editar ${expense.description}`}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleRemoveClick(expense)}
                      className="rounded-lg p-2 text-neutral-400 hover:text-red-500"
                      aria-label={`Remover ${expense.description}`}
                    >
                      ×
                    </button>
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

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

  const isSeries = Boolean(
    expense.installmentTotal && expense.installmentTotal > 1,
  );

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

          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {isSeries
              ? `A mudança vale para todas as ${expense.installmentTotal} parcelas.`
              : "A mudança vale para todos os meses."}
          </p>

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
