import type { LiveResearchItem, LiveResearchResult } from "@/lib/live-research";

/**
 * Step 7 research categories for the Account Intel dossier.
 */
export const RESEARCH_CATEGORIES = [
  "leadership",
  "hiring",
  "ai",
  "technology",
  "initiatives",
  "financial",
] as const;

export type ResearchCategory = (typeof RESEARCH_CATEGORIES)[number];

export type OrganizedResearch = Record<ResearchCategory, LiveResearchItem[]>;

export const RESEARCH_CATEGORY_LABELS: Record<ResearchCategory, string> = {
  leadership: "Leadership",
  hiring: "Hiring",
  ai: "AI",
  technology: "Technology",
  initiatives: "Strategic Initiatives",
  financial: "Financial / Public Information",
};

const KEYWORDS: Record<ResearchCategory, string[]> = {
  leadership: [
    "cio",
    "cto",
    "ciso",
    "chief",
    "vp ",
    "vice president",
    "director",
    "leadership",
    "appointed",
    "names",
  ],
  hiring: [
    "job",
    "career",
    "hiring",
    "engineer",
    "developer",
    "opening",
    "recruit",
    "software",
  ],
  ai: [
    " artificial intelligence",
    "generative ai",
    " genai",
    "machine learning",
    "llm",
    "copilot",
    "ai-",
    " ai ",
    "ai/",
  ],
  technology: [
    "epic",
    "cloud",
    "aws",
    "azure",
    "software",
    "platform",
    "devops",
    "kubernetes",
    "ehr",
    "digital",
    "technology",
  ],
  initiatives: [
    "strategy",
    "strategic",
    "transformation",
    "initiative",
    "modernization",
    "expansion",
    "roadmap",
    "vision",
    "partnership",
  ],
  financial: [
    "financial",
    "form 990",
    "bond",
    "capital",
    "budget",
    "investment",
    "revenue",
    "cost",
    "funding",
    "acquisition",
    "operating income",
    "bond rating",
    "credit rating",
  ],
};

function scoreCategory(item: LiveResearchItem, category: ResearchCategory) {
  const text = `${item.title} ${item.snippet} ${item.url}`.toLowerCase();
  let score = 0;

  // Prefer the search bucket that produced the result.
  if (item.bucket === category) score += 5;
  if (item.bucket === "overview" && category === "initiatives") score += 2;
  if (item.bucket === "news" && category === "initiatives") score += 1;
  if (item.bucket === "technology" && category === "ai") score += 1;

  for (const keyword of KEYWORDS[category]) {
    if (text.includes(keyword.trim().toLowerCase())) {
      score += 2;
    }
  }

  return score;
}

function classifyItem(item: LiveResearchItem): ResearchCategory {
  let best: ResearchCategory = "initiatives";
  let bestScore = -1;

  for (const category of RESEARCH_CATEGORIES) {
    const score = scoreCategory(item, category);
    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }

  return best;
}

export function organizeResearch(items: LiveResearchItem[]): OrganizedResearch {
  const organized: OrganizedResearch = {
    leadership: [],
    hiring: [],
    ai: [],
    technology: [],
    initiatives: [],
    financial: [],
  };

  for (const item of items) {
    organized[classifyItem(item)].push(item);
  }

  return organized;
}

export function getOrganizedCounts(organized: OrganizedResearch) {
  return RESEARCH_CATEGORIES.map((category) => ({
    category,
    label: RESEARCH_CATEGORY_LABELS[category],
    count: organized[category].length,
  }));
}

export function getOrganizedFromLiveResearch(
  liveResearch: LiveResearchResult,
): OrganizedResearch {
  return organizeResearch(liveResearch.items);
}
