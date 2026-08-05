import { analyzeAccountResearch, hasOpenAiApiKey, type AiAnalysisResult } from "@/lib/ai-analyze";
import { localAnalyzeAccountResearch } from "@/lib/local-analyze";
import { researchAccount, type LiveResearchResult } from "@/lib/live-research";
import { getMockDossier, type AccountDossier } from "@/lib/mock-data";

export type AccountDossierBundle = {
  dossier: AccountDossier;
  liveResearch: LiveResearchResult;
  aiAnalysis: AiAnalysisResult;
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
  return `${companyName.trim().toLowerCase()}|${normalizeWebsiteForCache(
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
): AccountDossier {
  const patch = aiAnalysis.dossierPatch || {};
  const experimentalPatch = aiAnalysis.experimentalPatch || {};

  const liveSources = liveResearch.items.map((item) => ({
    title: `[Live] ${item.title}`,
    url: item.url,
  }));

  const patchedSources = [
    ...(patch.sources || []),
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
        ],
      },
    },
    generatedAt: new Date().toISOString(),
  };
}

async function analyzeResearch(
  liveResearch: LiveResearchResult,
): Promise<AiAnalysisResult> {
  if (shouldUseOpenAi()) {
    return analyzeAccountResearch(liveResearch);
  }
  return localAnalyzeAccountResearch(liveResearch);
}

async function buildFreshBundle(
  companyName: string,
  companyWebsite: string,
): Promise<AccountDossierBundle> {
  const baseDossier = getMockDossier(companyName, companyWebsite);
  const liveResearch = await researchAccount(companyName, companyWebsite);
  const aiAnalysis = await analyzeResearch(liveResearch);
  const dossier = mergeDossier(baseDossier, liveResearch, aiAnalysis);

  return {
    dossier,
    liveResearch,
    aiAnalysis,
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
  bundleCache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    value,
  });
  return value;
}

export function getDossierStatusLabel(bundle: AccountDossierBundle) {
  if (bundle.aiAnalysis.status === "live") {
    return "AI analysis connected";
  }
  if (bundle.aiAnalysis.status === "local" && bundle.liveResearch.status === "live") {
    return "Live research + local analysis";
  }
  if (bundle.liveResearch.status === "live") {
    return "Live research connected";
  }
  if (bundle.liveResearch.status === "missing_key") {
    return "Add Tavily key for live research";
  }
  return "Sample dossier mode";
}
