import { SampleBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import type { ResearchGap } from "@/lib/experimental-intelligence";
import {
  formatDisplayText,
  formatHeadline,
  formatJobTitle,
} from "@/lib/text-format";

export function ResearchGapsSection({
  gaps,
  companyName,
}: {
  gaps: ResearchGap[];
  companyName?: string;
}) {
  return (
    <DossierSection
      id="research-gaps"
      title="What We Still Need to Know"
      icon="talk"
      accent="violet"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SampleBadge />
        <span className="text-xs text-text-muted">
          Public research is incomplete by design — use this in discovery
        </span>
      </div>

      <div className="space-y-4">
        {gaps.map((gap) => (
          <article
            key={gap.whatWeDontKnow}
            className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
          >
            <h3 className="font-medium text-white">
              {formatHeadline(gap.whatWeDontKnow, { companyName })}
            </h3>
            <Meta
              label="Current evidence"
              value={formatDisplayText(gap.currentEvidence, { companyName })}
            />
            <Meta
              label="Why it matters"
              value={formatDisplayText(gap.whyItMatters, { companyName })}
            />
            <Meta
              label="Who to ask"
              value={formatJobTitle(gap.whoToAsk, { companyName })}
            />
            <Meta
              label="Suggested discovery question"
              value={formatDisplayText(gap.discoveryQuestion, {
                companyName,
                ensurePunctuation: false,
              })}
            />
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
