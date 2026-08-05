import { ClaimBadge, ConfidenceBadge, SampleBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import type { WhyNowSignal } from "@/lib/experimental-intelligence";
import {
  formatDisplayText,
  formatHeadline,
  formatJobTitle,
} from "@/lib/text-format";

export function WhyNowSynthesisSection({
  signals,
  companyName,
}: {
  signals: WhyNowSignal[];
  companyName?: string;
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
        {signals.map((signal, index) => (
          <article
            key={
              signal.sourceUrl ||
              `${signal.trigger}-${signal.date}-${index}`
            }
            className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <ClaimBadge type={signal.claimType} />
              <ConfidenceBadge level={signal.confidence} />
            </div>
            <h3 className="font-medium text-white">
              {formatHeadline(signal.trigger, { companyName })}
            </h3>
            <Meta label="Date" value={signal.date} />
            <Meta
              label="Evidence"
              value={formatDisplayText(signal.evidence, { companyName })}
            />
            <Meta
              label="Source"
              value={formatHeadline(signal.source, { companyName })}
            />
            <Meta
              label="Relevant persona"
              value={formatJobTitle(signal.relevantPersona, { companyName })}
            />
            <Meta
              label="Why it matters"
              value={formatDisplayText(signal.whyItMatters, { companyName })}
            />
            <Meta
              label="Potential Cursor relevance"
              value={formatDisplayText(signal.cursorRelevance, { companyName })}
            />
            <Meta
              label="Discovery question"
              value={formatDisplayText(signal.discoveryQuestion, {
                companyName,
                ensurePunctuation: false,
              })}
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
