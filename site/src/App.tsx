import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { Login } from "./components/Login";
import { AdminForms } from "./components/AdminForms";
import { SummaryCard } from "./components/SummaryCard";
import { ExpenseList } from "./components/ExpenseList";
import { FullPageSpinner, Spinner } from "./components/Spinner";
import {
  cancelRecurringExpense,
  fetchApartmentShares,
  fetchExpensesForMonth,
  fetchProfiles,
  removeExpense,
  updateExpense,
} from "./lib/data";
import { computeMonthSummary, percentuaisForMonth } from "./lib/summary";
import { currentMonthKey, monthLabel } from "./lib/format";
import type { ApartmentShare, Expense, Profile } from "./types";

export default function App() {
  const { loading, profile, signOut } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [shares, setShares] = useState<ApartmentShare[]>([]);
  const [month, setMonth] = useState(currentMonthKey());
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    setLoadError(null);
    try {
      const [profilesData, expensesData, sharesData] = await Promise.all([
        fetchProfiles(),
        fetchExpensesForMonth(month),
        fetchApartmentShares(month),
      ]);
      setProfiles(profilesData);
      setExpenses(expensesData);
      setShares(sharesData);
    } catch (err) {
      // Sem isso, uma consulta que falha deixava a tela vazia pra sempre,
      // parecendo carregamento infinito.
      setLoadError((err as Error).message ?? String(err));
    } finally {
      setLoadingData(false);
    }
  }, [month]);

  useEffect(() => {
    if (profile) loadData();
  }, [profile, loadData]);

  const percentuais = useMemo(
    () => percentuaisForMonth(profiles, shares, month),
    [profiles, shares, month],
  );

  const summary = useMemo(
    () => computeMonthSummary(profiles, expenses, percentuais),
    [profiles, expenses, percentuais],
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

  async function handleEdit(
    expense: Expense,
    changes: { description: string; amount: number; personId?: string | null; purchaseDate?: string | null },
    scope: "single" | "series",
  ) {
    try {
      await updateExpense(expense, changes, scope);
      loadData();
    } catch (err) {
      alert(`Não deu pra salvar a edição: ${(err as Error).message ?? err}`);
    }
  }

  if (loading) return <FullPageSpinner />;
  if (!profile) return <Login />;

  return (
    <div className="min-h-screen">
      <header className="border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold">
              SARMONEYAPP
              {loadingData && <Spinner className="h-4 w-4 text-emerald-600" />}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Olá, {profile.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="month"
              aria-label={monthLabel(month)}
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-black/10 bg-transparent px-2 py-2 text-sm dark:border-white/10"
            />
            <button
              onClick={signOut}
              className="rounded-lg px-2 py-2 text-sm text-neutral-400 hover:text-red-500"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-4 px-4 py-6 sm:grid-cols-2">
        {loadError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 sm:col-span-2 dark:text-red-400">
            Não deu pra carregar os dados: {loadError}{" "}
            <button
              onClick={loadData}
              className="font-medium underline hover:no-underline"
            >
              Tentar de novo
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <SummaryCard summary={visibleSummary} />
          <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Despesas de {monthLabel(month)}
            </h2>
            {loadingData && expenses.length === 0 ? (
              <div className="flex justify-center py-4">
                <Spinner className="h-6 w-6 text-neutral-400" />
              </div>
            ) : (
              <ExpenseList
                expenses={visibleExpenses}
                profiles={profiles}
                month={month}
                canRemove={isAdmin}
                onRemove={handleRemove}
                onCancelRecurring={handleCancelRecurring}
                onEdit={handleEdit}
              />
            )}
          </section>
        </div>

        <div>
          {profile.role === "admin" ? (
            <AdminForms
              month={month}
              profiles={profiles}
              percentuais={percentuais}
              changedThisMonth={shares.some((s) => s.month === month)}
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
