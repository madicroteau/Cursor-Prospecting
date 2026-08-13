import {
  hasApolloApiKey,
  searchApolloTechnologyLeaders,
  type ApolloLeadershipResult,
} from "@/lib/apollo";
import { analyzeAccountResearch, hasOpenAiApiKey, type AiAnalysisResult } from "@/lib/ai-analyze";
import { localAnalyzeAccountResearch } from "@/lib/local-analyze";
import { researchAccount, type LiveResearchResult } from "@/lib/live-research";
import { getMockDossier, type AccountDossier } from "@/lib/mock-data";

export type AccountDossierBundle = {
  dossier: AccountDossier;
  liveResearch: LiveResearchResult;
  aiAnalysis: AiAnalysisResult;
  apolloLeadership?: ApolloLeadershipResult;
};

type CacheEntry = {
  expiresAt: number;
  value: AccountDossierBundle;
};

const CACHE_TTL_MS = 15 * 60 * 1000;
const bundleCache = new Map<string, CacheEntry>();

function normalizeWebsiteForCache(website: string, companyName: string) {
  const trimmed = website.trim();
  let normalized = trimmed
    ? trimmed.startsWith("http")
      ? trimmed
      : `https://${trimmed}`
    : `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`;

  try {
    const url = new URL(normalized);
    url.hash = "";
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    normalized = `${url.origin}${path}${url.search}`;
  } catch {
    normalized = normalized.replace(/\/$/, "");
  }
  return normalized;
}

function cacheKey(companyName: string, companyWebsite: string) {
  // v7: Apollo people enrichment (full names) + org technologies
  return `v7|${companyName.trim().toLowerCase()}|${normalizeWebsiteForCache(
    companyWebsite,
    companyName,
  ).toLowerCase()}`;
}

function shouldUseOpenAi() {
  // OpenAI is optional. Local analysis is the default for now.
  return (
    hasOpenAiApiKey() &&
    process.env.USE_OPENAI_ANALYSIS?.trim().toLowerCase() === "true"
  );
}

function mergeDossier(
  base: AccountDossier,
  liveResearch: LiveResearchResult,
  aiAnalysis: AiAnalysisResult,
  apolloLeadership?: ApolloLeadershipResult,
): AccountDossier {
  const patch = aiAnalysis.dossierPatch || {};
  const experimentalPatch = aiAnalysis.experimentalPatch || {};

  const liveSources = liveResearch.items.map((item) => ({
    title: `[Live] ${item.title}`,
    url: item.url,
  }));

  const apolloSources =
    apolloLeadership?.status === "live"
      ? apolloLeadership.people.slice(0, 12).map((person) => ({
          title: `[Apollo] ${person.name} — ${person.title}`,
          url:
            person.linkedinUrl ||
            `https://www.apollo.io/people?q=${encodeURIComponent(person.name)}`,
        }))
      : [];

  const patchedSources = [
    ...(patch.sources || []),
    ...apolloSources,
    ...liveSources,
    ...base.sources,
  ].filter(
    (source, index, list) =>
      list.findIndex((item) => item.url === source.url) === index,
  );

  return {
    ...base,
    snapshot: patch.snapshot || base.snapshot,
    whatsHappening: patch.whatsHappening?.length
      ? patch.whatsHappening
      : base.whatsHappening,
    techAndAI: patch.techAndAI?.length ? patch.techAndAI : base.techAndAI,
    prospectTargets: patch.prospectTargets?.length
      ? patch.prospectTargets
      : base.prospectTargets,
    opportunitySignals: patch.opportunitySignals?.length
      ? patch.opportunitySignals
      : base.opportunitySignals,
    whyCursor: patch.whyCursor?.length ? patch.whyCursor : base.whyCursor,
    whyNow: patch.whyNow?.length ? patch.whyNow : base.whyNow,
    talkTrack: patch.talkTrack?.length ? patch.talkTrack : base.talkTrack,
    prospectingBrief: patch.prospectingBrief || base.prospectingBrief,
    sources: patchedSources,
    experimental: {
      ...base.experimental,
      overview: experimentalPatch.overview || base.experimental.overview,
      technologySignals:
        experimentalPatch.technologySignals ||
        base.experimental.technologySignals,
      strategicInitiatives:
        experimentalPatch.strategicInitiatives ||
        base.experimental.strategicInitiatives,
      evidenceLibrary:
        experimentalPatch.evidenceLibrary || base.experimental.evidenceLibrary,
      jobIntelligence:
        experimentalPatch.jobIntelligence || base.experimental.jobIntelligence,
      buyingCommittee:
        experimentalPatch.buyingCommittee || base.experimental.buyingCommittee,
      whyNowSynthesis:
        experimentalPatch.whyNowSynthesis || base.experimental.whyNowSynthesis,
      researchGaps:
        experimentalPatch.researchGaps || base.experimental.researchGaps,
      prospectingPlan:
        experimentalPatch.prospectingPlan || base.experimental.prospectingPlan,
      complianceSecurity:
        experimentalPatch.complianceSecurity ||
        base.experimental.complianceSecurity,
      roiAssumptions: {
        ...base.experimental.roiAssumptions,
        notes: [
          ...base.experimental.roiAssumptions.notes,
          aiAnalysis.status === "live" || aiAnalysis.status === "local"
            ? "ROI inputs remain USER/INDUSTRY assumptions unless customer-validated."
            : "Analysis not applied to ROI assumptions.",
          apolloLeadership?.status === "live"
            ? `Apollo leadership enrichment: ${apolloLeadership.people.length} profiles for ${apolloLeadership.companyDomain}.`
            : apolloLeadership?.status === "missing_key"
              ? "Apollo not configured (add APOLLO_API_KEY for buying-committee enrichment)."
              : "",
        ].filter(Boolean),
      },
    },
    generatedAt: new Date().toISOString(),
  };
}

