import {
  hasTavilyApiKey,
  tavilyExtract,
  tavilySearch,
  type TavilyResult,
  type TavilySearchOptions,
} from "@/lib/tavily";
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
  | "financial"
  | "compliance";

export type LiveResearchItem = {
  bucket: LiveResearchBucket;
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  query: string;
  pass?: string;
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
  passSummary?: string[];
};

type ResearchPass = {
  pass: string;
  bucket: LiveResearchBucket;
  buildQuery: (companyName: string, website: string, host: string) => string;
  topic?: "general" | "news";
  maxResults?: number;
  searchDepth?: TavilySearchOptions["searchDepth"];
  includeDomains?: (host: string) => string[] | undefined;
  timeRange?: TavilySearchOptions["timeRange"];
  chunksPerSource?: number;
};

const LOW_QUALITY_DOMAINS = [
  "pinterest.com",
  "quora.com",
  "reddit.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
];

const REGULATORY_DOMAINS = [
  "hhs.gov",
  "cms.gov",
  "cisa.gov",
  "nist.gov",
  "samhsa.gov",
  "ecfr.gov",
  "federalregister.gov",
  "leg.state.fl.us",
  "myfloridalegal.com",
  "ahca.myflorida.com",
  "flgov.com",
];

const FINANCIAL_DOMAINS = [
  "irs.gov",
  "sec.gov",
  "emma.msrb.org",
  "guidestar.org",
  "propublica.org",
  "causewaycapital.com",
];

