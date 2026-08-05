import type { AccountDossier } from "@/lib/mock-data";
import type { LiveResearchResult } from "@/lib/live-research";
import type { DossierSectionId } from "@/lib/dossier-sections";
import {
  BulletList,
  DossierSection,
} from "@/components/dossier/DossierSection";
import { ProspectCard } from "@/components/dossier/ProspectCard";
import { JobIntelligenceSection } from "@/components/dossier/JobIntelligenceSection";
import { BuyingCommitteeSection } from "@/components/dossier/BuyingCommitteeSection";
import { RoiTcoSection } from "@/components/dossier/RoiTcoSection";
import { ResearchGapsSection } from "@/components/dossier/ResearchGapsSection";
import { WhyNowSynthesisSection } from "@/components/dossier/WhyNowSynthesisSection";
import { ProspectingPlanSection } from "@/components/dossier/ProspectingPlanSection";
import { LiveResearchSection } from "@/components/dossier/LiveResearchSection";
import {
  OrganizedResearchSection,
  OrganizedResearchSummary,
} from "@/components/dossier/OrganizedResearchSection";
import { ProspectingBriefSection } from "@/components/dossier/ProspectingBriefSection";
import { ComplianceSecuritySection } from "@/components/dossier/ComplianceSecuritySection";
import { formatDisplayText, formatHeadline } from "@/lib/text-format";

function formatGeneratedDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

function SnapshotMetric({
  label,
  value,
  companyName,
  className = "",
}: {
  label: string;
  value: string;
  companyName?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-border/80 bg-surface-elevated/60 p-4 ${className}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white">
        {formatHeadline(value, { companyName })}
      </p>
    </div>
  );
}

function SignalChips({
  signals,
  companyName,
}: {
  signals: string[];
  companyName?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {signals.map((signal) => (
        <span
          key={signal}
          className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs leading-relaxed text-amber-100/90"
        >
          {formatDisplayText(signal, { companyName })}
        </span>
      ))}
    </div>
  );
}

function getAllSources(dossier: AccountDossier, liveResearch: LiveResearchResult) {
  const liveSources = liveResearch.items.map((item) => ({
    title: `[Live] ${item.title}`,
    url: item.url,
  }));

  return [...liveSources, ...dossier.sources].filter(
    (source, index, list) =>
      list.findIndex((item) => item.url === source.url) === index,
  );
}

