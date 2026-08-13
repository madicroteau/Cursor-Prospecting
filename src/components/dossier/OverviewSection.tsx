import { ClaimBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import { UnavailableState } from "@/components/dossier/UnavailableState";
import type { OverviewIntelligence } from "@/lib/experimental-intelligence";
import {
  formatDisplayText,
  formatHeadline,
  formatJobTitle,
  formatPersonName,
} from "@/lib/text-format";

export function OverviewSection({
  data,
  companyName,
}: {
  data: OverviewIntelligence;
  companyName?: string;
}) {
  return (
    <div className="space-y-6">
      <DossierSection id="overview" title="Overview" icon="snapshot" accent="blue">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
          {data.question}
        </p>
        {data.unavailableNote &&
        data.whyNow.length === 0 &&
        data.initiatives.length === 0 &&
        data.technologySignals.length === 0 &&
        data.peopleToEngage.length === 0 ? (
          <div className="mt-4">
            <UnavailableState message={data.unavailableNote} />
          </div>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            {formatDisplayText(data.executiveBrief, { companyName })}
          </p>
        )}
      </DossierSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <DossierSection
          id="overview-why-now"
          title="Top 3 Why Now signals"
          icon="cursor"
          accent="violet"
        >
          {data.whyNow.length === 0 ? (
            <UnavailableState message="No evidence-backed Why Now signals yet. Open Why Now after live research runs." />
          ) : (
            <ol className="space-y-3">
              {data.whyNow.map((item, index) => (
                <li key={item.trigger} className="rounded-lg border border-border/80 bg-surface-elevated/50 p-4">
                  <p className="text-xs text-text-muted">#{index + 1}</p>
                  <p className="mt-1 font-medium text-white">
                    {formatHeadline(item.trigger, { companyName })}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {formatDisplayText(item.evidence, { companyName })}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </DossierSection>

        <DossierSection
          id="overview-initiatives"
          title="Top strategic initiatives"
          icon="activity"
          accent="violet"
        >
          {data.initiatives.length === 0 ? (
            <UnavailableState message="No sourced strategic initiatives yet." />
          ) : (
            <ul className="space-y-2">
              {data.initiatives.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-border/80 bg-surface-elevated/50 px-4 py-3 text-sm text-white"
                >
                  {formatHeadline(item, { companyName })}
                </li>
              ))}
            </ul>
          )}
        </DossierSection>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DossierSection
          id="overview-tech"
          title="Top technology signals"
          icon="tech"
          accent="emerald"
        >
          {data.technologySignals.length === 0 ? (
            <UnavailableState message="No sourced technology signals yet." />
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.technologySignals.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100/90"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </DossierSection>

        <DossierSection
          id="overview-people"
          title="Top people / personas to engage"
          icon="people"
          accent="blue"
        >
          {data.peopleToEngage.length === 0 ? (
            <UnavailableState message="No publicly identifiable technology leaders were confirmed in this pass." />
          ) : (
            <ul className="space-y-3">
              {data.peopleToEngage.map((person) => (
                <li
                  key={`${person.name}-${person.title}`}
                  className="rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
                >
                  <p className="font-medium text-white">
                    {formatPersonName(person.name, { companyName })}
                  </p>
                  <p className="mt-0.5 text-xs text-blue-400">
                    {formatJobTitle(person.title, { companyName })}
                  </p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    Likely role (inferred): {person.role}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DossierSection>
      </div>

      <DossierSection
        id="overview-angle"
        title="Recommended initial sales angle"
        icon="talk"
        accent="amber"
      >
        <div className="flex flex-wrap items-start gap-2">
          <ClaimBadge type="SALES_HYPOTHESIS" />
          <p className="text-sm leading-relaxed text-text-secondary">
            {formatDisplayText(data.recommendedSalesAngle, { companyName })}
          </p>
        </div>
      </DossierSection>
    </div>
  );
}
