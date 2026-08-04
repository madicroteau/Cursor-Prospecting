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

export function hasTavilyApiKey() {
  return Boolean(process.env.TAVILY_API_KEY?.trim());
}

export async function tavilySearch(
  query: string,
  options?: {
    maxResults?: number;
    includeAnswer?: boolean;
    topic?: "general" | "news";
  },
): Promise<TavilySearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing TAVILY_API_KEY");
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      include_answer: options?.includeAnswer ?? false,
      max_results: options?.maxResults ?? 5,
      topic: options?.topic ?? "general",
    }),
    cache: "no-store",
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
