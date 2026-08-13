import { ClaimBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import { UnavailableState } from "@/components/dossier/UnavailableState";
import type { ProspectingPlanExpanded } from "@/lib/experimental-intelligence";
import {
  formatDisplayText,
  formatHeadline,
  formatJobTitle,
} from "@/lib/text-format";

export function ProspectingPlanSection({
  plan,
  companyName,
}: {
  plan: ProspectingPlanExpanded;
  companyName?: string;
}) {
  const hasPlan =
    plan.whoToTarget.length > 0 || plan.conversationAngles.length > 0;

  return (
    <DossierSection
      id="prospecting-plan"
      title="Prospecting Plan"
      icon="talk"
      accent="blue"
    >
      <p className="mb-4 text-sm text-text-secondary">
        Turn the intelligence into action. Recommendations are tied to account
        evidence, not generic job-title outreach.
      </p>

      {!hasPlan ? (
        <UnavailableState
          title="Plan not ready"
          message={
            plan.unavailableNote ||
            "A prospecting plan appears after live research produces people, initiatives, or hiring evidence."
          }
        />
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Who should I contact first?
            </h3>
            <ul className="mt-3 space-y-3">
              {plan.whoToTarget.map((target) => (
                <li
                  key={target.persona}
                  className="rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
                >
                  <p className="font-medium text-white">
                    {formatJobTitle(target.persona, { companyName })}
                  </p>
                  <Meta
                    label="Why them"
                    value={formatDisplayText(target.whyThem, { companyName })}
                  />
                  <Meta
                    label="What should I talk about"
                    value={formatDisplayText(target.talkAbout, { companyName })}
                  />
                  <Meta
                    label="Related evidence"
                    value={formatHeadline(target.relatedSignal, { companyName })}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Top 3 conversation angles
            </h3>
            <ol className="mt-3 space-y-3">
              {plan.conversationAngles.slice(0, 3).map((angle) => (
                <li
                  key={angle}
                  className="flex flex-wrap items-start gap-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4 text-sm text-text-secondary"
                >
                  <ClaimBadge type="SALES_HYPOTHESIS" />
                  <span>{formatDisplayText(angle, { companyName })}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-border/80 bg-surface-elevated/50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Why now?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {formatDisplayText(plan.strongestWhyNow, { companyName })}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Discovery questions
            </h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
              {plan.discoveryQuestions.map((question) => (
                <li key={question}>
                  {formatDisplayText(question, {
                    companyName,
                    ensurePunctuation: false,
                  })}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              What do I still need to know?
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {plan.stillNeedToDiscover.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-100/90"
                >
                  {formatDisplayText(item, {
                    companyName,
                    ensurePunctuation: false,
                  })}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </DossierSection>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
      <span className="font-medium text-text-muted">{label}: </span>
      {value}
    </p>
  );
}
