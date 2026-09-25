import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addShoppingItem,
  clearBoughtShoppingItems,
  fetchShoppingItems,
  removeShoppingItem,
  resetShoppingItems,
  setShoppingItemDone,
} from "../lib/data";
import { Spinner } from "./Spinner";
import { SHOPPING_KINDS, type ShoppingItem, type ShoppingKind } from "../types";

interface Props {
  createdBy: string;
}

// Texto do campo por aba, pra ficar claro onde o item vai cair.
const PLACEHOLDER: Record<ShoppingKind, string> = {
  comida: "O que falta de comida?",
  limpeza: "O que falta de limpeza ou higiene?",
};

const VAZIO: Record<ShoppingKind, string> = {
  comida: "Nenhuma comida anotada. Escreva aí em cima o que falta.",
  limpeza: "Nada de limpeza ou higiene anotado ainda.",
};

export function ShoppingList({ createdBy }: Props) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [kind, setKind] = useState<ShoppingKind>("comida");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchShoppingItems());
    } catch (err) {
      setError((err as Error).message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Só a aba aberta aparece. Faltando primeiro, comprados no fim — dentro
  // de cada grupo, ordem alfabética, que é como a gente lê a lista no
  // mercado.
  const sorted = useMemo(
    () =>
      items
        .filter((i) => i.kind === kind)
        .sort(
          (a, b) =>
            Number(a.done) - Number(b.done) ||
            a.description.localeCompare(b.description, "pt-BR", {
              sensitivity: "base",
            }),
        ),
    [items, kind],
  );

  // Quantos faltam em cada aba, pra enxergar a outra sem trocar de aba.
  const pendentes = useMemo(() => {
    const conta: Record<ShoppingKind, number> = { comida: 0, limpeza: 0 };
    for (const item of items) if (!item.done) conta[item.kind] += 1;
    return conta;
  }, [items]);

  const boughtCount = sorted.filter((i) => i.done).length;
  // Feira terminada: tudo que está na aba já foi marcado.
  const allDone = sorted.length > 0 && boughtCount === sorted.length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const text = description.trim();
    if (!text || saving) return;

    setSaving(true);
    try {
      await addShoppingItem({ description: text, kind, createdBy });
      setDescription("");
      await load();
    } catch (err) {
      alert(`Não deu pra adicionar: ${(err as Error).message ?? err}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item: ShoppingItem) {
    // Marca na hora pra não travar o dedo esperando o banco; se der
    // erro a lista recarrega e volta pro estado real.
    const done = !item.done;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, done } : i)),
    );
    try {
      await setShoppingItemDone(item.id, done);
    } catch (err) {
      alert(`Não deu pra marcar: ${(err as Error).message ?? err}`);
      load();
    }
  }

  async function handleRemove(item: ShoppingItem) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      await removeShoppingItem(item.id);
    } catch (err) {
      alert(`Não deu pra remover: ${(err as Error).message ?? err}`);
      load();
    }
  }

  async function handleReset() {
    // Desmarca na hora, igual ao toque num item: reiniciar não apaga
    // nada, então não vale travar a tela esperando o banco responder.
    setItems((prev) =>
      prev.map((i) => (i.kind === kind ? { ...i, done: false } : i)),
    );
    try {
      await resetShoppingItems(kind);
    } catch (err) {
      alert(`Não deu pra reiniciar: ${(err as Error).message ?? err}`);
      load();
    }
  }

  async function handleClearBought() {
    if (!confirm(`Tirar da lista os ${boughtCount} itens já comprados?`)) return;

    try {
      await clearBoughtShoppingItems(kind);
      await load();
    } catch (err) {
      alert(`Não deu pra limpar: ${(err as Error).message ?? err}`);
    }
  }

  return (
    <section className="animate-fade-rise rounded-xl border border-black/10 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-white/10 dark:bg-neutral-900">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Lista de compras
      </h2>

      {/* Largura natural em vez de dividir a linha: em 375px "Limpeza e
          higiene" não cabe numa metade e sairia cortado. */}
      <nav className="mb-4 inline-flex gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/10">
        {SHOPPING_KINDS.map((opcao) => (
          <button
            key={opcao.value}
            type="button"
            onClick={() => setKind(opcao.value)}
            aria-pressed={kind === opcao.value}
            className={
              "whitespace-nowrap rounded-md px-3 py-2 text-sm transition-all duration-200 active:scale-95 " +
              (kind === opcao.value
                ? "bg-white font-medium shadow-sm dark:bg-neutral-800"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white")
            }
          >
            {opcao.label}
            {pendentes[opcao.value] > 0 && (
              <span className="ml-1.5 text-xs text-neutral-400">
                {pendentes[opcao.value]}
              </span>
            )}
          </button>
        ))}
      </nav>

      {allDone && (
        <div className="animate-fade-rise mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/10 p-3">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Tudo comprado nessa aba.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-all duration-150 hover:bg-emerald-700 hover:shadow-md active:scale-95"
          >
            Reiniciar a lista
          </button>
        </div>
      )}

      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={PLACEHOLDER[kind]}
          className="min-w-0 flex-1 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
        />
        <button
          type="submit"
          disabled={saving || !description.trim()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-emerald-700 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:hover:shadow-none"
        >
          Adicionar
        </button>
      </form>

      {error && (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          Não deu pra carregar a lista: {error}{" "}
          <button
            onClick={load}
            className="font-medium underline hover:no-underline"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <Spinner className="h-6 w-6 text-neutral-400" />
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-neutral-400">{VAZIO[kind]}</p>
      ) : (
        <ul className="stagger flex flex-col divide-y divide-black/5 dark:divide-white/10">
          {sorted.map((item) => (
            <li
              key={item.id}
              className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-1">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => handleToggle(item)}
                  className="h-4 w-4 shrink-0 accent-emerald-600"
                />
                <span
                  className={
                    "min-w-0 truncate " +
                    (item.done ? "text-neutral-400 line-through" : "")
                  }
                >
                  {item.description}
                </span>
              </label>
              <button
                onClick={() => handleRemove(item)}
                className="rounded-lg p-2 text-neutral-400 transition-all duration-150 hover:scale-110 hover:bg-red-500/10 hover:text-red-500 active:scale-95"
                aria-label={`Remover ${item.description}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {boughtCount > 0 && (
        <button
          type="button"
          onClick={handleClearBought}
          className="mt-3 text-xs text-neutral-400 transition-colors duration-150 hover:text-red-500"
        >
          Limpar os {boughtCount} já comprados
        </button>
      )}
    </section>
  );
}
