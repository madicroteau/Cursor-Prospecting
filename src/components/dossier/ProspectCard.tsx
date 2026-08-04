import type { ProspectTarget } from "@/lib/mock-data";

interface ProspectCardProps {
  prospect: ProspectTarget;
}

export function ProspectCard({ prospect }: ProspectCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated/80 p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{prospect.name}</p>
          <p className="mt-0.5 text-xs font-medium text-blue-400">
            {prospect.title}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Target
        </span>
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">
        {prospect.relevance}
      </p>
    </div>
  );
}
