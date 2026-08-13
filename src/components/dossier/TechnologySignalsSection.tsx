import { ClaimBadge, ConfidenceBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import {
  SourceLink,
  UnavailableState,
} from "@/components/dossier/UnavailableState";
import type { TechnologySignal } from "@/lib/experimental-intelligence";
import { formatDisplayText, formatHeadline } from "@/lib/text-format";

export function TechnologySignalsSection({
  signals,
  companyName,
  unavailableNote,
}: {
  signals: TechnologySignal[];
  companyName?: string;
  unavailableNote?: string;
}) {
  return (
    <DossierSection
      id="technology"
      title="Technology"
      icon="tech"
      accent="emerald"
    >
      <p className="mb-4 text-sm text-text-secondary">
        What technology does this organization appear to use that matters to a
        Cursor sales conversation? Mentions are facts. Environment conclusions
        are inferences. Organization-wide adoption is not claimed from weak
        evidence.
      </p>

      {signals.length === 0 ? (
        <UnavailableState
          title="No technology signals yet"
          message={
            unavailableNote ||
            "Live research did not return Cursor-relevant technology evidence. This page stays empty rather than inventing a stack."
          }
        />
      ) : (
        <div className="space-y-4">
          {signals.map((signal) => (
            <article
              key={`${signal.technology}-${signal.sourceUrl}`}
              className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type={signal.claimType} />
                <ConfidenceBadge level={signal.confidence} />
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                  {signal.category}
                </span>
              </div>
              <h3 className="font-medium text-white">{signal.technology}</h3>
              <Meta
                label="Evidence"
                value={formatDisplayText(signal.evidence, { companyName })}
              />
              <Meta
                label="Why it may matter"
                value={formatDisplayText(signal.whyItMayMatter, { companyName })}
              />
              <p className="text-xs text-text-muted">
                Mention count in reviewed sources: {signal.mentionCount}
              </p>
              <SourceLink
                href={signal.sourceUrl}
                label={formatHeadline(signal.sourceTitle, { companyName })}
              />
            </article>
          ))}
        </div>
      )}
    </DossierSection>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm leading-relaxed text-text-secondary">
      <span className="font-medium text-text-muted">{label}: </span>
      {value}
    </p>
  );
}
