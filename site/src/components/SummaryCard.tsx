import type { MonthSummary } from "../lib/summary";
import { formatCurrency } from "../lib/format";

interface Props {
  summary: MonthSummary;
}

export function SummaryCard({ summary }: Props) {
  return (
    <section className="animate-fade-rise rounded-xl border border-black/10 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-white/10 dark:bg-neutral-900">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Resumo do mês
      </h2>

      <p className="text-3xl font-semibold tabular-nums">
        {formatCurrency(summary.total)}
      </p>
      <p className="mb-4 text-xs text-neutral-400">
        Apartamento (total): {formatCurrency(summary.apartmentTotal)}
      </p>

      {summary.perPerson.length === 0 ? (
        <p className="text-sm text-neutral-400">Nenhum perfil cadastrado.</p>
      ) : (
        <ul className="stagger flex flex-col gap-1">
          {summary.perPerson.map(({ profile, percentual, apartmentShare, individual, total }) => (
            <li
              key={profile.id}
              className="-mx-2 rounded-lg px-2 py-1.5 text-sm transition-colors duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between font-medium">
                <span>{profile.name}</span>
                <span className="tabular-nums">{formatCurrency(total)}</span>
              </div>
              <div className="flex flex-col text-xs text-neutral-400">
                <span>
                  AP ({percentual}%) {formatCurrency(apartmentShare)}
                </span>
                <span>Outras despesas {formatCurrency(individual)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
