import type { Operator } from "@/lib/api/types";

/**
 * Presentation metadata for operator countries — names and dialling codes for
 * the ISO-3166 alpha-2 codes the API returns on each operator. This is display
 * chrome, not financial data: the operators themselves (which exist, what they
 * support) always come from GET /api/operators.
 */
const COUNTRY_META: Record<string, { name: string; dial: string }> = {
  BJ: { name: "Bénin", dial: "+229" },
  BF: { name: "Burkina Faso", dial: "+226" },
  CI: { name: "Côte d'Ivoire", dial: "+225" },
  ML: { name: "Mali", dial: "+223" },
  SN: { name: "Sénégal", dial: "+221" },
  TG: { name: "Togo", dial: "+228" },
  NE: { name: "Niger", dial: "+227" },
  GW: { name: "Guinée-Bissau", dial: "+245" },
};

export function countryName(code: string): string {
  return COUNTRY_META[code]?.name ?? code;
}

export function countryDial(code: string): string | undefined {
  return COUNTRY_META[code]?.dial;
}

/** A country grouping of operators, for the two-step country → operator pick. */
export interface OperatorCountry {
  code: string;
  name: string;
  dial?: string;
  operators: Operator[];
}

/**
 * Group a flat operator list by country, sorted by localized country name, each
 * group's operators sorted by name. Drives the country/operator wizard steps
 * entirely from real data.
 */
export function groupOperatorsByCountry(
  operators: Operator[],
): OperatorCountry[] {
  const byCountry = new Map<string, Operator[]>();
  for (const operator of operators) {
    const list = byCountry.get(operator.country) ?? [];
    list.push(operator);
    byCountry.set(operator.country, list);
  }

  return Array.from(byCountry.entries())
    .map(([code, list]) => ({
      code,
      name: countryName(code),
      dial: countryDial(code),
      operators: [...list].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
