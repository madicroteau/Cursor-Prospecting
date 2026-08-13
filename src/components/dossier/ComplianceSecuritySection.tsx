import {
  ClaimBadge,
  ConfidenceBadge,
  SampleBadge,
} from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import type { ComplianceSecurityIntelligence } from "@/lib/compliance-security";
import {
  formatDisplayText,
  formatHeadline,
  formatJobTitle,
} from "@/lib/text-format";

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm leading-relaxed text-text-secondary">
      <span className="font-medium text-text-muted">{label}: </span>
      {value}
    </p>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
      {children}
    </span>
  );
}

export function ComplianceSecuritySection({
  data,
  companyName,
}: {
  data: ComplianceSecurityIntelligence;
  companyName?: string;
}) {
  return (
    <div className="space-y-6">
      <DossierSection
        id="compliance-overview"
        title="Compliance & Security"
        icon="tech"
        accent="amber"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {data.isSample ? <SampleBadge /> : null}
          <span className="text-xs text-text-muted">
            Sales intelligence only — not legal advice
          </span>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">
          {formatDisplayText(data.disclaimer, { companyName })}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          {formatDisplayText(data.accountContextSummary, { companyName })}
        </p>
      </DossierSection>

      <DossierSection
        id="applicable-regulations"
        title="Applicable Regulations"
        icon="sources"
        accent="amber"
      >
        <p className="mb-4 text-xs text-text-muted">
          Not every regulation is marked applicable. Applicability is inferred
          from account characteristics and must be validated.
        </p>
        <div className="space-y-4">
          {data.applicableRegulations.map((item) => (
            <article
              key={item.regulation}
              className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type={item.claimType} />
                <ConfidenceBadge level={item.confidence} />
                <Pill>{item.classification}</Pill>
                <Pill>{item.applicability}</Pill>
              </div>
              <h3 className="font-medium text-white">
                {formatHeadline(item.regulation, { companyName })}
              </h3>
              <Meta
                label="Regulatory authority"
                value={formatHeadline(item.regulatoryAuthority, { companyName })}
              />
              <Meta
                label="Why it may apply"
                value={formatDisplayText(item.whyItMayApply, { companyName })}
              />
              <Meta label="Effective date" value={item.effectiveDate} />
              <Meta label="Most recent update" value={item.mostRecentUpdate} />
              <Meta
                label="Evidence"
                value={formatDisplayText(item.evidence, { companyName })}
              />
              <a
                href={item.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block break-all text-xs text-blue-400 hover:text-blue-300"
              >
                {formatHeadline(item.officialSourceTitle, { companyName })}
              </a>
            </article>
          ))}
        </div>
      </DossierSection>

      <DossierSection
        id="security-guidance"
        title="Security Guidance"
        icon="tech"
        accent="blue"
      >
        <p className="mb-4 text-xs text-text-muted">
          Voluntary frameworks and guidance — clearly distinct from mandatory
          regulation.
        </p>
        <div className="space-y-4">
          {data.securityGuidance.map((item) => (
            <article
              key={item.framework}
              className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type={item.claimType} />
                <ConfidenceBadge level={item.confidence} />
                <Pill>{item.mandatoryOrVoluntary}</Pill>
              </div>
              <h3 className="font-medium text-white">
                {formatHeadline(item.framework, { companyName })}
              </h3>
              <Meta
                label="Issuing authority"
                value={formatHeadline(item.issuingAuthority, { companyName })}
              />
              <Meta
                label="Relevant security areas"
                value={item.relevantSecurityAreas.join(" · ")}
              />
              <Meta
                label="Why it may matter"
                value={formatDisplayText(item.whyItMayMatter, { companyName })}
              />
              <Meta label="Last updated" value={item.lastUpdated} />
              <a
                href={item.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block break-all text-xs text-blue-400 hover:text-blue-300"
              >
                {formatHeadline(item.officialSourceTitle, { companyName })}
              </a>
            </article>
          ))}
        </div>
      </DossierSection>

      <DossierSection
        id="penalties-consequences"
        title="Penalties & Consequences"
        icon="signals"
        accent="violet"
      >
        <p className="mb-4 text-xs text-text-muted">
          Never invent penalty amounts. Unverified amounts show as CURRENT
          PENALTY NOT VERIFIED.
        </p>
        <div className="space-y-4">
          {data.penalties.map((item) => (
            <article
              key={`${item.requirement}-${item.category}`}
              className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type={item.claimType} />
                <ConfidenceBadge level={item.confidence} />
                <Pill>{item.amountCategory}</Pill>
              </div>
              <h3 className="font-medium text-white">
                {formatHeadline(item.requirement, { companyName })}
              </h3>
              <Meta label="Category" value={item.category} />
              <Meta
                label="Amount or range"
                value={item.amountOrRange}
              />
              <Meta
                label="Authority"
                value={formatHeadline(item.authority, { companyName })}
              />
              <Meta
                label="Effective year / date"
                value={item.effectiveYearOrDate}
              />
              <Meta
                label="Notes"
                value={formatDisplayText(item.notes, { companyName })}
              />
              <a
                href={item.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block break-all text-xs text-blue-400 hover:text-blue-300"
              >
                {formatHeadline(item.officialSourceTitle, { companyName })}
              </a>
            </article>
          ))}
        </div>
      </DossierSection>

      <DossierSection
        id="latest-regulatory-changes"
        title="Latest Regulatory & Security Changes"
        icon="activity"
        accent="emerald"
      >
        <div className="space-y-4">
          {data.latestChanges.map((item, index) => (
            <article
              key={`${item.whatChanged.slice(0, 48)}-${index}`}
              className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type={item.claimType} />
                <ConfidenceBadge level={item.confidence} />
                <Pill>{item.status}</Pill>
              </div>
              <h3 className="font-medium text-white">
                {formatHeadline(item.whatChanged, { companyName })}
              </h3>
              <Meta label="Date" value={item.date} />
              <Meta
                label="Issuing authority"
                value={formatHeadline(item.issuingAuthority, { companyName })}
              />
              <Meta
                label="Who may be affected"
                value={formatDisplayText(item.whoMayBeAffected, { companyName })}
              />
              <Meta
                label="Potential account impact"
                value={formatDisplayText(item.potentialAccountImpact, {
                  companyName,
                })}
              />
              <a
                href={item.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block break-all text-xs text-blue-400 hover:text-blue-300"
              >
                {formatHeadline(item.officialSourceTitle, { companyName })}
              </a>
            </article>
          ))}
        </div>
      </DossierSection>

      <DossierSection
        id="account-impact-sales"
        title="Account Impact / Sales Intelligence"
        icon="cursor"
        accent="violet"
      >
        <p className="mb-4 text-xs text-text-muted">
          Implications are hypotheses for discovery — not proof the account has
          a current control gap.
        </p>
        <div className="space-y-4">
          {data.accountImpact.map((item) => (
            <article
              key={`${item.requirement}-${item.controlArea}`}
              className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type={item.claimType} />
                <ConfidenceBadge level={item.confidence} />
                <Pill>{item.controlArea}</Pill>
                {item.requiresProductValidation ? (
                  <Pill>Requires product validation</Pill>
                ) : null}
              </div>
              <h3 className="font-medium text-white">
                {formatHeadline(item.requirement, { companyName })}
              </h3>
              <Meta
                label="Account implication"
                value={formatDisplayText(item.accountImplication, {
                  companyName,
                })}
              />
              <Meta
                label="Potential Cursor conversation"
                value={formatDisplayText(item.potentialCursorConversation, {
                  companyName,
                })}
              />
              <Meta
                label="Target persona"
                value={formatJobTitle(item.targetPersona, { companyName })}
              />
              <Meta
                label="Discovery question"
                value={formatDisplayText(item.discoveryQuestion, {
                  companyName,
                  ensurePunctuation: false,
                })}
              />
            </article>
          ))}
        </div>
      </DossierSection>

      <DossierSection
        id="cursor-relevance"
        title="Potential Cursor Relevance"
        icon="cursor"
        accent="blue"
      >
        <p className="mb-4 text-xs text-text-muted">
          Cursor does not make a customer compliant. Capability claims require
          product validation.
        </p>
        <div className="space-y-4">
          {data.cursorRelevance.map((item) => (
            <article
              key={item.topic}
              className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type={item.claimType} />
                <ConfidenceBadge level={item.confidence} />
                {item.requiresProductValidation ? (
                  <Pill>Requires product validation</Pill>
                ) : null}
              </div>
              <h3 className="font-medium text-white">
                {formatHeadline(item.topic, { companyName })}
              </h3>
              <Meta
                label="Why it may matter"
                value={formatDisplayText(item.whyItMayMatter, { companyName })}
              />
              <Meta
                label="Enterprise AI angle"
                value={formatDisplayText(item.enterpriseAiAngle, {
                  companyName,
                })}
              />
            </article>
          ))}
        </div>
      </DossierSection>

      <DossierSection
        id="compliance-why-now-triggers"
        title="Regulatory / Compliance Why-Now Triggers"
        icon="signals"
        accent="emerald"
      >
        <p className="mb-4 text-xs text-text-muted">
          These also compete in the existing Why Now page against hiring, AI,
          technology, and other signals — compliance is not auto-prioritized.
        </p>
        <div className="space-y-4">
          {data.whyNowTriggers.length === 0 ? (
            <p className="text-sm text-text-muted">
              No regulatory Why Now triggers generated for this account yet.
            </p>
          ) : (
            data.whyNowTriggers.map((item, index) => (
              <article
                key={`${item.trigger}-${index}`}
                className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ClaimBadge type={item.claimType} />
                  <ConfidenceBadge level={item.confidence} />
                  <Pill>{item.status}</Pill>
                </div>
                <h3 className="font-medium text-white">
                  {formatHeadline(item.trigger, { companyName })}
                </h3>
                <Meta label="Date" value={item.date} />
                <Meta
                  label="Authority"
                  value={formatHeadline(item.authority, { companyName })}
                />
                <Meta
                  label="Account relevance"
                  value={formatDisplayText(item.accountRelevance, {
                    companyName,
                  })}
                />
                <Meta
                  label="Security / technology implication"
                  value={formatDisplayText(item.securityTechImplication, {
                    companyName,
                  })}
                />
                <Meta
                  label="Potential Cursor relevance"
                  value={formatDisplayText(item.potentialCursorRelevance, {
                    companyName,
                  })}
                />
                <Meta
                  label="Target persona"
                  value={formatJobTitle(item.targetPersona, { companyName })}
                />
                <Meta
                  label="Discovery question"
                  value={formatDisplayText(item.discoveryQuestion, {
                    companyName,
                    ensurePunctuation: false,
                  })}
                />
                <a
                  href={item.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block break-all text-xs text-blue-400 hover:text-blue-300"
                >
                  {formatHeadline(item.officialSourceTitle, { companyName })}
                </a>
              </article>
            ))
          )}
        </div>
      </DossierSection>

      <DossierSection
        id="compliance-discovery-questions"
        title="Compliance Discovery Questions"
        icon="talk"
        accent="violet"
      >
        <ul className="space-y-3">
          {data.discoveryQuestions.map((question) => (
            <li
              key={question}
              className="rounded-lg border border-border/80 bg-surface-elevated/50 px-4 py-3 text-sm leading-relaxed text-text-secondary"
            >
              {formatDisplayText(question, {
                companyName,
                ensurePunctuation: false,
              })}
            </li>
          ))}
        </ul>
      </DossierSection>
    </div>
  );
}
