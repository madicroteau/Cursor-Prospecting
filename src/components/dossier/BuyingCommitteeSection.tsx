import { ClaimBadge, ConfidenceBadge, SampleBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import type { BuyingCommitteeRole } from "@/lib/claim-types";
import type { BuyingCommittee } from "@/lib/experimental-intelligence";
import {
  formatDisplayText,
  formatHeadline,
  formatJobTitle,
  formatPersonName,
} from "@/lib/text-format";

const ROLE_ORDER: BuyingCommitteeRole[] = [
  "EXECUTIVE SPONSOR",
  "TECHNICAL CHAMPION",
  "TECHNICAL EVALUATOR",
  "SECURITY / GOVERNANCE",
  "ECONOMIC / PROCUREMENT",
];

export function BuyingCommitteeSection({
  data,
  companyName,
}: {
  data: BuyingCommittee;
  companyName?: string;
}) {
  return (
    <DossierSection
      id="buying-committee"
      title="Buying Committee Map"
      icon="people"
      accent="blue"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {data.isSample ? <SampleBadge /> : null}
        <span className="text-xs text-text-muted">
          {formatDisplayText(data.relationshipNote, { companyName })}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {ROLE_ORDER.map((role) => {
          const people = data.people.filter((person) => person.role === role);
          return (
            <div
              key={role}
              className="rounded-lg border border-border/80 bg-surface-elevated/50 p-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-300">
                {role}
              </p>
              <div className="mt-3 space-y-3">
                {people.length === 0 ? (
                  <p className="text-xs text-text-muted">No people mapped yet</p>
                ) : (
                  people.map((person) => (
                    <div
                      key={`${person.role}-${person.name}-${person.title}`}
                      className="rounded-md border border-border/70 bg-surface/70 p-2.5"
                    >
                      <p className="text-sm font-medium text-white">
                        {formatPersonName(person.name, { companyName })}
                      </p>
                      <p className="mt-0.5 text-[11px] text-blue-400">
                        {formatJobTitle(person.title, { companyName })}
                      </p>
                      <p className="mt-2 text-[10px] uppercase tracking-wide text-text-muted">
                        Relationship: {person.relationshipStatus}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          People detail
        </h3>
        {data.people.map((person) => (
          <article
            key={`${person.role}-detail-${person.name}-${person.title}`}
            className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <ClaimBadge type={person.claimType} />
              <ConfidenceBadge level={person.confidence} />
              {person.isPlaceholderName ? (
                <SampleBadge label="NAME NOT CONFIRMED" />
              ) : null}
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                {person.relationshipStatus}
              </span>
            </div>
            <h4 className="font-medium text-white">
              {formatPersonName(person.name, { companyName })}{" "}
              <span className="font-normal text-text-muted">
                — {formatJobTitle(person.title, { companyName })}
              </span>
            </h4>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
              {person.role}
            </p>
            <Meta
              label="Relevant initiative"
              value={formatHeadline(person.relevantInitiative, { companyName })}
            />
            <Meta
              label="Potential priority"
              value={formatDisplayText(person.potentialPriority, { companyName })}
            />
            <Meta
              label="Why they may care"
              value={formatDisplayText(person.whyTheyMayCare, { companyName })}
            />
            <Meta
              label="Reason to contact"
              value={formatDisplayText(person.reasonToContact, { companyName })}
            />
            <Meta
              label="Recommended outreach angle"
              value={formatDisplayText(person.outreachAngle, { companyName })}
            />
            <Meta
              label="Evidence"
              value={formatDisplayText(person.evidence, { companyName })}
            />
            <a
              href={person.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block break-all text-xs text-blue-400 hover:text-blue-300"
            >
              {person.sourceUrl}
            </a>
          </article>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Top people to prospect
        </h3>
        <ol className="mt-3 space-y-3">
          {data.topPeopleToProspect.map((person, index) => (
            <li
              key={`${person.name}-${person.title}`}
              className="rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
            >
              <p className="text-sm font-semibold text-white">
                #{index + 1} {formatPersonName(person.name, { companyName })}
              </p>
              <p className="mt-0.5 text-xs text-blue-400">
                {formatJobTitle(person.title, { companyName })} · {person.role}
              </p>
              <div className="mt-3 space-y-1.5">
                <Meta
                  label="Why ranked highly"
                  value={formatDisplayText(person.rankReason, { companyName })}
                />
                <Meta
                  label="Related account signal"
                  value={formatHeadline(person.relatedSignal, { companyName })}
                />
                <Meta
                  label="Potential Cursor angle"
                  value={formatDisplayText(person.cursorAngle, { companyName })}
                />
                <Meta
                  label="Recommended first conversation topic"
                  value={formatDisplayText(person.firstConversationTopic, {
                    companyName,
                  })}
                />
              </div>
            </li>
          ))}
        </ol>
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
