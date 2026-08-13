import { ClaimBadge, ConfidenceBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import {
  SourceLink,
  UnavailableState,
} from "@/components/dossier/UnavailableState";
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
  "INFLUENCER",
  "ECONOMIC / PROCUREMENT",
];

export function BuyingCommitteeSection({
  data,
  companyName,
}: {
  data: BuyingCommittee;
  companyName?: string;
}) {
  const namedPeople = data.people.filter((person) => !person.isPlaceholderName);

  return (
    <DossierSection
      id="buying-committee"
      title="Buying Committee"
      icon="people"
      accent="blue"
    >
      <p className="mb-4 text-sm text-text-secondary">
        {formatDisplayText(data.relationshipNote, { companyName })}
      </p>

      {namedPeople.length === 0 ? (
        <UnavailableState
          title="No publicly identifiable leaders yet"
          message={
            data.unavailableNote ||
            "Names appear only when Apollo or public sources support them. Roles below are empty rather than invented."
          }
        />
      ) : (
        <div className="space-y-4">
          {namedPeople.map((person) => (
            <article
              key={`${person.role}-${person.name}-${person.title}`}
              className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type={person.claimType} />
                <ConfidenceBadge level={person.confidence} />
                {person.roleInferred ? (
                  <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                    Role inferred
                  </span>
                ) : null}
              </div>
              <h3 className="font-medium text-white">
                {formatPersonName(person.name, { companyName })}
              </h3>
              <p className="text-xs text-blue-400">
                {formatJobTitle(person.title, { companyName })}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
                Likely buying committee role: {person.role}
              </p>
              <Meta
                label="Why this person matters"
                value={formatDisplayText(person.whyTheyMayCare, { companyName })}
              />
              <Meta
                label="Relevant initiative or responsibility"
                value={formatHeadline(person.relevantInitiative, {
                  companyName,
                })}
              />
              <Meta
                label="Potential Cursor conversation"
                value={formatDisplayText(person.outreachAngle, { companyName })}
              />
              <Meta
                label="Evidence"
                value={formatDisplayText(person.evidence, { companyName })}
              />
              <SourceLink
                href={person.sourceUrl}
                label={
                  person.sourceTitle ||
                  formatHeadline(person.sourceUrl, { companyName })
                }
              />
            </article>
          ))}
        </div>
      )}

      {data.unfilledRoles.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Roles without a named person
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {ROLE_ORDER.filter((role) =>
              data.unfilledRoles.some((item) => item.role === role),
            ).map((role) => {
              const item = data.unfilledRoles.find((entry) => entry.role === role);
              return (
                <li
                  key={role}
                  className="rounded-lg border border-border/80 bg-surface-elevated/40 p-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-blue-300">
                    {role}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{item?.note}</p>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
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
