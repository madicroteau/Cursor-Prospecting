import type { ClaimType } from "@/lib/dossier-types";

const LABELS: Record<ClaimType, string> = {
  FACT: "FACT",
  INFERENCE: "INFERENCE",
  SALES_HYPOTHESIS: "SALES HYPOTHESIS",
};

const STYLES: Record<ClaimType, string> = {
  FACT: "bg-accent-soft text-accent",
  INFERENCE: "bg-amber-100 text-amber-900",
  SALES_HYPOTHESIS: "bg-sky-100 text-sky-900",
};

export default function ClaimBadge({ type }: { type: ClaimType }) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-[11px] font-bold tracking-wide ${STYLES[type]}`}
    >
      {LABELS[type]}
    </span>
  );
}
