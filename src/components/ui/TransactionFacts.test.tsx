import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TransactionFacts } from "./TransactionFacts";

describe("TransactionFacts — first-column label", () => {
  it("labels the first column « Frais » by default", () => {
    render(<TransactionFacts fee="Gratuit" delay="Instantané" />);
    expect(screen.getByText("Frais")).toBeInTheDocument();
  });

  it("uses `feeLabel` so a principal is never presented under « Frais »", () => {
    // Régression : les écrans carte passent le montant crédité/retiré (le
    // PRINCIPAL en jeu) dans la première colonne. Sous l'étiquette « Frais »,
    // « 50.00 USD » se lisait comme des frais — mensonge sur un flux d'argent.
    render(
      <TransactionFacts
        feeLabel="Crédité sur la carte"
        fee="50.00 USD"
        delay="Instantané"
      />,
    );
    expect(screen.getByText("Crédité sur la carte")).toBeInTheDocument();
    expect(screen.queryByText("Frais")).not.toBeInTheDocument();
  });
});
