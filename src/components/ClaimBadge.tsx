import type { ClaimType, Confidence } from "@/lib/claim-types";

const CLAIM_STYLES: Record<ClaimType, string> = {
  FACT: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  INFERENCE: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  SALES_HYPOTHESIS: "border-sky-500/30 bg-sky-500/10 text-sky-200",
};

const CLAIM_LABELS: Record<ClaimType, string> = {
  FACT: "FACT",
  INFERENCE: "INFERENCE",
  SALES_HYPOTHESIS: "SALES HYPOTHESIS",
};

export function ClaimBadge({ type }: { type: ClaimType }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${CLAIM_STYLES[type]}`}
    >
      {CLAIM_LABELS[type]}
    </span>
  );
}

export function ConfidenceBadge({ level }: { level: Confidence }) {
  return (
    <span className="inline-flex rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
      Confidence: {level}
    </span>
  );
}

export function SampleBadge({ label = "SAMPLE / MOCK" }: { label?: string }) {
  return (
    <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-200">
      {label}
    </span>
  );
}
