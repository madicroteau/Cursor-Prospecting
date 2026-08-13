import type { LiveResearchItem, LiveResearchResult } from "@/lib/live-research";

/**
 * Research categories for the Account Intel dossier.
 * Includes dedicated compliance and recent-news buckets from multi-pass research.
 */
export const RESEARCH_CATEGORIES = [
  "leadership",
  "hiring",
  "ai",
  "technology",
  "initiatives",
  "financial",
  "compliance",
  "news",
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
  compliance: "Regulatory / Compliance",
  news: "Recent News / Triggers",
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
    "biography",
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
    "indeed",
  ],
  ai: [
    " artificial intelligence",
    "generative ai",
    " genai",
    "machine learning",
    "llm",
    "copilot",
    "claude",
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
    "github",
    "gitlab",
    "docker",
    "terraform",
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
    "smart hospital",
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
    "operating margin",
    "bond rating",
    "credit rating",
    "audited",
  ],
  compliance: [
    "hipaa",
    "ocr",
    "cms",
    "nist",
    "cisa",
    "compliance",
    "regulation",
    "security rule",
    "breach",
    "privacy",
    "ahca",
    "enforcement",
    "ssdf",
  ],
  news: [
    "announces",
    "announced",
    "appoints",
    "appointed",
    "partners",
    "acquisition",
    "opens",
    "launches",
    "press release",
    "newsroom",
  ],
};

function scoreCategory(item: LiveResearchItem, category: ResearchCategory) {
  const text = `${item.title} ${item.snippet} ${item.url}`.toLowerCase();
  let score = 0;

  // Prefer the search bucket that produced the result.
  if (item.bucket === category) score += 8;
  if (item.bucket === "overview" && category === "initiatives") score += 2;
  if (item.bucket === "news" && category === "initiatives") score += 1;
  if (item.bucket === "technology" && category === "ai") score += 1;
  if (item.bucket === "compliance" && category === "news") score += 1;

  for (const keyword of KEYWORDS[category]) {
    if (text.includes(keyword.trim().toLowerCase())) {
      score += 2;
    }
  }

  return score;
}

function classifyItem(item: LiveResearchItem): ResearchCategory {
  // Trust dedicated research passes when the bucket is a first-class category.
  if (
    item.bucket === "leadership" ||
    item.bucket === "hiring" ||
    item.bucket === "ai" ||
    item.bucket === "technology" ||
    item.bucket === "initiatives" ||
    item.bucket === "financial" ||
    item.bucket === "compliance" ||
    item.bucket === "news"
  ) {
    // Still allow strong AI keyword overrides from technology bucket.
    if (item.bucket === "technology") {
      const aiScore = scoreCategory(item, "ai");
      const techScore = scoreCategory(item, "technology");
      if (aiScore > techScore + 2) return "ai";
    }
    return item.bucket;
  }

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

function emptyOrganized(): OrganizedResearch {
  return {
    leadership: [],
    hiring: [],
    ai: [],
    technology: [],
    initiatives: [],
    financial: [],
    compliance: [],
    news: [],
  };
}

export function organizeResearch(items: LiveResearchItem[]): OrganizedResearch {
  const organized = emptyOrganized();

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
