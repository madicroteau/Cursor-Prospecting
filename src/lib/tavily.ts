export type TavilyResult = {
  title: string;
  url: string;
  content: string;
  publishedDate?: string;
  score?: number;
};

export type TavilySearchResponse = {
  query: string;
  answer?: string;
  results: TavilyResult[];
};

export type TavilyExtractResult = {
  url: string;
  rawContent: string;
};

type TavilyApiResult = {
  title?: string;
  url?: string;
  content?: string;
  published_date?: string;
  score?: number;
};

type TavilyApiResponse = {
  query?: string;
  answer?: string;
  results?: TavilyApiResult[];
};

type TavilyExtractApiResponse = {
  results?: Array<{
    url?: string;
    raw_content?: string;
  }>;
  failed_results?: Array<{ url?: string; error?: string }>;
};

export type TavilySearchOptions = {
  maxResults?: number;
  includeAnswer?: boolean;
  topic?: "general" | "news";
  searchDepth?: "basic" | "advanced" | "fast" | "ultra-fast";
  includeDomains?: string[];
  excludeDomains?: string[];
  timeRange?: "day" | "week" | "month" | "year";
  chunksPerSource?: number;
  timeoutMs?: number;
};

export function hasTavilyApiKey() {
  return Boolean(process.env.TAVILY_API_KEY?.trim());
}

export async function tavilySearch(
  query: string,
  options?: TavilySearchOptions,
): Promise<TavilySearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing TAVILY_API_KEY");
  }

  const body: Record<string, unknown> = {
    api_key: apiKey,
    query,
    search_depth: options?.searchDepth ?? "basic",
    include_answer: options?.includeAnswer ?? false,
    max_results: options?.maxResults ?? 5,
    topic: options?.topic ?? "general",
  };

  if (options?.includeDomains?.length) {
    body.include_domains = options.includeDomains;
  }
  if (options?.excludeDomains?.length) {
    body.exclude_domains = options.excludeDomains;
  }
  if (options?.timeRange) {
    body.time_range = options.timeRange;
  }
  if (options?.chunksPerSource) {
    body.chunks_per_source = options.chunksPerSource;
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    // Prevent hung dossier pages when Tavily/DNS stalls (was blocking 3+ minutes).
    signal: AbortSignal.timeout(options?.timeoutMs ?? 12_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tavily search failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as TavilyApiResponse;

  return {
    query: data.query || query,
    answer: data.answer,
    results: (data.results || [])
      .filter((item) => item.url && item.title)
      .map((item) => ({
        title: item.title || "Untitled",
        url: item.url || "",
        content: item.content || "",
        publishedDate: item.published_date,
        score: item.score,
      })),
  };
}

/** Retrieve fuller page text for high-value URLs. */
export async function tavilyExtract(
  urls: string[],
  options?: { extractDepth?: "basic" | "advanced" },
): Promise<TavilyExtractResult[]> {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing TAVILY_API_KEY");
  }

  const unique = [...new Set(urls.filter(Boolean))].slice(0, 6);
  if (unique.length === 0) return [];

  const response = await fetch("https://api.tavily.com/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      urls: unique,
      extract_depth: options?.extractDepth ?? "basic",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tavily extract failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as TavilyExtractApiResponse;
  return (data.results || [])
    .filter((item) => item.url && item.raw_content)
    .map((item) => ({
      url: item.url || "",
      rawContent: (item.raw_content || "").replace(/\s+/g, " ").trim(),
    }));
}
