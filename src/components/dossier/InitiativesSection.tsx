import { ClaimBadge, ConfidenceBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import {
  SourceLink,
  UnavailableState,
} from "@/components/dossier/UnavailableState";
import type { StrategicInitiative } from "@/lib/experimental-intelligence";
import {
  formatDisplayText,
  formatHeadline,
  formatPersonName,
} from "@/lib/text-format";

export function InitiativesSection({
  initiatives,
  companyName,
  unavailableNote,
}: {
  initiatives: StrategicInitiative[];
  companyName?: string;
  unavailableNote?: string;
}) {
  return (
    <DossierSection
      id="initiatives"
      title="Initiatives"
      icon="activity"
      accent="violet"
    >
      <p className="mb-4 text-sm text-text-secondary">
        Publicly supported strategic themes with a plausible technology
        implication. Cursor relevance is shown only when there is a legitimate
        connection.
      </p>

      {initiatives.length === 0 ? (
        <UnavailableState
          title="No sourced initiatives yet"
          message={
            unavailableNote ||
            "Live research did not return enough public initiative evidence. Nothing is invented here."
          }
        />
      ) : (
        <div className="space-y-4">
          {initiatives.map((item) => (
            <article
              key={`${item.initiative}-${item.sourceUrl}`}
              className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type={item.claimType} />
                <ConfidenceBadge level={item.confidence} />
              </div>
              <h3 className="font-medium text-white">
                {formatHeadline(item.initiative, { companyName })}
              </h3>
              <Meta
                label="What is happening"
                value={formatDisplayText(item.whatIsHappening, { companyName })}
              />
              <Meta label="Date / timeframe" value={item.timeframe} />
              {item.executiveInvolved ? (
                <Meta
                  label="Executive involved"
                  value={formatPersonName(item.executiveInvolved, {
                    companyName,
                  })}
                />
              ) : (
                <Meta
                  label="Executive involved"
                  value="Not clearly named in the source reviewed"
                />
              )}
              <Meta
                label="Evidence"
                value={formatDisplayText(item.evidence, { companyName })}
              />
              <Meta
                label="Technology implication"
                value={formatDisplayText(item.technologyImplication, {
                  companyName,
                })}
              />
              {item.cursorRelevance ? (
                <Meta
                  label="Potential Cursor relevance"
                  value={formatDisplayText(item.cursorRelevance, {
                    companyName,
                  })}
                />
              ) : (
                <p className="text-xs text-text-muted">
                  No forced Cursor connection — this initiative does not clearly
                  imply developer-tooling demand from the evidence reviewed.
                </p>
              )}
              <SourceLink
                href={item.sourceUrl}
                label={formatHeadline(item.sourceTitle, { companyName })}
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
