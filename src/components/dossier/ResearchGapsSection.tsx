import { SampleBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import type { ResearchGap } from "@/lib/experimental-intelligence";

export function ResearchGapsSection({ gaps }: { gaps: ResearchGap[] }) {
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
            <h3 className="font-medium text-white">{gap.whatWeDontKnow}</h3>
            <Meta label="Current evidence" value={gap.currentEvidence} />
            <Meta label="Why it matters" value={gap.whyItMatters} />
            <Meta label="Who to ask" value={gap.whoToAsk} />
            <Meta
              label="Suggested discovery question"
              value={gap.discoveryQuestion}
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
