import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { Login } from "./components/Login";
import { AdminForms } from "./components/AdminForms";
import { SummaryCard } from "./components/SummaryCard";
import { ExpenseList } from "./components/ExpenseList";
import {
  cancelRecurringExpense,
  fetchExpensesForMonth,
  fetchProfiles,
  removeExpense,
} from "./lib/data";
import { computeMonthSummary } from "./lib/summary";
import { currentMonthKey, monthLabel } from "./lib/format";
import type { Expense, Profile } from "./types";

export default function App() {
  const { loading, profile, signOut } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [month, setMonth] = useState(currentMonthKey());

  const loadData = useCallback(async () => {
    const [profilesData, expensesData] = await Promise.all([
      fetchProfiles(),
      fetchExpensesForMonth(month),
    ]);
    setProfiles(profilesData);
    setExpenses(expensesData);
  }, [month]);

  useEffect(() => {
    if (profile) loadData();
  }, [profile, loadData]);

  const summary = useMemo(
    () => computeMonthSummary(profiles, expenses),
    [profiles, expenses],
  );

  const isAdmin = profile?.role === "admin";

  const visibleExpenses = useMemo(() => {
    if (!profile || isAdmin) return expenses;
    return expenses.filter(
      (e) => e.personId === profile.id || e.personId === null,
    );
  }, [expenses, profile, isAdmin]);

  const visibleSummary = useMemo(() => {
    if (!profile || isAdmin) return summary;
    return {
      ...summary,
      perPerson: summary.perPerson.filter((p) => p.profile.id === profile.id),
      total: summary.perPerson.find((p) => p.profile.id === profile.id)?.total ?? 0,
    };
  }, [summary, profile, isAdmin]);

  async function handleRemove(expense: Expense) {
    await removeExpense(expense);
    loadData();
  }

  async function handleCancelRecurring(expense: Expense) {
    await cancelRecurringExpense(expense.id, month);
    loadData();
  }

  if (loading) return null;
  if (!profile) return <Login />;

  return (
    <div className="min-h-screen">
      <header className="border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">SARMONEYAPP</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Olá, {profile.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="month" className="text-sm text-neutral-500">
              {monthLabel(month)}
            </label>
            <input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/10"
            />
            <button
              onClick={signOut}
              className="text-sm text-neutral-400 hover:text-red-500"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-4 px-4 py-6 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <SummaryCard summary={visibleSummary} />
          <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Despesas de {monthLabel(month)}
            </h2>
            <ExpenseList
              expenses={visibleExpenses}
              profiles={profiles}
              month={month}
              canRemove={isAdmin}
              onRemove={handleRemove}
              onCancelRecurring={handleCancelRecurring}
            />
          </section>
        </div>

        <div>
          {profile.role === "admin" ? (
            <AdminForms
              month={month}
              profiles={profiles}
              createdBy={profile.id}
              onSaved={loadData}
            />
          ) : (
            <section className="rounded-xl border border-black/10 bg-white p-5 text-sm text-neutral-500 shadow-sm dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-400">
              Só o Jackson pode lançar despesas novas. Aqui você acompanha o
              resumo do mês.
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
