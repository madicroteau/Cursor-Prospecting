import type { AccountDossier } from "@/lib/mock-data";
import type { LiveResearchResult } from "@/lib/live-research";
import type { DossierSectionId } from "@/lib/dossier-sections";
import { OverviewSection } from "@/components/dossier/OverviewSection";
import { BuyingCommitteeSection } from "@/components/dossier/BuyingCommitteeSection";
import { TechnologySignalsSection } from "@/components/dossier/TechnologySignalsSection";
import { JobIntelligenceSection } from "@/components/dossier/JobIntelligenceSection";
import { InitiativesSection } from "@/components/dossier/InitiativesSection";
import { WhyNowSynthesisSection } from "@/components/dossier/WhyNowSynthesisSection";
import { ProspectingPlanSection } from "@/components/dossier/ProspectingPlanSection";
import { SourcesLibrarySection } from "@/components/dossier/SourcesLibrarySection";

export function DossierSectionPage({
  section,
  dossier,
  liveResearch,
}: {
  section: DossierSectionId;
  dossier: AccountDossier;
  liveResearch: LiveResearchResult;
}) {
  const { experimental } = dossier;
  const companyName = dossier.companyName;
  const liveUnavailable =
    liveResearch.status === "missing_key"
      ? "Live web research is unavailable until TAVILY_API_KEY is set in .env.local."
      : liveResearch.status === "error"
        ? liveResearch.message
        : undefined;

  switch (section) {
    case "overview":
      return (
        <OverviewSection
          data={experimental.overview}
          companyName={companyName}
        />
      );

    case "buying-committee":
      return (
        <BuyingCommitteeSection
          data={{
            ...experimental.buyingCommittee,
            unavailableNote:
              experimental.buyingCommittee.unavailableNote || liveUnavailable,
          }}
          companyName={companyName}
        />
      );

    case "technology":
      return (
        <TechnologySignalsSection
          signals={experimental.technologySignals}
          companyName={companyName}
          unavailableNote={liveUnavailable}
        />
      );

    case "job-intelligence":
      return (
        <JobIntelligenceSection
          data={{
            ...experimental.jobIntelligence,
            unavailableNote:
              experimental.jobIntelligence.unavailableNote || liveUnavailable,
          }}
          companyName={companyName}
        />
      );

    case "initiatives":
      return (
        <InitiativesSection
          initiatives={experimental.strategicInitiatives}
          companyName={companyName}
          unavailableNote={liveUnavailable}
        />
      );

    case "why-now":
      return (
        <WhyNowSynthesisSection
          signals={experimental.whyNowSynthesis}
          companyName={companyName}
        />
      );

    case "prospecting":
      return (
        <ProspectingPlanSection
          plan={{
            ...experimental.prospectingPlan,
            unavailableNote:
              experimental.prospectingPlan.unavailableNote || liveUnavailable,
          }}
          companyName={companyName}
        />
      );

    case "sources":
      return (
        <SourcesLibrarySection
          sources={experimental.evidenceLibrary}
          companyName={companyName}
          unavailableNote={liveUnavailable}
          generatedAt={dossier.generatedAt}
          liveStatus={
            liveResearch.status === "live" ? "connected" : "not connected"
          }
        />
      );

    default:
      return null;
  }
}
