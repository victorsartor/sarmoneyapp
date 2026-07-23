import { useEffect, useState } from "react";
import type { Profile } from "../types";
import {
  addApartmentPurchase,
  addCardPurchase,
  addRecurringExpense,
  addSingleExpense,
} from "../lib/data";

interface Props {
  month: string;
  profiles: Profile[];
  createdBy: string;
  onSaved: () => void;
}

export function AdminForms({ month, profiles, createdBy, onSaved }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <ApartmentForm month={month} createdBy={createdBy} onSaved={onSaved} />
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
    <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900">
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
          className="col-span-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Salvar parcelas
        </button>
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
          <option value="Pix">Pix</option>
          <option value="Outro">Outro</option>
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
          className="col-span-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
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
          startMonth: purchaseDate.slice(0, 7),
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
          className="col-span-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {recurring ? "Salvar assinatura" : "Salvar parcelas"}
        </button>
      </form>
    </Card>
  );
}
