"use client";

import { useMemo, useState } from "react";
import { SampleBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import type { AssumptionLabel } from "@/lib/claim-types";
import type { RoiAssumptions } from "@/lib/experimental-intelligence";

type ScenarioKey = "conservative" | "expected" | "aggressive";

const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  conservative: "Conservative",
  expected: "Expected",
  aggressive: "Aggressive",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

export function RoiTcoSection({ assumptions }: { assumptions: RoiAssumptions }) {
  const [developerPopulation, setDeveloperPopulation] = useState(
    assumptions.developerPopulation,
  );
  const [potentialUsers, setPotentialUsers] = useState(
    assumptions.potentialCursorUsers,
  );
  const [avgCost, setAvgCost] = useState(assumptions.avgFullyLoadedCost);
  const [cursorCost, setCursorCost] = useState(assumptions.cursorCostPerUser);
  const [currentAiSpend, setCurrentAiSpend] = useState(
    assumptions.currentAiToolingSpend,
  );
  const [improvement, setImprovement] = useState(
    assumptions.productivityImprovementPct,
  );

  const scenarios = useMemo(() => {
    return (Object.keys(SCENARIO_LABELS) as ScenarioKey[]).map((key) => {
      const pct = improvement[key] / 100;
      const annualEngineeringSpend = developerPopulation * avgCost;
      const cursorInvestment = potentialUsers * cursorCost;
      const productivityEquivalentCapacity = potentialUsers * pct;
      const modeledBenefit = potentialUsers * avgCost * pct;
      const netBenefit = modeledBenefit - cursorInvestment;
      const roi =
        cursorInvestment > 0 ? (netBenefit / cursorInvestment) * 100 : 0;
      const paybackMonths =
        modeledBenefit > 0 ? (cursorInvestment / modeledBenefit) * 12 : null;

      return {
        key,
        label: SCENARIO_LABELS[key],
        pct: improvement[key],
        annualEngineeringSpend,
        productivityEquivalentCapacity,
        cursorInvestment,
        modeledBenefit,
        roi,
        paybackMonths,
        currentAiSpend,
      };
    });
  }, [
    avgCost,
    currentAiSpend,
    cursorCost,
    developerPopulation,
    improvement,
    potentialUsers,
  ]);

  return (
    <DossierSection
      id="roi-tco"
      title="ROI / TCO Opportunity Model"
      icon="signals"
      accent="amber"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SampleBadge label="SCENARIO MODEL — NOT VERIFIED CUSTOMER SAVINGS" />
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        This is an economic hypothesis for discovery conversations. It is not a
        claim of guaranteed customer savings.
      </p>

      <ul className="mt-3 space-y-1 text-xs text-text-muted">
        {assumptions.notes.map((note) => (
          <li key={note}>• {note}</li>
        ))}
      </ul>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <AssumptionInput
          label="Estimated developer population"
          value={developerPopulation}
          onChange={setDeveloperPopulation}
          assumptionLabel={assumptions.developerPopulationLabel}
        />
        <AssumptionInput
          label="Potential Cursor users"
          value={potentialUsers}
          onChange={setPotentialUsers}
          assumptionLabel={assumptions.potentialCursorUsersLabel}
        />
        <AssumptionInput
          label="Average fully loaded developer cost"
          value={avgCost}
          onChange={setAvgCost}
          assumptionLabel={assumptions.avgFullyLoadedCostLabel}
        />
        <AssumptionInput
          label="Cursor cost per user (annual)"
          value={cursorCost}
          onChange={setCursorCost}
          assumptionLabel={assumptions.cursorCostPerUserLabel}
        />
        <AssumptionInput
          label="Current AI developer tooling spend (annual)"
          value={currentAiSpend}
          onChange={setCurrentAiSpend}
          assumptionLabel={assumptions.currentAiToolingSpendLabel}
        />
        <div className="space-y-3 rounded-lg border border-border/80 bg-surface-elevated/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Potential productivity improvement %
          </p>
          {(Object.keys(SCENARIO_LABELS) as ScenarioKey[]).map((key) => (
            <label key={key} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-text-secondary">{SCENARIO_LABELS[key]}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={improvement[key]}
                onChange={(event) =>
                  setImprovement((prev) => ({
                    ...prev,
                    [key]: Number(event.target.value) || 0,
                  }))
                }
                className="w-24 rounded-md border border-border bg-surface px-2 py-1.5 text-right text-white outline-none focus:border-border-focus"
              />
            </label>
          ))}
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">
            INDUSTRY ASSUMPTION / USER ASSUMPTION
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <div
            key={scenario.key}
            className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
          >
            <p className="text-sm font-semibold text-amber-100">
              {scenario.label}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Productivity lift: {scenario.pct}%
            </p>
            <div className="mt-4 space-y-2 text-sm text-text-secondary">
              <Row
                label="Est. annual engineering spend"
                value={formatCurrency(scenario.annualEngineeringSpend)}
              />
              <Row
                label="Productivity-equivalent capacity"
                value={`${scenario.productivityEquivalentCapacity.toFixed(1)} FTE`}
              />
              <Row
                label="Est. Cursor investment"
                value={formatCurrency(scenario.cursorInvestment)}
              />
              <Row
                label="Modeled economic benefit"
                value={formatCurrency(scenario.modeledBenefit)}
              />
              <Row label="Potential ROI" value={formatPct(scenario.roi)} />
              <Row
                label="Potential payback"
                value={
                  scenario.paybackMonths == null
                    ? "N/A"
                    : `${scenario.paybackMonths.toFixed(1)} months`
                }
              />
              <Row
                label="Current AI tooling spend"
                value={formatCurrency(scenario.currentAiSpend)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-border/80 bg-surface-elevated/50 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          ROI discovery questions
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-text-secondary">
          <li>
            • How many software engineers / builders would be in an initial Cursor
            cohort?
          </li>
          <li>
            • What is your fully loaded cost assumption for an engineer in this
            organization?
          </li>
          <li>
            • What productivity or cycle-time improvement would make a pilot
            clearly successful?
          </li>
          <li>• What are you spending today on AI coding or adjacent tools?</li>
          <li>
            • Who would need to validate these assumptions before a business case
            is credible?
          </li>
        </ul>
      </div>
    </DossierSection>
  );
}

function AssumptionInput({
  label,
  value,
  onChange,
  assumptionLabel,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  assumptionLabel: AssumptionLabel;
}) {
  return (
    <label className="block rounded-lg border border-border/80 bg-surface-elevated/50 p-4">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-white outline-none focus:border-border-focus"
      />
      <span className="mt-2 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-200">
        {assumptionLabel}
      </span>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-text-muted">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}
