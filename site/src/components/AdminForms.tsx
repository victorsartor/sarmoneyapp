import { useEffect, useState } from "react";
import { EXPENSE_CATEGORIES } from "../types";
import type { Profile } from "../types";
import {
  addApartmentPurchase,
  addCardPurchase,
  addRecurringExpense,
  addSingleExpense,
  monthsFrom,
  removeApartmentShares,
  saveApartmentShares,
} from "../lib/data";
import { monthLabel } from "../lib/format";

const SINGLE_EXPENSE_CATEGORIES = EXPENSE_CATEGORIES.filter(
  (c): c is "Pix" | "Outro" => c === "Pix" || c === "Outro",
);

interface Props {
  month: string;
  profiles: Profile[];
  percentuais: Record<string, number>;
  changedThisMonth: boolean;
  createdBy: string;
  onSaved: () => void;
}

export function AdminForms({
  month,
  profiles,
  percentuais,
  changedThisMonth,
  createdBy,
  onSaved,
}: Props) {
  return (
    <div className="stagger flex flex-col gap-4">
      <ApartmentForm month={month} createdBy={createdBy} onSaved={onSaved} />
      <SplitForm
        month={month}
        profiles={profiles}
        percentuais={percentuais}
        changedThisMonth={changedThisMonth}
        onSaved={onSaved}
      />
      <SingleExpenseForm
        month={month}
        profiles={profiles}
        createdBy={createdBy}
        onSaved={onSaved}
      />
      <CardPurchaseForm
        month={month}
        profiles={profiles}
        createdBy={createdBy}
        onSaved={onSaved}
      />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-white/10 dark:bg-neutral-900">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ApartmentForm({
  month,
  createdBy,
  onSaved,
}: {
  month: string;
  createdBy: string;
  onSaved: () => void;
}) {
  const [totalAmount, setTotalAmount] = useState("");
  const [installments, setInstallments] = useState("300");
  const [growthPercent, setGrowthPercent] = useState("0");
  const [startMonth, setStartMonth] = useState(month);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const totalValue = Number(totalAmount);
    const installmentsValue = Number(installments);
    const growthValue = Number(growthPercent);
    if (
      !totalAmount ||
      Number.isNaN(totalValue) ||
      !installmentsValue ||
      installmentsValue < 1 ||
      Number.isNaN(growthValue)
    )
      return;

    setSaving(true);
    try {
      await addApartmentPurchase({
        startMonth,
        totalAmount: totalValue,
        installments: installmentsValue,
        monthlyGrowthPercent: growthValue,
        createdBy,
      });
      setTotalAmount("");
      onSaved();
    } catch (err) {
      alert(`Não deu pra salvar: ${(err as Error).message ?? err}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Apartamento (rateado automaticamente)">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
        <input
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          type="number"
          min={0}
          step="0.01"
          placeholder="Total do 1º mês, ex: 4000"
          className="col-span-2 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
        />
        <input
          value={installments}
          onChange={(e) => setInstallments(e.target.value)}
          type="number"
          min={1}
          placeholder="Nº de parcelas"
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
        />
        <input
          value={growthPercent}
          onChange={(e) => setGrowthPercent(e.target.value)}
          type="number"
          min={0}
          step="0.01"
          placeholder="Rentabilidade % a.m."
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
        />
        <label className="col-span-2 flex items-center gap-2 text-sm text-neutral-500">
          1ª parcela em
          <input
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            type="month"
            className="rounded-lg border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/10"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="col-span-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:hover:shadow-none"
        >
          Salvar parcelas
        </button>
      </form>
    </Card>
  );
}

function SplitForm({
  month,
  profiles,
  percentuais,
  changedThisMonth,
  onSaved,
}: {
  month: string;
  profiles: Profile[];
  percentuais: Record<string, number>;
  changedThisMonth: boolean;
  onSaved: () => void;
}) {
  // Só guarda o que foi digitado; o resto vem do banco. Assim a lista
  // pode recarregar sem apagar o que o Jackson está editando.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const savedOf = (p: Profile) => percentuais[p.id] ?? p.percentual;
  const valueOf = (p: Profile) => drafts[p.id] ?? String(savedOf(p));

  const numbers = profiles.map((p) => Number(valueOf(p)));
  const allValid = numbers.every((n) => !Number.isNaN(n) && n >= 0 && n <= 100);
  const sum = allValid ? numbers.reduce((acc, n) => acc + n, 0) : 0;
  // Centavos de arredondamento não podem travar o botão.
  const sumOk = allValid && Math.abs(sum - 100) < 0.01;
  const changed = profiles.some((p) => Number(valueOf(p)) !== savedOf(p));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sumOk || !changed) return;

    setSaving(true);
    try {
      await saveApartmentShares({
        month,
        shares: profiles.map((p) => ({
          personId: p.id,
          percentual: Number(valueOf(p)),
        })),
      });
      setDrafts({});
      onSaved();
    } catch (err) {
      alert(`Não deu pra salvar: ${(err as Error).message ?? err}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleUndo() {
    if (!confirm(`Desfazer a mudança de divisão de ${monthLabel(month)}?`))
      return;

    setSaving(true);
    try {
      await removeApartmentShares(month);
      setDrafts({});
      onSaved();
    } catch (err) {
      alert(`Não deu pra desfazer: ${(err as Error).message ?? err}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Divisão do apartamento (%)">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <p className="-mt-2 mb-1 text-xs text-neutral-500 dark:text-neutral-400">
          Vale a partir de {monthLabel(month)} e segue nos meses seguintes até
          ser mudada de novo. Os meses anteriores ficam como estão.
        </p>

        {profiles.map((p) => (
          <label
            key={p.id}
            className="flex items-center justify-between gap-2 text-sm"
          >
            {p.name}
            <span className="flex items-center gap-1">
              <input
                value={valueOf(p)}
                onChange={(e) =>
                  setDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
                type="number"
                min={0}
                max={100}
                step="0.01"
                className="w-24 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-right text-sm tabular-nums dark:border-white/10"
              />
              <span className="text-neutral-400">%</span>
            </span>
          </label>
        ))}

        <p className={`text-xs ${sumOk ? "text-neutral-400" : "text-red-500"}`}>
          {allValid
            ? `Soma: ${sum.toFixed(2).replace(".", ",")}%${
                sumOk ? "" : " — precisa fechar em 100%"
              }`
            : "Preencha todos os percentuais entre 0 e 100."}
        </p>

        <button
          type="submit"
          disabled={saving || !sumOk || !changed}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:hover:shadow-none"
        >
          Salvar divisão
        </button>

        {changedThisMonth && (
          <button
            type="button"
            onClick={handleUndo}
            disabled={saving}
            className="text-xs text-neutral-400 hover:text-red-500 disabled:opacity-50"
          >
            Desfazer a mudança feita em {monthLabel(month)}
          </button>
        )}
      </form>
    </Card>
  );
}

function SingleExpenseForm({
  month,
  profiles,
  createdBy,
  onSaved,
}: {
  month: string;
  profiles: Profile[];
  createdBy: string;
  onSaved: () => void;
}) {
  const [category, setCategory] = useState<"Pix" | "Outro">("Pix");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [personId, setPersonId] = useState(profiles[0]?.id ?? "");
  const [recurring, setRecurring] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profiles.some((p) => p.id === personId)) {
      setPersonId(profiles[0]?.id ?? "");
    }
  }, [profiles, personId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!description.trim() || !amount || Number.isNaN(value) || !personId) return;

    setSaving(true);
    try {
      if (recurring) {
        await addRecurringExpense({
          category,
          description: description.trim(),
          amount: value,
          startMonth: month,
          personId,
          createdBy,
        });
      } else {
        await addSingleExpense({
          category,
          description: description.trim(),
          amount: value,
          month,
          personId,
          createdBy,
        });
      }
      setDescription("");
      setAmount("");
      setRecurring(false);
      onSaved();
    } catch (err) {
      alert(`Não deu pra salvar: ${(err as Error).message ?? err}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Pix ou despesa avulsa">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as "Pix" | "Outro")}
          className="rounded-lg border border-black/10 bg-transparent px-2 py-2 text-sm dark:border-white/10"
        >
          {SINGLE_EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
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
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição"
          className="col-span-2 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min={0}
          step="0.01"
          placeholder="R$ 0,00"
          className="col-span-2 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
        />
        <label className="col-span-2 flex items-center gap-2 text-sm text-neutral-500">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
          />
          Cobrança recorrente (assinatura tipo Netflix — cobra todo mês até você cancelar)
        </label>
        <button
          type="submit"
          disabled={saving}
          className="col-span-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:hover:shadow-none"
        >
          Salvar
        </button>
      </form>
    </Card>
  );
}

function CardPurchaseForm({
  month,
  profiles,
  createdBy,
  onSaved,
}: {
  month: string;
  profiles: Profile[];
  createdBy: string;
  onSaved: () => void;
}) {
  const [description, setDescription] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [installments, setInstallments] = useState("1");
  const [personId, setPersonId] = useState(profiles[0]?.id ?? "");
  const [purchaseDate, setPurchaseDate] = useState(`${month}-01`);
  const [recurring, setRecurring] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profiles.some((p) => p.id === personId)) {
      setPersonId(profiles[0]?.id ?? "");
    }
  }, [profiles, personId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountValue = Number(installmentAmount);
    const installmentsValue = Number(installments);
    if (
      !description.trim() ||
      !installmentAmount ||
      Number.isNaN(amountValue) ||
      !personId ||
      !purchaseDate ||
      (!recurring && (!installmentsValue || installmentsValue < 1))
    )
      return;

    setSaving(true);
    try {
      if (recurring) {
        await addRecurringExpense({
          category: "Cartão",
          description: description.trim(),
          amount: amountValue,
          // Cartão fecha na fatura do mês seguinte, não no mês da compra.
          startMonth: monthsFrom(purchaseDate.slice(0, 7), 1),
          personId,
          createdBy,
          purchaseDate,
        });
      } else {
        await addCardPurchase({
          description: description.trim(),
          installmentAmount: amountValue,
          installments: installmentsValue,
          purchaseDate,
          personId,
          createdBy,
        });
      }
      setDescription("");
      setInstallmentAmount("");
      setInstallments("1");
      setRecurring(false);
      onSaved();
    } catch (err) {
      alert(`Não deu pra salvar: ${(err as Error).message ?? err}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Compra no cartão (parcelada)">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
        <select
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
          className="col-span-2 rounded-lg border border-black/10 bg-transparent px-2 py-2 text-sm dark:border-white/10"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição da compra"
          className="col-span-2 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
        />
        <input
          value={installmentAmount}
          onChange={(e) => setInstallmentAmount(e.target.value)}
          type="number"
          min={0}
          step="0.01"
          placeholder={recurring ? "Valor cobrado por mês" : "Valor da parcela"}
          className={recurring ? "col-span-2 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10" : "rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"}
        />
        {!recurring && (
          <input
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            type="number"
            min={1}
            placeholder="Nº de parcelas"
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
          />
        )}
        <label className="col-span-2 flex items-center gap-2 text-sm text-neutral-500">
          {recurring ? "Cobrado desde" : "Comprado em"}
          <input
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            type="date"
            className="rounded-lg border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/10"
          />
        </label>
        <label className="col-span-2 flex items-center gap-2 text-sm text-neutral-500">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
          />
          Cobrança recorrente (assinatura tipo Claude AI, Netflix — cobra
          todo mês no cartão até você cancelar)
        </label>
        <button
          type="submit"
          disabled={saving}
          className="col-span-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:hover:shadow-none"
        >
          {recurring ? "Salvar assinatura" : "Salvar parcelas"}
        </button>
      </form>
    </Card>
  );
}
