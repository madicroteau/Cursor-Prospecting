import { hasTavilyApiKey, tavilySearch, type TavilyResult } from "@/lib/tavily";

export type LiveResearchBucket =
  | "overview"
  | "technology"
  | "leadership"
  | "hiring"
  | "news";

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
  errors: string[];
};

const BUCKET_QUERIES: {
  bucket: LiveResearchBucket;
  buildQuery: (companyName: string, website: string) => string;
  topic?: "general" | "news";
}[] = [
  {
    bucket: "overview",
    buildQuery: (companyName) =>
      `${companyName} health system overview strategy digital transformation`,
  },
  {
    bucket: "technology",
    buildQuery: (companyName) =>
      `${companyName} AI cloud software Epic digital technology initiative`,
  },
  {
    bucket: "leadership",
    buildQuery: (companyName) =>
      `${companyName} CIO CTO Chief Digital Officer technology leadership`,
  },
  {
    bucket: "hiring",
    buildQuery: (companyName) =>
      `${companyName} software engineer jobs careers cloud data AI hiring`,
  },
  {
    bucket: "news",
    buildQuery: (companyName) =>
      `${companyName} latest news expansion partnership AI technology`,
    topic: "news",
  },
];

function normalizeWebsite(website: string, companyName: string) {
  const trimmed = website.trim();
  if (trimmed) {
    return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  }
  return `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`;
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
): LiveResearchItem[] {
  return results.map((result) => ({
    bucket,
    title: result.title,
    url: result.url,
    snippet: result.content.slice(0, 320),
    publishedDate: result.publishedDate,
    query,
  }));
}

export async function researchAccount(
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
      errors: [],
    };
  }

  const errors: string[] = [];
  const items: LiveResearchItem[] = [];

  // Keep Step 5 simple and reliable: a few focused public searches.
  for (const bucketQuery of BUCKET_QUERIES) {
    const query = bucketQuery.buildQuery(name, website);
    try {
      const response = await tavilySearch(query, {
        maxResults: 4,
        topic: bucketQuery.topic,
      });
      items.push(...toItems(bucketQuery.bucket, query, response.results));
    } catch (error) {
      errors.push(
        error instanceof Error
          ? `${bucketQuery.bucket}: ${error.message}`
          : `${bucketQuery.bucket}: unknown search error`,
      );
    }
  }

  if (items.length === 0) {
    return {
      status: "error",
      companyName: name,
      companyWebsite: website,
      searchedAt,
      message:
        "Live research ran, but no usable public sources were returned. Check the API key and try again.",
      items: [],
      errors,
    };
  }

  return {
    status: "live",
    companyName: name,
    companyWebsite: website,
    searchedAt,
    message: `Found ${items.length} public sources across overview, technology, leadership, hiring, and news.`,
    items: dedupeResults(items),
    errors,
  };
}
