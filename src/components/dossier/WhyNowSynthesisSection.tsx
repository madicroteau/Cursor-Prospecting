import { ClaimBadge, ConfidenceBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import {
  SourceLink,
  UnavailableState,
} from "@/components/dossier/UnavailableState";
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
      title="Why Now"
      icon="cursor"
      accent="violet"
    >
      <p className="mb-4 text-sm text-text-secondary">
        Strongest evidence-supported triggers synthesized from hiring,
        technology, initiatives, leadership, and news. Generic sales reasons
        are omitted.
      </p>

      {signals.length === 0 ? (
        <UnavailableState
          title="No Why Now triggers yet"
          message="This page synthesizes other dossier pages. It stays empty until live research produces evidence-backed timing signals."
        />
      ) : (
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
                <span className="text-xs text-text-muted">#{index + 1}</span>
                <ClaimBadge type={signal.claimType} />
                <ConfidenceBadge level={signal.confidence} />
              </div>
              <h3 className="font-medium text-white">
                {formatHeadline(signal.trigger, { companyName })}
              </h3>
              <Meta
                label="Evidence"
                value={formatDisplayText(signal.evidence, { companyName })}
              />
              <Meta
                label="Why it matters"
                value={formatDisplayText(signal.whyItMatters, { companyName })}
              />
              <Meta
                label="Relevant persona"
                value={formatJobTitle(signal.relevantPersona, { companyName })}
              />
              <Meta
                label="Potential Cursor conversation"
                value={formatDisplayText(signal.cursorRelevance, {
                  companyName,
                })}
              />
              <Meta
                label="Discovery question"
                value={formatDisplayText(signal.discoveryQuestion, {
                  companyName,
                  ensurePunctuation: false,
                })}
              />
              <SourceLink
                href={signal.sourceUrl}
                label={formatHeadline(signal.source, { companyName })}
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
