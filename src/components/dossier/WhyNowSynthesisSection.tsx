import { ClaimBadge, ConfidenceBadge, SampleBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import type { WhyNowSignal } from "@/lib/experimental-intelligence";

export function WhyNowSynthesisSection({
  signals,
}: {
  signals: WhyNowSignal[];
}) {
  return (
    <DossierSection
      id="why-now-synthesis"
      title="Why Now Synthesis"
      icon="cursor"
      accent="violet"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SampleBadge />
        <span className="text-xs text-text-muted">
          Strongest current prospecting signals, including combined evidence
        </span>
      </div>

      <div className="space-y-4">
        {signals.map((signal) => (
          <article
            key={signal.trigger}
            className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <ClaimBadge type={signal.claimType} />
              <ConfidenceBadge level={signal.confidence} />
            </div>
            <h3 className="font-medium text-white">{signal.trigger}</h3>
            <Meta label="Date" value={signal.date} />
            <Meta label="Evidence" value={signal.evidence} />
            <Meta label="Source" value={signal.source} />
            <Meta label="Relevant persona" value={signal.relevantPersona} />
            <Meta label="Why it matters" value={signal.whyItMatters} />
            <Meta
              label="Potential Cursor relevance"
              value={signal.cursorRelevance}
            />
            <Meta
              label="Discovery question"
              value={signal.discoveryQuestion}
            />
            {signal.combinedSignals && signal.combinedSignals.length > 0 ? (
              <Meta
                label="Combined evidence"
                value={signal.combinedSignals.join(" + ")}
              />
            ) : null}
            <a
              href={signal.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block break-all text-xs text-blue-400 hover:text-blue-300"
            >
              {signal.sourceUrl}
            </a>
          </article>
        ))}
      </div>
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