function hostFromWebsite(website: string) {
  try {
    return new URL(website).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

function companyDomainList(host: string) {
  if (!host) return undefined;
  return [host, `www.${host}`, `careers.${host}`, `jobs.${host}`];
}

/**
 * Separate research passes — specialized queries per category.
 * Prefer first-party / authoritative domains when helpful.
 */
const RESEARCH_PASSES: ResearchPass[] = [
  // —— Overview / profile ——
  {
    pass: "overview-profile",
    bucket: "overview",
    buildQuery: (c) => `${c} health system about overview nonprofit headquarters`,
    maxResults: 6,
    searchDepth: "advanced",
    includeDomains: (host) => companyDomainList(host),
    chunksPerSource: 3,
  },
  {
    pass: "overview-scale",
    bucket: "overview",
    buildQuery: (c) =>
      `${c} number of hospitals employees caregivers states locations`,
    maxResults: 5,
    searchDepth: "basic",
  },

  // —— 1. Leadership ——
  {
    pass: "leadership-pages",
    bucket: "leadership",
    buildQuery: (c) =>
      `${c} leadership team CIO CTO CISO "chief digital" "chief information" executive`,
    maxResults: 8,
    searchDepth: "advanced",
    includeDomains: (host) => companyDomainList(host),
    chunksPerSource: 3,
  },
  {
    pass: "leadership-c-suite",
    bucket: "leadership",
    buildQuery: (c) =>
      `${c} CIO OR CTO OR CISO OR "Chief Digital Officer" OR "Chief AI Officer" OR "Chief Data Officer" appointed OR named`,
    maxResults: 8,
    searchDepth: "advanced",
    chunksPerSource: 3,
  },
  {
    pass: "leadership-engineering",
    bucket: "leadership",
    buildQuery: (c) =>
      `"${c}" ("VP Engineering" OR "Vice President Engineering" OR "VP Application Development" OR "VP Software" OR "VP Platform" OR "VP DevOps" OR "Enterprise Architecture")`,
    maxResults: 6,
    searchDepth: "advanced",
  },
  {
    pass: "leadership-interviews",
    bucket: "leadership",
    buildQuery: (c) =>
      `${c} CIO OR CTO interview OR biography OR conference OR "technology leadership" OR "digital leadership"`,
    maxResults: 6,
    searchDepth: "basic",
  },

  // —— 2. Job intelligence ——
  {
    pass: "hiring-first-party",
    bucket: "hiring",
    buildQuery: (c, _w, host) =>
      `site:${host} (careers OR jobs) ("software engineer" OR "software developer" OR "platform engineer" OR DevOps OR "cloud engineer")`,
    maxResults: 8,
    searchDepth: "advanced",
    chunksPerSource: 3,
  },
  {
    pass: "hiring-engineers",
    bucket: "hiring",
    buildQuery: (c) =>
      `${c} ("software engineer" OR "application developer" OR "platform engineer" OR DevOps OR "cloud architect") jobs OR careers`,
    maxResults: 8,
    searchDepth: "advanced",
  },
  {
    pass: "hiring-ai-data",
    bucket: "hiring",
    buildQuery: (c) =>
      `${c} ("data engineer" OR "AI engineer" OR "machine learning" OR "generative AI" OR "Epic developer" OR "integration engineer" OR "security engineer") job OR careers`,
    maxResults: 8,
    searchDepth: "advanced",
  },
  {
    pass: "hiring-indeed",
    bucket: "hiring",
    buildQuery: (c) =>
      `${c} software engineer OR devops OR "data engineer" site:indeed.com`,
    maxResults: 6,
    searchDepth: "basic",
    includeDomains: () => ["indeed.com"],
  },
  {
    pass: "hiring-workday",
    bucket: "hiring",
    buildQuery: (c) =>
      `${c} ("software engineer" OR "platform engineer" OR DevOps OR "data engineer") (job OR jobs OR career)`,
    maxResults: 6,
    searchDepth: "basic",
    includeDomains: () => [
      "myworkdayjobs.com",
      "workday.com",
      "greenhouse.io",
      "lever.co",
      "icims.com",
    ],
  },

  // —— 3. Technology ——
  {
    pass: "technology-stack",
    bucket: "technology",
    buildQuery: (c) =>
      `${c} (Epic OR AWS OR Azure OR GCP OR Kubernetes OR Docker OR Terraform OR GitHub OR GitLab OR "VS Code" OR ".NET" OR Python OR Java OR TypeScript) technology OR engineering`,
    maxResults: 8,
    searchDepth: "advanced",
    chunksPerSource: 3,
  },
  {
    pass: "technology-ai-tools",
    bucket: "ai",
    buildQuery: (c) =>
      `${c} (Copilot OR Claude OR "generative AI" OR LLM OR "AI coding" OR "developer experience" OR Databricks OR Snowflake) technology OR partnership`,
    maxResults: 7,
    searchDepth: "advanced",
  },
  {
    pass: "technology-ehr-cloud",
    bucket: "technology",
    buildQuery: (c) =>
      `${c} Epic EHR OR "electronic health record" OR "cloud migration" OR "Azure DevOps" OR CI/CD platform`,
    maxResults: 6,
    searchDepth: "basic",
  },

  // —— 4. Strategic initiatives ——
  {
    pass: "initiatives-first-party",
    bucket: "initiatives",
    buildQuery: (c) =>
      `${c} ("strategic plan" OR "digital transformation" OR "AI strategy" OR modernization OR "smart hospital" OR "digital health")`,
    maxResults: 7,
    searchDepth: "advanced",
    includeDomains: (host) => companyDomainList(host),
    chunksPerSource: 3,
  },
  {
    pass: "initiatives-expansion",
    bucket: "initiatives",
    buildQuery: (c) =>
      `${c} (expansion OR acquisition OR partnership OR "new facility" OR "cloud migration" OR "application modernization" OR "developer productivity")`,
    maxResults: 7,
    searchDepth: "advanced",
    timeRange: "year",
  },
  {
    pass: "initiatives-cyber-data",
    bucket: "initiatives",
    buildQuery: (c) =>
      `${c} (cybersecurity OR "data modernization" OR automation OR "patient experience" OR "Epic modernization") initiative OR strategy`,
    maxResults: 5,
    searchDepth: "basic",
  },

  // —— 5. Financial / public docs ——
  {
    pass: "financial-filings",
    bucket: "financial",
    buildQuery: (c) =>
      `${c} ("Form 990" OR "annual report" OR "audited financial" OR "bond offering" OR "bond disclosure" OR "capital plan")`,
    maxResults: 7,
    searchDepth: "advanced",
    chunksPerSource: 3,
  },
  {
    pass: "financial-operations",
    bucket: "financial",
    buildQuery: (c) =>
      `${c} ("operating margin" OR "capital spending" OR "technology investment" OR productivity OR "cost pressure" OR "board meeting") financial OR budget`,
    maxResults: 6,
    searchDepth: "advanced",
  },

  // —— 6. Regulatory / compliance ——
  {
    pass: "compliance-authoritative",
    bucket: "compliance",
    buildQuery: (c) =>
      `healthcare HIPAA "Security Rule" OR OCR OR CMS OR "cybersecurity performance goals" OR SSDF OR NIST guidance ${c}`,
    maxResults: 6,
    searchDepth: "advanced",
    includeDomains: () => REGULATORY_DOMAINS,
    chunksPerSource: 3,
  },
  {
    pass: "compliance-florida",
    bucket: "compliance",
    buildQuery: (c) =>
      `${c} Florida (HIPAA OR privacy OR "breach notification" OR AHCA OR cybersecurity) healthcare regulation`,
    maxResults: 5,
    searchDepth: "basic",
    includeDomains: () => [
      ...REGULATORY_DOMAINS,
      "modernhealthcare.com",
      "healthcareitnews.com",
    ],
  },
  {
    pass: "compliance-ai-security",
    bucket: "compliance",
    buildQuery: () =>
      `HHS OCR HIPAA enforcement OR "secure software development" OR "third-party risk" healthcare AI governance guidance`,
    maxResults: 5,
    searchDepth: "advanced",
    includeDomains: () => REGULATORY_DOMAINS,
    timeRange: "year",
  },

  // —— 7. Recent news / triggers ——
  {
    pass: "news-triggers",
    bucket: "news",
    buildQuery: (c) =>
      `${c} (CIO OR CISO OR acquisition OR partnership OR "generative AI" OR cybersecurity OR expansion OR "digital transformation")`,
    topic: "news",
    maxResults: 8,
    searchDepth: "advanced",
    timeRange: "year",
  },
  {
    pass: "news-first-party",
    bucket: "news",
    buildQuery: (c) => `${c} newsroom OR "press release" AI OR technology OR leadership`,
    maxResults: 6,
    searchDepth: "basic",
    includeDomains: (host) => companyDomainList(host),
    timeRange: "year",
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
  // v3: multi-pass specialized research orchestration
  return `v3|${name}|${website}`;
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

function sourcePriorityScore(url: string, companyHost: string) {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return 50;
  }

  if (companyHost && (host === companyHost || host.endsWith(`.${companyHost}`))) {
    if (/careers|jobs/.test(host) || /careers|jobs/.test(url)) return 5;
    return 10;
  }
  if (REGULATORY_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) {
    return 15;
  }
  if (FINANCIAL_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) {
    return 20;
  }
  if (/indeed\.com|linkedin\.com|glassdoor\.com/.test(host)) return 35;
  if (LOW_QUALITY_DOMAINS.some((d) => host.includes(d))) return 90;
  return 45;
}

function toItems(
  bucket: LiveResearchBucket,
  query: string,
  results: TavilyResult[],
  pass: string,
  snippetChars = 900,
): LiveResearchItem[] {
  return results.map((result) => ({
    bucket,
    pass,
    title: (result.title || "Untitled").replace(/\s+/g, " ").trim(),
    url: result.url,
    snippet: (result.content || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, snippetChars),
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
    compliance: [],
    news: [],
  };
}

function isHighValueUrl(url: string, companyHost: string) {
  const score = sourcePriorityScore(url, companyHost);
  return score <= 25;
}

async function enrichWithExtracts(
  items: LiveResearchItem[],
  companyHost: string,
  errors: string[],
) {
  const candidates = [...items]
    .sort(
      (a, b) =>
        sourcePriorityScore(a.url, companyHost) -
        sourcePriorityScore(b.url, companyHost),
    )
    .filter((item) => isHighValueUrl(item.url, companyHost))
    .slice(0, 10)
    .map((item) => item.url);

  if (candidates.length === 0) return items;

  try {
    const extracts = await tavilyExtract(candidates, { extractDepth: "basic" });
    const byUrl = new Map(
      extracts.map((item) => [item.url.replace(/\/$/, "").toLowerCase(), item]),
    );

    return items.map((item) => {
      const key = item.url.replace(/\/$/, "").toLowerCase();
      const extracted = byUrl.get(key);
      if (!extracted?.rawContent) return item;
      const richer = extracted.rawContent.slice(0, 1600);
      if (richer.length <= item.snippet.length) return item;
      return { ...item, snippet: richer };
    });
  } catch (error) {
    errors.push(
      error instanceof Error
        ? `Extract enrichment failed: ${error.message}`
        : "Extract enrichment failed",
    );
    return items;
  }
}

async function researchAccountFresh(
  companyName: string,
  companyWebsite: string,
): Promise<LiveResearchResult> {
  const name = companyName.trim() || "Unknown company";
  const website = normalizeWebsite(companyWebsite, name);
  const host = hostFromWebsite(website);
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
      passSummary: [],
    };
  }

  const errors: string[] = [];
  const passCounts = new Map<string, number>();

  // Run specialized passes in small parallel waves to reduce rate-limit risk.
  const runPass = async (passDef: ResearchPass) => {
    const query = passDef.buildQuery(name, website, host);
    const includeDomains = passDef.includeDomains?.(host);
    const response = await tavilySearch(query, {
      maxResults: passDef.maxResults ?? 5,
      topic: passDef.topic,
      searchDepth: passDef.searchDepth ?? "basic",
      includeDomains,
      excludeDomains: LOW_QUALITY_DOMAINS,
      timeRange: passDef.timeRange,
      chunksPerSource: passDef.chunksPerSource,
    });
    return {
      pass: passDef.pass,
      bucket: passDef.bucket,
      query,
      items: toItems(passDef.bucket, query, response.results, passDef.pass),
    };
  };

  const WAVE_SIZE = 6;
  const settled: PromiseSettledResult<Awaited<ReturnType<typeof runPass>>>[] =
    [];
  for (let i = 0; i < RESEARCH_PASSES.length; i += WAVE_SIZE) {
    const wave = RESEARCH_PASSES.slice(i, i + WAVE_SIZE);
    const waveResults = await Promise.allSettled(wave.map(runPass));
    settled.push(...waveResults);
  }

  let items: LiveResearchItem[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") {
      items.push(...result.value.items);
      passCounts.set(
        result.value.pass,
        (passCounts.get(result.value.pass) || 0) + result.value.items.length,
      );
      continue;
    }
    errors.push(
      result.reason instanceof Error
        ? result.reason.message
        : "unknown search error",
    );
  }

  items = dedupeResults(items);
  items = await enrichWithExtracts(items, host, errors);

  // Prefer higher-priority sources when organizing later lists.
  items.sort(
    (a, b) =>
      sourcePriorityScore(a.url, host) - sourcePriorityScore(b.url, host),
  );

  const organized = organizeResearch(items);

  if (items.length === 0) {
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
      passSummary: [],
    };
  }

  const counts = getOrganizedCounts(organized)
    .filter((item) => item.count > 0)
    .map((item) => `${item.label}: ${item.count}`)
    .join(" · ");

  const passSummary = [...passCounts.entries()]
    .filter(([, count]) => count > 0)
    .map(([pass, count]) => `${pass}: ${count}`);

  return {
    status: "live",
    companyName: name,
    companyWebsite: website,
    searchedAt,
    message: `Multi-pass research gathered ${items.length} sources across ${passSummary.length} passes. ${counts}`,
    items,
    organized,
    errors,
    passSummary,
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