async function analyzeResearch(
  liveResearch: LiveResearchResult,
  apolloLeadership: ApolloLeadershipResult,
): Promise<AiAnalysisResult> {
  const local = localAnalyzeAccountResearch(liveResearch, { apolloLeadership });

  if (!shouldUseOpenAi()) {
    return local;
  }

  const openai = await analyzeAccountResearch(liveResearch);

  // Prefer Apollo-enriched buying committee / prospect targets from local analysis.
  if (
    apolloLeadership.status === "live" &&
    apolloLeadership.people.length > 0 &&
    local.experimentalPatch?.buyingCommittee
  ) {
    return {
      ...openai,
      message: `${openai.message} Apollo leadership applied to buying committee.`,
      dossierPatch: {
        ...openai.dossierPatch,
        prospectTargets:
          local.dossierPatch?.prospectTargets ||
          openai.dossierPatch?.prospectTargets,
        sources: [
          ...(local.dossierPatch?.sources || []),
          ...(openai.dossierPatch?.sources || []),
        ],
      },
      experimentalPatch: {
        ...openai.experimentalPatch,
        overview: local.experimentalPatch?.overview || openai.experimentalPatch?.overview,
        technologySignals:
          local.experimentalPatch?.technologySignals ||
          openai.experimentalPatch?.technologySignals,
        strategicInitiatives:
          local.experimentalPatch?.strategicInitiatives ||
          openai.experimentalPatch?.strategicInitiatives,
        evidenceLibrary:
          local.experimentalPatch?.evidenceLibrary ||
          openai.experimentalPatch?.evidenceLibrary,
        buyingCommittee: local.experimentalPatch.buyingCommittee,
        jobIntelligence:
          local.experimentalPatch?.jobIntelligence ||
          openai.experimentalPatch?.jobIntelligence,
        whyNowSynthesis:
          local.experimentalPatch?.whyNowSynthesis ||
          openai.experimentalPatch?.whyNowSynthesis,
        researchGaps:
          local.experimentalPatch.researchGaps ||
          openai.experimentalPatch?.researchGaps,
        prospectingPlan:
          local.experimentalPatch.prospectingPlan ||
          openai.experimentalPatch?.prospectingPlan,
      },
    };
  }

  return openai;
}

async function buildFreshBundle(
  companyName: string,
  companyWebsite: string,
): Promise<AccountDossierBundle> {
  const baseDossier = getMockDossier(companyName, companyWebsite);
  const [liveResearch, apolloLeadership] = await Promise.all([
    researchAccount(companyName, companyWebsite),
    searchApolloTechnologyLeaders(companyName, companyWebsite),
  ]);
  const aiAnalysis = await analyzeResearch(liveResearch, apolloLeadership);
  const dossier = mergeDossier(
    baseDossier,
    liveResearch,
    aiAnalysis,
    apolloLeadership,
  );

  return {
    dossier,
    liveResearch,
    aiAnalysis,
    apolloLeadership,
  };
}

export async function buildAccountDossierBundle(
  companyName: string,
  companyWebsite: string,
): Promise<AccountDossierBundle> {
  const key = cacheKey(companyName, companyWebsite);
  const cached = bundleCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const value = await buildFreshBundle(companyName, companyWebsite);

  const apolloOk = value.apolloLeadership?.status === "live";
  const researchOk = value.liveResearch.status === "live";
  const analysisOk =
    value.aiAnalysis.status === "local" || value.aiAnalysis.status === "live";
  if (apolloOk || (researchOk && analysisOk)) {
    bundleCache.set(key, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      value,
    });
  }
  return value;
}

export function getDossierStatusLabel(bundle: AccountDossierBundle) {
  const apolloLive = bundle.apolloLeadership?.status === "live";
  const apolloError = bundle.apolloLeadership?.status === "error";

  if (bundle.aiAnalysis.status === "live") {
    return apolloLive
      ? "AI analysis + Apollo leadership"
      : "AI analysis connected";
  }
  if (bundle.aiAnalysis.status === "local" && bundle.liveResearch.status === "live") {
    return apolloLive
      ? "Live research + Apollo leadership"
      : hasApolloApiKey()
        ? "Live research + local analysis"
        : "Live research + local analysis (add APOLLO_API_KEY for leaders)";
  }
  if (apolloLive && bundle.aiAnalysis.status === "local") {
    return "Apollo leadership + local analysis";
  }
  if (bundle.liveResearch.status === "live") {
    return "Live research connected";
  }
  if (bundle.liveResearch.status === "missing_key") {
    return "Add Tavily key for live research";
  }
  if (
    bundle.liveResearch.status === "error" &&
    /usage limit|quota/i.test(bundle.liveResearch.message)
  ) {
    return apolloLive
      ? "Apollo leadership live — Tavily quota exceeded"
      : "Tavily quota exceeded — web research paused";
  }
  if (apolloError) {
    return `Apollo error: ${(bundle.apolloLeadership?.message || "request failed").slice(0, 120)}`;
  }
  return "Live research unavailable";
}