export function DossierSectionPage({
  section,
  dossier,
  liveResearch,
}: {
  section: DossierSectionId;
  dossier: AccountDossier;
  liveResearch: LiveResearchResult;
}) {
  const { snapshot, experimental } = dossier;
  const companyName = dossier.companyName;
  const allSources = getAllSources(dossier, liveResearch);

  switch (section) {
    case "executive-brief":
      return (
        <div className="space-y-6">
          <DossierSection id="snapshot" title="Account Snapshot" icon="snapshot">
            <div className="grid gap-4 sm:grid-cols-2">
              <SnapshotMetric
                label="Industry"
                value={snapshot.industry}
                companyName={companyName}
              />
              <SnapshotMetric
                label="Headquarters"
                value={snapshot.headquarters}
                companyName={companyName}
              />
              <SnapshotMetric
                label="Scale"
                value={snapshot.sizeSignal}
                companyName={companyName}
              />
              <SnapshotMetric
                label="Recent signal"
                value={snapshot.recentHeadline}
                companyName={companyName}
                className="sm:col-span-2"
              />
            </div>
          </DossierSection>

          <ProspectingBriefSection
            brief={dossier.prospectingBrief}
            companyName={companyName}
          />

          <OrganizedResearchSummary organized={liveResearch.organized} />
        </div>
      );

    case "why-now":
      return (
        <div className="space-y-6">
          <DossierSection
            id="why-cursor-now"
            title="Why Cursor · Why Now"
            icon="cursor"
            accent="violet"
          >
            {dossier.prospectingBrief.whyCursorNow.length > 0 ? (
              <div className="space-y-4">
                {dossier.prospectingBrief.whyCursorNow.map((signal) => (
                  <article
                    key={`${signal.headline}-${signal.sources?.[0]?.url || signal.meddpicc}-${signal.command}`}
                    className="rounded-xl border border-border/80 bg-surface-elevated/50 p-4"
                  >
                    <div className="flex flex-wrap gap-2 text-[11px] text-text-muted">
                      <span>MEDDPICC · {signal.meddpicc}</span>
                      <span>Command · {signal.command}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-white">
                      {formatHeadline(signal.headline, { companyName })}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {formatDisplayText(signal.insight, { companyName })}
                    </p>
                    {signal.sources.length > 0 ? (
                      <ul className="mt-3 space-y-1">
                        {signal.sources.map((source) => (
                          <li key={source.url}>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              {formatHeadline(source.title, { companyName })}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <BulletList items={dossier.whyNow} companyName={companyName} />
            )}
          </DossierSection>
          <WhyNowSynthesisSection
            signals={experimental.whyNowSynthesis}
            companyName={companyName}
          />
          <OrganizedResearchSection
            category="initiatives"
            items={liveResearch.organized.initiatives}
            title="Supporting Initiative Sources"
            companyName={companyName}
          />
        </div>
      );

    case "compliance-security":
      return (
        <ComplianceSecuritySection
          data={experimental.complianceSecurity}
          companyName={companyName}
        />
      );

    case "buying-committee":
      return (
        <div className="space-y-6">
          <BuyingCommitteeSection
            data={experimental.buyingCommittee}
            companyName={companyName}
          />
          <DossierSection
            id="prospects"
            title="Who to Prospect"
            icon="people"
            accent="blue"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dossier.prospectTargets.map((prospect) => (
                <ProspectCard
                  key={prospect.name + prospect.title}
                  prospect={prospect}
                  companyName={companyName}
                />
              ))}
            </div>
          </DossierSection>
          <OrganizedResearchSection
            category="leadership"
            items={liveResearch.organized.leadership}
            companyName={companyName}
          />
        </div>
      );

    case "job-intelligence":
      return (
        <div className="space-y-6">
          <JobIntelligenceSection
            data={experimental.jobIntelligence}
            companyName={companyName}
          />
          <OrganizedResearchSection
            category="hiring"
            items={liveResearch.organized.hiring}
            companyName={companyName}
          />
        </div>
      );

    case "initiatives":
      return (
        <div className="space-y-6">
          <OrganizedResearchSection
            category="initiatives"
            items={liveResearch.organized.initiatives}
            companyName={companyName}
          />
          <DossierSection
            id="whats-happening"
            title="What's Happening Inside"
            icon="activity"
            accent="violet"
          >
            <BulletList
              items={dossier.whatsHappening}
              companyName={companyName}
            />
          </DossierSection>
        </div>
      );

    case "technology":
      return (
        <div className="space-y-6">
          <OrganizedResearchSection
            category="ai"
            items={liveResearch.organized.ai}
            companyName={companyName}
          />
          <OrganizedResearchSection
            category="technology"
            items={liveResearch.organized.technology}
            companyName={companyName}
          />
          <DossierSection
            id="tech-ai"
            title="Tech & AI Signals"
            icon="tech"
            accent="emerald"
          >
            <BulletList items={dossier.techAndAI} companyName={companyName} />
          </DossierSection>
        </div>
      );

    case "financials":
      return (
        <div className="space-y-6">
          <DossierSection
            id="financials"
            title="Financial / Public Information"
            icon="signals"
            accent="amber"
          >
            <p className="text-sm leading-relaxed text-text-secondary">
              Public financial and investment clues drawn from organized live
              research. Dedicated financial document parsing can deepen this
              later.
            </p>
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Opportunity signals
              </h3>
              <div className="mt-3">
                <SignalChips
                  signals={dossier.opportunitySignals}
                  companyName={companyName}
                />
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SnapshotMetric
                label="Scale signal"
                value={snapshot.sizeSignal}
                companyName={companyName}
              />
              <SnapshotMetric
                label="Recent public signal"
                value={snapshot.recentHeadline}
                companyName={companyName}
              />
            </div>
          </DossierSection>
          <OrganizedResearchSection
            category="financial"
            items={liveResearch.organized.financial}
            companyName={companyName}
          />
        </div>
      );

    case "roi":
      return (
        <div className="space-y-6">
          <RoiTcoSection assumptions={experimental.roiAssumptions} />
        </div>
      );

    case "research-gaps":
      return (
        <div className="space-y-6">
          <ResearchGapsSection
            gaps={experimental.researchGaps}
            companyName={companyName}
          />
        </div>
      );

    case "prospecting":
      return (
        <div className="space-y-6">
          <ProspectingPlanSection
            plan={experimental.prospectingPlan}
            companyName={companyName}
          />
          <DossierSection id="talk-track" title="Suggested Talk Track" icon="talk">
            <ol className="space-y-4">
              {dossier.talkTrack.map((line, index) => (
                <li key={line} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-blue-400 ring-1 ring-accent/30">
                    {index + 1}
                  </span>
                  <p className="pt-0.5 text-sm italic leading-relaxed text-text-secondary">
                    {formatDisplayText(line, {
                      companyName,
                      ensurePunctuation: false,
                    })}
                  </p>
                </li>
              ))}
            </ol>
          </DossierSection>
        </div>
      );

    case "sources":
      return (
        <div className="space-y-6">
          <LiveResearchSection
            research={liveResearch}
            companyName={companyName}
          />
          <DossierSection id="sources" title="Sources" icon="sources">
            <ul className="divide-y divide-border">
              {allSources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 py-3 text-sm text-blue-400 transition-colors hover:text-blue-300"
                  >
                    <span>
                      {formatHeadline(source.title, { companyName })}
                    </span>
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 opacity-60"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v8.25A2.25 2.25 0 0 0 5.25 18.75h13.5A2.25 2.25 0 0 0 21 16.5V8.25m-10.5 0V6a2.25 2.25 0 0 1 2.25-2.25h1.372c.516 0 1.01.205 1.372.568l1.07 1.07a2.25 2.25 0 0 0 1.372.568H18a2.25 2.25 0 0 1 2.25 2.25v2.25"
                      />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-text-muted">
              Generated {formatGeneratedDate(dossier.generatedAt)} · Live
              research{" "}
              {liveResearch.status === "live" ? "connected" : "pending API key"}{" "}
              · Experimental sections may still include SAMPLE content
            </p>
          </DossierSection>
        </div>
      );

    default:
      return null;
  }
}
