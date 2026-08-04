import type { AccountDossier } from "@/lib/mock-data";
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

interface AccountDossierViewProps {
  dossier: AccountDossier;
}

function formatGeneratedDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

export function AccountDossierView({ dossier }: AccountDossierViewProps) {
  const { snapshot, experimental } = dossier;

  return (
    <div className="space-y-6">
      {/* Snapshot metrics */}
      <DossierSection id="snapshot" title="Account Snapshot" icon="snapshot">
        <div className="grid gap-4 sm:grid-cols-2">
          <SnapshotMetric label="Industry" value={snapshot.industry} />
          <SnapshotMetric label="Headquarters" value={snapshot.headquarters} />
          <SnapshotMetric label="Scale" value={snapshot.sizeSignal} />
          <SnapshotMetric
            label="Recent signal"
            value={snapshot.recentHeadline}
            className="sm:col-span-2"
          />
        </div>
      </DossierSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <DossierSection
          id="whats-happening"
          title="What's Happening Inside"
          icon="activity"
          accent="violet"
        >
          <BulletList items={dossier.whatsHappening} />
        </DossierSection>

        <DossierSection
          id="tech-ai"
          title="Tech & AI Signals"
          icon="tech"
          accent="emerald"
        >
          <BulletList items={dossier.techAndAI} />
        </DossierSection>
      </div>

      <JobIntelligenceSection data={experimental.jobIntelligence} />

      <DossierSection
        id="prospects"
        title="Who to Prospect"
        icon="people"
        accent="blue"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dossier.prospectTargets.map((prospect) => (
            <ProspectCard key={prospect.name + prospect.title} prospect={prospect} />
          ))}
        </div>
      </DossierSection>

      <BuyingCommitteeSection data={experimental.buyingCommittee} />

      <DossierSection
        id="signals"
        title="Opportunity Signals"
        icon="signals"
        accent="amber"
      >
        <div className="flex flex-wrap gap-2">
          {dossier.opportunitySignals.map((signal) => (
            <span
              key={signal}
              className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs leading-relaxed text-amber-100/90"
            >
              {signal}
            </span>
          ))}
        </div>
      </DossierSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <DossierSection
          id="why-cursor"
          title="Why Cursor"
          icon="cursor"
          accent="blue"
        >
          <BulletList items={dossier.whyCursor} />
        </DossierSection>

        <DossierSection
          id="why-now"
          title="Why Now"
          icon="cursor"
          accent="violet"
        >
          <BulletList items={dossier.whyNow} />
        </DossierSection>
      </div>

      <WhyNowSynthesisSection signals={experimental.whyNowSynthesis} />

      <RoiTcoSection assumptions={experimental.roiAssumptions} />

      <ResearchGapsSection gaps={experimental.researchGaps} />

      <ProspectingPlanSection plan={experimental.prospectingPlan} />

      <DossierSection id="talk-track" title="Suggested Talk Track" icon="talk">
        <ol className="space-y-4">
          {dossier.talkTrack.map((line, index) => (
            <li key={line} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-blue-400 ring-1 ring-accent/30">
                {index + 1}
              </span>
              <p className="pt-0.5 text-sm italic leading-relaxed text-text-secondary">
                {line}
              </p>
            </li>
          ))}
        </ol>
      </DossierSection>

      <DossierSection id="sources" title="Sources" icon="sources">
        <ul className="divide-y divide-border">
          {dossier.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 py-3 text-sm text-blue-400 transition-colors hover:text-blue-300"
              >
                <span>{source.title}</span>
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
          Generated {formatGeneratedDate(dossier.generatedAt)} · Mock data for
          UI preview · Experimental sections included
        </p>
      </DossierSection>
    </div>
  );
}

function SnapshotMetric({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-border/80 bg-surface-elevated/60 p-4 ${className}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white">{value}</p>
    </div>
  );
}
