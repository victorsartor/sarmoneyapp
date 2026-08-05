import type { ApartmentShare, Expense, Profile } from "../types";

interface PersonSummary {
  profile: Profile;
  percentual: number;
  apartmentShare: number;
  individual: number;
  total: number;
}

export interface MonthSummary {
  apartmentTotal: number;
  total: number;
  perPerson: PersonSummary[];
}

// Percentual que vale no mês pedido: a mudança mais recente registrada
// até ali. Antes da primeira mudança, vale a divisão original do perfil.
export function percentuaisForMonth(
  profiles: Profile[],
  shares: ApartmentShare[],
  month: string,
): Record<string, number> {
  const latest = new Map<string, ApartmentShare>();

  for (const share of shares) {
    if (share.month > month) continue;
    const current = latest.get(share.personId);
    if (!current || share.month > current.month) latest.set(share.personId, share);
  }

  return Object.fromEntries(
    profiles.map((p) => [p.id, latest.get(p.id)?.percentual ?? p.percentual]),
  );
}

export function computeMonthSummary(
  profiles: Profile[],
  expenses: Expense[],
  percentuais: Record<string, number>,
): MonthSummary {
  const apartmentTotal = expenses
    .filter((e) => e.category === "Aluguel/Condomínio")
    .reduce((sum, e) => sum + e.amount, 0);

  const perPerson = profiles.map((profile) => {
    const individual = expenses
      .filter((e) => e.personId === profile.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const percentual = percentuais[profile.id] ?? profile.percentual;
    const apartmentShare = (apartmentTotal * percentual) / 100;

    return {
      profile,
      percentual,
      apartmentShare,
      individual,
      total: apartmentShare + individual,
    };
  });

  const total = perPerson.reduce((sum, p) => sum + p.total, 0);

  return { apartmentTotal, total, perPerson };
}
