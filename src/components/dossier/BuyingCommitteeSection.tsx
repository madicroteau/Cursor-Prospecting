import { ClaimBadge, ConfidenceBadge, SampleBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import type { BuyingCommitteeRole } from "@/lib/claim-types";
import type { BuyingCommittee } from "@/lib/experimental-intelligence";

const ROLE_ORDER: BuyingCommitteeRole[] = [
  "EXECUTIVE SPONSOR",
  "TECHNICAL CHAMPION",
  "TECHNICAL EVALUATOR",
  "SECURITY / GOVERNANCE",
  "ECONOMIC / PROCUREMENT",
];

export function BuyingCommitteeSection({ data }: { data: BuyingCommittee }) {
  return (
    <DossierSection
      id="buying-committee"
      title="Buying Committee Map"
      icon="people"
      accent="blue"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {data.isSample ? <SampleBadge /> : null}
        <span className="text-xs text-text-muted">{data.relationshipNote}</span>
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
                      <p className="text-sm font-medium text-white">{person.name}</p>
                      <p className="mt-0.5 text-[11px] text-blue-400">
                        {person.title}
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
              {person.isPlaceholderName ? <SampleBadge label="NAME NOT CONFIRMED" /> : null}
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                {person.relationshipStatus}
              </span>
            </div>
            <h4 className="font-medium text-white">
              {person.name}{" "}
              <span className="font-normal text-text-muted">— {person.title}</span>
            </h4>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
              {person.role}
            </p>
            <Meta label="Relevant initiative" value={person.relevantInitiative} />
            <Meta label="Potential priority" value={person.potentialPriority} />
            <Meta label="Why they may care" value={person.whyTheyMayCare} />
            <Meta label="Reason to contact" value={person.reasonToContact} />
            <Meta label="Recommended outreach angle" value={person.outreachAngle} />
            <Meta label="Evidence" value={person.evidence} />
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
                #{index + 1} {person.name}
              </p>
              <p className="mt-0.5 text-xs text-blue-400">
                {person.title} · {person.role}
              </p>
              <div className="mt-3 space-y-1.5">
                <Meta label="Why ranked highly" value={person.rankReason} />
                <Meta label="Related account signal" value={person.relatedSignal} />
                <Meta label="Potential Cursor angle" value={person.cursorAngle} />
                <Meta
                  label="Recommended first conversation topic"
                  value={person.firstConversationTopic}
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
