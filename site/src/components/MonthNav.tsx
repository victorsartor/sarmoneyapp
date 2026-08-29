import { monthsFrom } from "../lib/data";
import { monthLabel } from "../lib/format";

interface Props {
  month: string;
  onChange: (month: string) => void;
}

// O mês atual já vem selecionado pelo App; aqui só andamos um pra
// frente ou um pra trás, sem abrir lista de meses.
export function MonthNav({ month, onChange }: Props) {
  return (
    <div className="flex items-center rounded-lg border border-black/10 dark:border-white/10">
      <button
        type="button"
        onClick={() => onChange(monthsFrom(month, -1))}
        aria-label="Mês anterior"
        className="rounded-l-lg px-3 py-2 text-lg leading-none text-neutral-500 transition-colors duration-150 hover:bg-black/5 hover:text-neutral-900 dark:hover:bg-white/10 dark:hover:text-white"
      >
        ‹
      </button>
      <span className="min-w-32 select-none text-center text-sm font-medium">
        {monthLabel(month)}
      </span>
      <button
        type="button"
        onClick={() => onChange(monthsFrom(month, 1))}
        aria-label="Próximo mês"
        className="rounded-r-lg px-3 py-2 text-lg leading-none text-neutral-500 transition-colors duration-150 hover:bg-black/5 hover:text-neutral-900 dark:hover:bg-white/10 dark:hover:text-white"
      >
        ›
      </button>
    </div>
  );
}
