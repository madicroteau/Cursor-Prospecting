import type { ProspectTarget } from "@/lib/mock-data";
import {
  formatDisplayText,
  formatJobTitle,
  formatPersonName,
} from "@/lib/text-format";

interface ProspectCardProps {
  prospect: ProspectTarget;
  companyName?: string;
}

export function ProspectCard({ prospect, companyName }: ProspectCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated/80 p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">
            {formatPersonName(prospect.name, { companyName })}
          </p>
          <p className="mt-0.5 text-xs font-medium text-blue-400">
            {formatJobTitle(prospect.title, { companyName })}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Target
        </span>
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">
        {formatDisplayText(prospect.relevance, { companyName })}
      </p>
    </div>
  );
}
