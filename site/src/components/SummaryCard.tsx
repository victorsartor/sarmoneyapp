import type { MonthSummary } from "../lib/summary";
import { formatCurrency } from "../lib/format";

interface Props {
  summary: MonthSummary;
}

export function SummaryCard({ summary }: Props) {
  return (
    <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Resumo do mês
      </h2>

      <p className="mb-4 text-3xl font-semibold tabular-nums">
        {formatCurrency(summary.total)}
      </p>

      {summary.perPerson.length === 0 ? (
        <p className="text-sm text-neutral-400">Nenhum perfil cadastrado.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {summary.perPerson.map(({ profile, apartmentShare, individual, total }) => (
            <li key={profile.id} className="text-sm">
              <div className="flex items-center justify-between font-medium">
                <span>
                  {profile.name}{" "}
                  <span className="text-neutral-400">
                    ({profile.percentual}% do apto)
                  </span>
                </span>
                <span className="tabular-nums">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-400">
                <span>
                  Apto {formatCurrency(apartmentShare)} · Individual{" "}
                  {formatCurrency(individual)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
