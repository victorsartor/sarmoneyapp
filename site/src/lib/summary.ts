import type { Expense, Profile } from "../types";

export interface PersonSummary {
  profile: Profile;
  apartmentShare: number;
  individual: number;
  total: number;
}

export interface MonthSummary {
  apartmentTotal: number;
  total: number;
  perPerson: PersonSummary[];
}

export function computeMonthSummary(
  profiles: Profile[],
  expenses: Expense[],
): MonthSummary {
  const apartmentTotal = expenses
    .filter((e) => e.category === "Aluguel/Condomínio")
    .reduce((sum, e) => sum + e.amount, 0);

  const perPerson = profiles.map((profile) => {
    const individual = expenses
      .filter((e) => e.personId === profile.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const apartmentShare = (apartmentTotal * profile.percentual) / 100;

    return {
      profile,
      apartmentShare,
      individual,
      total: apartmentShare + individual,
    };
  });

  const total = perPerson.reduce((sum, p) => sum + p.total, 0);

  return { apartmentTotal, total, perPerson };
}
