import { hasTavilyApiKey, tavilySearch, type TavilyResult } from "@/lib/tavily";
import {
  getOrganizedCounts,
  organizeResearch,
  type OrganizedResearch,
} from "@/lib/organize-research";
export type LiveResearchBucket =
  | "overview"
  | "technology"
  | "leadership"
  | "hiring"
  | "news"
  | "ai"
  | "initiatives"
  | "financial";

export type LiveResearchItem = {
  bucket: LiveResearchBucket;
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  query: string;
};

export type LiveResearchResult = {
  status: "live" | "missing_key" | "error";
  companyName: string;
  companyWebsite: string;
  searchedAt: string;
  message: string;
  items: LiveResearchItem[];
  organized: OrganizedResearch;
  errors: string[];
};

const BUCKET_QUERIES: {
  bucket: LiveResearchBucket;
  buildQuery: (companyName: string, website: string) => string;
  topic?: "general" | "news";
  maxResults?: number;
}[] = [
  {
    bucket: "overview",
    buildQuery: (companyName) =>
      `${companyName} health system overview strategy digital transformation`,
  },
  {
    bucket: "overview",
    buildQuery: (companyName) =>
      `${companyName} nonprofit headquarters location about company profile`,
  },
  {
    bucket: "overview",
    buildQuery: (companyName) =>
      `${companyName} number of hospitals employees caregivers states`,
  },
  {
    bucket: "leadership",
    buildQuery: (companyName) =>
      `${companyName} CIO CTO Chief Digital Officer technology leadership`,
  },
  {
    bucket: "leadership",
    buildQuery: (companyName) =>
      `${companyName} CIO CTO CDO appointed named "chief information" "chief technology"`,
  },
  {
    bucket: "hiring",
    buildQuery: (companyName) =>
      `${companyName} software engineer jobs careers cloud data AI hiring`,
  },
  {
    bucket: "hiring",
    buildQuery: (companyName) =>
      `${companyName} careers devops platform engineer data engineer cybersecurity jobs`,
  },
  {
    bucket: "ai",
    buildQuery: (companyName) =>
      `${companyName} artificial intelligence generative AI machine learning initiative`,
  },
  {
    bucket: "ai",
    buildQuery: (companyName) =>
      `${companyName} AI strategy partnership generative AI clinical operations`,
  },
  {
    bucket: "technology",
    buildQuery: (companyName) =>
      `${companyName} cloud Epic software platform EHR technology stack`,
  },
  {
    bucket: "technology",
    buildQuery: (companyName) =>
      `${companyName} Epic EHR electronic health record cloud migration AWS Azure`,
  },
  {
    bucket: "initiatives",
    buildQuery: (companyName) =>
      `${companyName} strategic plan digital transformation expansion modernization initiative`,
  },
  {
    bucket: "initiatives",
    buildQuery: (companyName) =>
      `${companyName} expansion partnership investment digital campus hospital construction`,
  },
  {
    bucket: "financial",
    buildQuery: (companyName) =>
      `${companyName} financial report Form 990 bond disclosure capital investment budget`,
  },
  {
    bucket: "financial",
    buildQuery: (companyName) =>
      `${companyName} bond rating operating income capital plan revenue nonprofit finances`,
  },
  {
    bucket: "news",
    buildQuery: (companyName) =>
      `${companyName} latest news expansion partnership AI technology`,
    topic: "news",
  },
];

type CacheEntry = {
  expiresAt: number;
  value: LiveResearchResult;
};

const CACHE_TTL_MS = 15 * 60 * 1000;
const researchCache = new Map<string, CacheEntry>();

function normalizeWebsite(website: string, companyName: string) {
  const trimmed = website.trim();
  let normalized = trimmed
    ? trimmed.startsWith("http")
      ? trimmed
      : `https://${trimmed}`
    : `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`;

  try {
    const url = new URL(normalized);
    url.hash = "";
    // Stable cache key: drop trailing slash (except bare origin path)
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    normalized = `${url.origin}${path}${url.search}`;
  } catch {
    normalized = normalized.replace(/\/$/, "");
  }

  return normalized;
}

function cacheKey(companyName: string, companyWebsite: string) {
  const name = companyName.trim().toLowerCase();
  const website = normalizeWebsite(companyWebsite, companyName).toLowerCase();
  // v2: raw source text (no pre-format) for reliable name/title extraction
  return `v2|${name}|${website}`;
}

function dedupeResults(items: LiveResearchItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.url.replace(/\/$/, "").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toItems(
  bucket: LiveResearchBucket,
  query: string,
  results: TavilyResult[],
  _companyName: string,
): LiveResearchItem[] {
  // Keep raw source text here. Display formatting runs in the UI / local
  // analysis layer — pre-formatting breaks case-sensitive name extraction.
  return results.map((result) => ({
    bucket,
    title: (result.title || "Untitled").replace(/\s+/g, " ").trim(),
    url: result.url,
    snippet: (result.content || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 320),
    publishedDate: result.publishedDate,
    query,
  }));
}

function emptyOrganized(): OrganizedResearch {
  return {
    leadership: [],
    hiring: [],
    ai: [],
    technology: [],
    initiatives: [],
    financial: [],
  };
}

async function researchAccountFresh(
  companyName: string,
  companyWebsite: string,
): Promise<LiveResearchResult> {
  const name = companyName.trim() || "Unknown company";
  const website = normalizeWebsite(companyWebsite, name);
  const searchedAt = new Date().toISOString();

  if (!hasTavilyApiKey()) {
    return {
      status: "missing_key",
      companyName: name,
      companyWebsite: website,
      searchedAt,
      message:
        "Live research is ready, but no Tavily API key is set yet. Add TAVILY_API_KEY to a local .env.local file.",
      items: [],
      organized: emptyOrganized(),
      errors: [],
    };
  }

  const errors: string[] = [];
  // Run searches in parallel — sequential queries made first loads feel stuck (20s+).
  const settled = await Promise.allSettled(
    BUCKET_QUERIES.map(async (bucketQuery) => {
      const query = bucketQuery.buildQuery(name, website);
      const response = await tavilySearch(query, {
        maxResults: bucketQuery.maxResults ?? 4,
        topic: bucketQuery.topic,
      });
      return {
        bucket: bucketQuery.bucket,
        query,
        items: toItems(bucketQuery.bucket, query, response.results, name),
      };
    }),
  );

  const items: LiveResearchItem[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") {
      items.push(...result.value.items);
      continue;
    }
    errors.push(
      result.reason instanceof Error
        ? result.reason.message
        : "unknown search error",
    );
  }

  const deduped = dedupeResults(items);
  const organized = organizeResearch(deduped);

  if (deduped.length === 0) {
    return {
      status: "error",
      companyName: name,
      companyWebsite: website,
      searchedAt,
      message:
        "Live research ran, but no usable public sources were returned. Check the API key and try again.",
      items: [],
      organized: emptyOrganized(),
      errors,
    };
  }

  const counts = getOrganizedCounts(organized)
    .filter((item) => item.count > 0)
    .map((item) => `${item.label}: ${item.count}`)
    .join(" · ");

  return {
    status: "live",
    companyName: name,
    companyWebsite: website,
    searchedAt,
    message: `Organized ${deduped.length} public sources into Step 7 categories. ${counts}`,
    items: deduped,
    organized,
    errors,
  };
}

export async function researchAccount(
  companyName: string,
  companyWebsite: string,
): Promise<LiveResearchResult> {
  const key = cacheKey(companyName, companyWebsite);
  const cached = researchCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const value = await researchAccountFresh(companyName, companyWebsite);
  researchCache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    value,
  });
  return value;
}
