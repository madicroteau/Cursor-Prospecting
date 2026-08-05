import type { AiAnalysisResult } from "@/lib/ai-analyze";
import type { BuyingCommitteeRole } from "@/lib/claim-types";
import type { LiveResearchItem, LiveResearchResult } from "@/lib/live-research";
import type {
  CursorHiringAngle,
  CursorHiringAngleCategory,
  ExperimentalIntelligence,
} from "@/lib/experimental-intelligence";
import { RESEARCH_CATEGORY_LABELS } from "@/lib/organize-research";
import {
  buildComplianceSecurityIntelligence,
  mergeWhyNowSignals,
  regulatoryTriggersToWhyNowSignals,
} from "@/lib/compliance-security";
import {
  formatDisplayList,
  formatDisplayText,
  formatHeadline,
  formatJobTitle,
  formatPersonName,
} from "@/lib/text-format";
import { buildProspectingBrief } from "@/lib/prospecting-brief";

function topItems(items: LiveResearchItem[], count = 3) {
  return items.slice(0, count);
}

function sourceLine(item: LiveResearchItem) {
  return `${item.title} (${item.url})`;
}

function softTruncate(text: string, max: number) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const slice = cleaned.slice(0, max);
  const sentenceEnd = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("? "),
    slice.lastIndexOf("! "),
  );
  if (sentenceEnd > max * 0.45) {
    return slice.slice(0, sentenceEnd + 1).trim();
  }
  const wordEnd = slice.lastIndexOf(" ");
  return `${(wordEnd > 40 ? slice.slice(0, wordEnd) : slice).trim()}…`;
}

function bulletFromItem(item: LiveResearchItem, companyName?: string) {
  const snippet = item.snippet.trim();
  const title = formatHeadline(item.title, { companyName });
  if (!snippet) return title;
  const truncated = softTruncate(snippet, 180);
  const body = formatDisplayText(truncated, {
    companyName,
    ensurePunctuation: false,
  });
  const suffix = /[.!?…]$/.test(body) ? "" : ".";
  return `${title}: ${body}${suffix}`;
}

const TECH_CATALOG = [
  "Epic",
  "Cerner",
  "Oracle Health",
  "AWS",
  "Azure",
  "Google Cloud",
  "GitHub",
  "GitLab",
  "Kubernetes",
  "Docker",
  "Snowflake",
  "Databricks",
  "Python",
  "Java",
  "TypeScript",
  "React",
  ".NET",
  "Oracle",
  "Salesforce",
  "ServiceNow",
  "Tableau",
  "Power BI",
  "Generative AI",
  "Machine Learning",
  "LLM",
  "Terraform",
  "Kafka",
];

const JOB_CATEGORIES: { category: string; keywords: string[] }[] = [
  { category: "Software Engineering", keywords: ["software engineer", "software developer", "full stack", "fullstack"] },
  { category: "Application Development", keywords: ["application developer", "app developer", ".net", "java developer"] },
  { category: "AI / ML", keywords: ["machine learning", "data scientist", "generative ai", " ai ", "llm"] },
  { category: "Data Engineering", keywords: ["data engineer", "data platform", "etl", "snowflake", "databricks"] },
  { category: "Cloud", keywords: ["cloud", "aws", "azure", "gcp", "google cloud"] },
  { category: "Platform Engineering", keywords: ["platform engineer", "platform engineering", "developer experience", "devex"] },
  { category: "DevOps", keywords: ["devops", "sre", "site reliability", "ci/cd", "kubernetes"] },
  { category: "Cybersecurity", keywords: ["security", "cyber", "ciso", "infosec"] },
  { category: "Enterprise Architecture", keywords: ["architect", "architecture", "enterprise architect"] },
  { category: "Epic / Healthcare Applications", keywords: ["epic", "ehr", "cerner", "clinical systems"] },
];

function detectTech(items: LiveResearchItem[]) {
  const text = combinedText(items).toLowerCase();
  return TECH_CATALOG.filter((tech) => text.includes(tech.toLowerCase()));
}

function countJobCategories(items: LiveResearchItem[]) {
  return JOB_CATEGORIES.map(({ category, keywords }) => {
    const count = items.filter((item) => {
      const text = `${item.title} ${item.snippet}`.toLowerCase();
      return keywords.some((keyword) => text.includes(keyword));
    }).length;
    return { category, count };
  });
}

type ExtractedLeader = {
  name: string;
  title: string;
  evidence: string;
  sourceUrl: string;
  sourceTitle: string;
};

/** Words that must never appear in a person-name capture. */
const NAME_STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "for",
  "to",
  "in",
  "on",
  "at",
  "by",
  "with",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "as",
  "this",
  "that",
  "these",
  "those",
  "our",
  "their",
  "its",
  "his",
  "her",
  "who",
  "whom",
  "which",
  "what",
  "when",
  "where",
  "about",
  "into",
  "over",
  "under",
  "after",
  "before",
  "system",
  "names",
  "name",
  "team",
  "company",
  "group",
  "board",
  "inc",
  "llc",
  "corp",
  "says",
  "said",
  "announces",
  "announced",
  "appoints",
  "appointed",
  "named",
  "joins",
  "joined",
  "vice",
  "president",
  "chief",
  "officer",
  "director",
  "senior",
  "executive",
  "digital",
  "technology",
  "information",
  "organization",
  "overview",
  "network",
  "health",
  "hospital",
  "systems",
  "services",
]);

function isPlausiblePersonName(name: string): boolean {
  const parts = name.trim().split(/\s+/);
  // Prefer First Last (optional middle initial). Longer captures are usually prose.
  if (parts.length < 2 || parts.length > 3) return false;
  if (parts.length === 3 && !/^[A-Z]\.$/.test(parts[1])) return false;
  if (
    !parts.every(
      (part) =>
        /^[A-Z][a-z]+(?:['’][A-Z]?[a-z]+)?$/.test(part) ||
        /^[A-Z]\.$/.test(part),
    )
  ) {
    return false;
  }
  if (parts.some((part) => NAME_STOPWORDS.has(part.toLowerCase()))) {
    return false;
  }
  return true;
}

function cleanExtractedTitle(rawTitle: string): string | null {
  let title = rawTitle.replace(/\s+/g, " ").trim();
  // Cut before the next person in leadership lists, but only after a
  // completed title token — never split inside "Vice President Chief …".
  title = title
    .replace(
      /\b(Officer|CIO|CTO|CISO|CDO|CFO|CEO|COO|President)\s+[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+(?:Senior|Executive|Chief|VP|SVP|EVP)\b).*$/i,
      "$1",
    )
    .trim();
  title =
    title
      .split(/\s+(?:who|that|which|where|when|while|after|before)\s+/i)[0]
      ?.trim() || title;
  // Keep "and Chief ..." / "& Chief ..."; split other "and" glue.
  title = title.split(/\s+and\s+(?!Chief\b)/i)[0]?.trim() || title;
  title = title.replace(/\b(Vice President)\s+(Chief\b)/i, "$1 & $2");
  title = title.replace(/^[^A-Za-z]+/, "").replace(/[,.;:]+$/, "").trim();
  if (title.length < 2 || title.length > 80) return null;
  if (
    !/\b(CIO|CTO|CISO|CDO|CEO|CFO|COO|VP|SVP|EVP|Chief|President|Director|Head)\b/i.test(
      title,
    )
  ) {
    return null;
  }
  if (/\b(is|are|was|were|names|system|says|said|appointed|named)\b/i.test(title)) {
    return null;
  }
  return title;
}

function inferBuyingRole(
  title: string,
  evidence = "",
): BuyingCommitteeRole {
  const t = `${title} ${evidence}`.toLowerCase();
  if (/ciso|security|compliance|privacy|risk|governance|infosec/.test(t)) {
    return "SECURITY / GOVERNANCE";
  }
  if (
    /\bcfo\b|chief financial|procurement|purchasing|\bfinance\b|supply chain|supply|budget/.test(
      t,
    )
  ) {
    return "ECONOMIC / PROCUREMENT";
  }
  if (
    /\bcio\b|chief information|\bcdo\b|chief digital|\bcto\b|chief technology|\bceo\b|\bcoo\b/.test(
      t,
    )
  ) {
    return "EXECUTIVE SPONSOR";
  }
  if (
    /architect|principal engineer|staff engineer|evaluator|engineer\b/.test(t)
  ) {
    return "TECHNICAL EVALUATOR";
  }
  if (
    /(?:vp|svp|evp|director|head).*(?:engineer|platform|devex|devops|development|application|software)|(?:engineer|platform|devex|devops).*?(?:vp|svp|evp|director|head)/.test(
      t,
    ) ||
    /\b(vp|svp|evp)\b.*\b(engineering|technology|digital|it)\b/.test(t)
  ) {
    return "TECHNICAL CHAMPION";
  }
  if (/chief|president/.test(t)) {
    return "EXECUTIVE SPONSOR";
  }
  return "TECHNICAL CHAMPION";
}

function extractLeaders(items: LiveResearchItem[]): ExtractedLeader[] {
  // Never use the /i flag on name captures — it makes [A-Z][a-z]+ match
  // lowercase sentence fragments ("is vice president", "system names", etc.).
  // Keep names to First Last (optional middle initial) so we don't swallow
  // "Appointed" / "Senior" / the next leader in a list.
  const nameToken = String.raw`[A-Z][a-z]+(?:['’][A-Z]?[a-z]+)?`;
  const nameGroup = String.raw`(${nameToken}\s+${nameToken}(?:\s+[A-Z]\.)?)`;
  const chiefTitle =
    String.raw`Chief (?:Information|Technology|Digital|Data|Information Security|Financial|Executive|Operating|Supply Chain|Nursing|Medical|Human Resources|People|Strategy|Growth|Administrative) Officer`;
  const vpTitle =
    String.raw`(?:Senior\s+)?(?:Executive\s+)?Vice\s+President`;
  const cSuite = String.raw`CIO|CTO|CISO|CDO|CEO|CFO|COO`;

  type LeaderPattern = {
    regex: RegExp;
    // title-first: (vp?)(chief|csuite)(name)  OR name-first: (name)(title...)
    order: "title-first" | "name-first" | "csuite-name";
  };

  const patterns: LeaderPattern[] = [
    // Leadership pages: "Senior Executive Vice President, Chief Financial Officer Audrey Gregory"
    {
      order: "title-first",
      regex: new RegExp(
        String.raw`\b(?:(${vpTitle}),\s+)?(${chiefTitle})\s+${nameGroup}\b`,
        "g",
      ),
    },
    {
      order: "csuite-name",
      regex: new RegExp(String.raw`\b(${cSuite})\s+${nameGroup}\b`, "g"),
    },
    // "Sarah Myers Appointed CIO"
    {
      order: "name-first",
      regex: new RegExp(
        String.raw`\b${nameGroup}\s+(?:Appointed|Named)(?:\s+as)?\s+(${cSuite}|${chiefTitle})\b`,
        "g",
      ),
    },
    {
      order: "name-first",
      regex: new RegExp(
        String.raw`\b${nameGroup}\s*,?\s+(${cSuite})\b`,
        "g",
      ),
    },
    {
      order: "name-first",
      regex: new RegExp(
        String.raw`\b${nameGroup}\s+is\s+(?:the\s+)?(${cSuite}|${chiefTitle})\b`,
        "g",
      ),
    },
  ];

  const found: ExtractedLeader[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const text = `${item.title}. ${item.snippet}`;
    for (const { regex, order } of patterns) {
      regex.lastIndex = 0;
      for (const match of text.matchAll(regex)) {
        let name = "";
        let title = "";
        if (order === "title-first") {
          const vp = match[1] || "";
          const chief = match[2] || "";
          name = match[3] || "";
          title = [vp, chief].filter(Boolean).join(", ");
        } else if (order === "csuite-name") {
          title = match[1] || "";
          name = match[2] || "";
        } else {
          name = match[1] || "";
          title = match[2] || "";
        }

        name = name.replace(/[,.]$/, "").trim();
        const cleanedTitle = cleanExtractedTitle(title);
        if (!isPlausiblePersonName(name) || !cleanedTitle) continue;

        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        found.push({
          name,
          title: cleanedTitle,
          evidence: softTruncate(item.snippet || item.title, 280),
          sourceUrl: item.url,
          sourceTitle: item.title,
        });
      }
    }
  }

  return found.slice(0, 5);
}

function detectFinancialSignals(items: LiveResearchItem[]) {
  const signals: string[] = [];
  const text = combinedText(items).toLowerCase();

  if (text.includes("form 990") || text.includes("form990")) {
    signals.push("Form 990 / nonprofit filing signals found in public sources");
  }
  if (text.includes("bond")) {
    signals.push("Bond / credit disclosure activity appears in public sources");
  }
  if (text.includes("capital") || text.includes("investment")) {
    signals.push("Capital investment or funding language appears in public sources");
  }
  if (text.includes("revenue") || text.includes("operating income")) {
    signals.push("Revenue / operating income language appears in public sources");
  }

  for (const item of items.slice(0, 3)) {
    signals.push(`Financial source: ${item.title}`);
  }

  return [...new Set(signals)].slice(0, 5);
}

function uniqueBullets(items: string[], limit = 6) {
  return [...new Set(items.filter(Boolean))].slice(0, limit);
}

const CURSOR_HIRING_PATTERNS: {
  skillOrTech: string;
  category: CursorHiringAngleCategory;
  keywords: string[];
  whyItHelpsSellCursor: string;
}[] = [
  {
    skillOrTech: "Python / Java / TypeScript / .NET development",
    category: "Language",
    keywords: ["python", "java", "typescript", "javascript", ".net", "c#", "golang", "go "],
    whyItHelpsSellCursor:
      "Language-stack hiring means engineers are writing production code daily — Cursor accelerates coding, refactors, and reviews on those stacks.",
  },
  {
    skillOrTech: "AWS / Azure / Google Cloud",
    category: "Cloud",
    keywords: ["aws", "azure", "google cloud", "gcp", "cloud engineer", "cloud platform"],
    whyItHelpsSellCursor:
      "Cloud platform work often includes repetitive service, infra-as-code, and integration code where Cursor can speed delivery without skipping review standards.",
  },
  {
    skillOrTech: "Epic / EHR ecosystem",
    category: "EHR / Epic",
    keywords: ["epic", "ehr", "cerner", "oracle health", "clinical systems"],
    whyItHelpsSellCursor:
      "Epic-adjacent and EHR integration work is usually complex and customization-heavy — a strong place to sell governed AI coding assistance.",
  },
  {
    skillOrTech: "Platform / DevOps / Kubernetes",
    category: "Platform / DevOps",
    keywords: [
      "devops",
      "platform engineer",
      "kubernetes",
      "ci/cd",
      "terraform",
      "docker",
      "sre",
      "site reliability",
    ],
    whyItHelpsSellCursor:
      "Platform and DevOps teams ship tooling and automation constantly — Cursor helps them move faster on scripts, services, and internal developer platforms.",
  },
  {
    skillOrTech: "AI / ML / generative AI build work",
    category: "AI / ML",
    keywords: [
      "machine learning",
      "generative ai",
      "data scientist",
      "llm",
      "artificial intelligence",
      " ml ",
    ],
    whyItHelpsSellCursor:
      "If they are already hiring for AI build work, ask whether engineering has an approved AI coding path — Cursor Teams is a natural fit for that conversation.",
  },
  {
    skillOrTech: "Integration / large-codebase / API work",
    category: "Integration",
    keywords: [
      "integration",
      "api",
      "microservices",
      "legacy",
      "monolith",
      "data platform",
      "etl",
      "interoperability",
    ],
    whyItHelpsSellCursor:
      "Integration and large-codebase work is where AI coding tools create the most leverage — position Cursor for navigating and changing complex systems safely.",
  },
  {
    skillOrTech: "Delivery / modernization hiring pressure",
    category: "Delivery pressure",
    keywords: [
      "software engineer",
      "full stack",
      "application developer",
      "modernization",
      "digital transformation",
      "multiple openings",
    ],
    whyItHelpsSellCursor:
      "Active engineering hiring can signal delivery pressure — open with developer productivity and whether capacity is keeping up with digital demand.",
  },
];

function extractSkillsAndTasks(item: LiveResearchItem) {
  const text = `${item.title} ${item.snippet}`.toLowerCase();
  const skills: string[] = [];
  for (const pattern of CURSOR_HIRING_PATTERNS) {
    if (pattern.keywords.some((keyword) => text.includes(keyword))) {
      skills.push(pattern.skillOrTech);
    }
  }
  return uniqueBullets(skills, 5);
}

function buildCursorHiringAngles(
  hiringItems: LiveResearchItem[],
): CursorHiringAngle[] {
  const angles: CursorHiringAngle[] = [];

  for (const pattern of CURSOR_HIRING_PATTERNS) {
    const matches = hiringItems.filter((item) => {
      const text = `${item.title} ${item.snippet}`.toLowerCase();
      return pattern.keywords.some((keyword) => text.includes(keyword));
    });
    if (matches.length === 0) continue;

    angles.push({
      skillOrTech: pattern.skillOrTech,
      category: pattern.category,
      whyItHelpsSellCursor: pattern.whyItHelpsSellCursor,
      supportingJobs: matches.slice(0, 3).map((item) => item.title),
      sourceUrls: matches.slice(0, 3).map((item) => item.url),
    });
  }

  return angles.slice(0, 7);
}

function cursorRelevanceForItem(item: LiveResearchItem, skills: string[]) {
  if (skills.some((skill) => /Epic|EHR/i.test(skill))) {
    return "Epic/EHR-adjacent hiring is a strong Cursor angle: complex integrations and custom code where governed AI coding can improve throughput.";
  }
  if (skills.some((skill) => /AI \/ ML|generative/i.test(skill))) {
    return "AI/ML hiring creates an opening to ask whether builders already have an approved AI coding tool — position Cursor Teams as that path.";
  }
  if (skills.some((skill) => /Integration|Platform|Cloud|Language/i.test(skill))) {
    return `This role mentions ${skills.slice(0, 2).join(" and ")} — use that to discuss how Cursor helps engineers ship faster in complex codebases.`;
  }
  if (/engineer|developer|architect|devops|platform/i.test(item.title)) {
    return "Technical hiring signal: ask how this team handles delivery capacity and whether AI-assisted development is approved.";
  }
  return "Possible opening to discuss developer productivity if delivery pressure exists on this team.";
}

function combinedText(items: LiveResearchItem[]) {
  return items.map((item) => `${item.title} ${item.snippet}`).join(" ");
}

function titleCasePlace(value: string) {
  return value
    .split(/(\s+|,\s*)/)
    .map((part) => {
      if (/^\s+$/.test(part) || part.startsWith(",")) return part;
      if (part.length <= 2 && part === part.toUpperCase()) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function detectNonprofit(text: string) {
  const lower = text.toLowerCase();
  return (
    lower.includes("nonprofit") ||
    lower.includes("non-profit") ||
    lower.includes("not-for-profit") ||
    lower.includes("not for profit") ||
    lower.includes("501(c)(3)") ||
    lower.includes("501(c)3") ||
    lower.includes("501c3")
  );
}

function cleanLocation(raw: string) {
  const cleaned = raw
    .replace(/\s+(and|with|serving|across|operating|the|united states)\b.*/i, "")
    .replace(/,?\s*\d{5}(?:-\d{4})?.*$/i, "")
    .replace(/[.;)].*$/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length < 4 || cleaned.length > 60) return null;
  if (/^(a |an |the |its |our )/i.test(cleaned)) return null;
  if (/^\d/.test(cleaned)) return null;
  return titleCasePlace(cleaned);
}

function detectHeadquarters(text: string) {
  const patterns = [
    // "Headquarters: 900 Hope Way, Altamonte Springs, Florida, 32714"
    /headquarters[:\s]+(?:\d[\w .#'-]*,\s*)?([A-Za-z][A-Za-z .'-]+,\s*[A-Za-z][A-Za-z .'-]+)/i,
    /headquarter(?:ed|s)?\s+(?:in|at)\s+(?:\d[\w .#'-]*,\s*)?([A-Za-z][A-Za-z .'-]+(?:,\s*[A-Za-z][A-Za-z .'-]+)?)/i,
    /based\s+in\s+([A-Za-z][A-Za-z .'-]+(?:,\s*[A-Za-z][A-Za-z .'-]+)?)/i,
    /(?:located|campus)\s+in\s+([A-Za-z][A-Za-z .'-]+,\s*[A-Za-z][A-Za-z .'-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    const location = cleanLocation(match[1]);
    if (location) return location;
  }

  return null;
}

function largestMatch(text: string, pattern: RegExp) {
  let best: { raw: string; value: number } | null = null;
  for (const match of text.matchAll(pattern)) {
    const raw = match[1];
    const value = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(value)) continue;
    if (!best || value > best.value) best = { raw, value };
  }
  return best;
}

function detectSizeSignal(text: string, sourceCount: number) {
  const lower = text.toLowerCase();
  const parts: string[] = [];

  const hospitals = largestMatch(lower, /(\d[\d,]*)\+?\s+hospitals?/g);
  if (hospitals) parts.push(`${hospitals.raw} hospitals`);

  const employees = largestMatch(
    lower,
    /(\d[\d,]*)\+?\s+(?:employees|caregivers|team members)/g,
  );
  if (employees && employees.value >= 1000) {
    parts.push(`~${employees.raw} employees`);
  }

  const states = largestMatch(lower, /(?:across|in)\s+(\d+)\s+states?/g);
  if (states) parts.push(`${states.raw} states`);

  const campuses = largestMatch(
    lower,
    /(\d[\d,]*)\+?\s+(?:campuses|locations|facilities)/g,
  );
  if (campuses && campuses.value >= 5) {
    parts.push(`${campuses.raw} facilities`);
  }

  if (parts.length > 0) return parts.join(" · ");
  return `${sourceCount} public sources reviewed for scale and profile signals`;
}

function detectIndustry(text: string, isNonprofit: boolean) {
  const lower = text.toLowerCase();
  const isHealthSystem =
    lower.includes("health system") ||
    lower.includes("hospital") ||
    lower.includes("healthcare") ||
    lower.includes("health care");

  if (isNonprofit && isHealthSystem) return "Nonprofit health system";
  if (isNonprofit) return "Nonprofit organization";
  if (isHealthSystem) return "Healthcare / health system";
  return "Enterprise account (from live research)";
}

function buildAccountSnapshot(
  company: string,
  items: LiveResearchItem[],
  recentHeadline: string,
) {
  const text = combinedText(items);
  const isNonprofit = detectNonprofit(text);
  const headquarters = detectHeadquarters(text);

  return {
    industry: formatHeadline(detectIndustry(text, isNonprofit), {
      companyName: company,
    }),
    headquarters: formatHeadline(
      headquarters || "Not clearly stated in sources reviewed",
      { companyName: company },
    ),
    sizeSignal: formatHeadline(detectSizeSignal(text, items.length), {
      companyName: company,
    }),
    recentHeadline: formatHeadline(
      recentHeadline || `${company} public research summary`,
      { companyName: company },
    ),
  };
}

/**
 * Builds dossier content from organized live research without OpenAI.
 * Keeps claims conservative and source-backed.
 */
export function localAnalyzeAccountResearch(
  liveResearch: LiveResearchResult,
): AiAnalysisResult {
  if (liveResearch.status !== "live" || liveResearch.items.length === 0) {
    return {
      status: "no_research",
      message:
        "Local analysis needs live research sources first. Add a Tavily key and research an account.",
    };
  }

  const company = liveResearch.companyName;
  const { organized } = liveResearch;
  const initiativeItems = topItems(organized.initiatives, 5);
  const techItems = topItems([...organized.ai, ...organized.technology], 5);
  const hiringItems = topItems(organized.hiring, 6);
  const leadershipItems = topItems(organized.leadership, 5);
  const financialItems = topItems(organized.financial, 4);
  const techDetected = detectTech([
    ...organized.ai,
    ...organized.technology,
    ...organized.hiring,
  ]);
  const extractedLeaders = extractLeaders([
    ...organized.leadership,
    ...liveResearch.items,
  ]);
  const jobCategories = countJobCategories(organized.hiring);
  const financialSignals = detectFinancialSignals(organized.financial);

  const whatsHappening = uniqueBullets(
    [
      ...initiativeItems.map((item) => bulletFromItem(item, company)),
      ...financialItems.slice(0, 1).map((item) => bulletFromItem(item, company)),
    ],
    6,
  );

  const techAndAI = uniqueBullets(
    [
      ...techItems.map((item) => bulletFromItem(item, company)),
      ...(techDetected.length > 0
        ? [
            `Technologies mentioned in public sources: ${techDetected
              .slice(0, 8)
              .join(", ")}.`,
          ]
        : []),
    ],
    6,
  );

  const opportunitySignals = uniqueBullets(
    [
      ...initiativeItems
        .slice(0, 2)
        .map(
          (item) =>
            `Initiative signal: ${formatHeadline(item.title, { companyName: company })}`,
        ),
      ...hiringItems
        .slice(0, 2)
        .map(
          (item) =>
            `Hiring signal: ${formatHeadline(item.title, { companyName: company })}`,
        ),
      ...techItems
        .slice(0, 2)
        .map(
          (item) =>
            `Technology/AI signal: ${formatHeadline(item.title, { companyName: company })}`,
        ),
      ...financialSignals.slice(0, 2),
      ...(techDetected.includes("Epic")
        ? ["Epic / EHR environment signals may indicate complex integration work."]
        : []),
    ],
    6,
  );

  const whyNow = uniqueBullets(
    [
      ...initiativeItems
        .slice(0, 3)
        .map(
          (item) =>
            `Public initiative/news: ${formatHeadline(item.title, { companyName: company })}`,
        ),
      ...hiringItems
        .slice(0, 2)
        .map(
          (item) =>
            `Hiring activity: ${formatHeadline(item.title, { companyName: company })}`,
        ),
      ...techItems
        .slice(0, 2)
        .map(
          (item) =>
            `Technology/AI activity: ${formatHeadline(item.title, { companyName: company })}`,
        ),
      ...financialItems
        .slice(0, 1)
        .map(
          (item) =>
            `Financial/public signal: ${formatHeadline(item.title, { companyName: company })}`,
        ),
    ],
    6,
  );

  const whyCursor = uniqueBullets(
    [
      `${company} shows public digital/technology activity that may increase software delivery demand — validate with the customer.`,
      hiringItems.length > 0
        ? `Technical hiring signals (${hiringItems.length} live sources) suggest active build or platform work where developer productivity tools may be relevant.`
        : "If engineering delivery capacity is constrained, AI-assisted development may be worth exploring.",
      techDetected.length > 0
        ? `Public sources mention ${techDetected.slice(0, 5).join(", ")} — useful context for discovery on stack and delivery bottlenecks.`
        : "Confirm technology stack and where custom software work is concentrated.",
      organized.ai.length > 0
        ? "AI-related public activity creates a natural opening to discuss governed AI coding tools for builders."
        : "Even without public AI initiatives, regulated healthcare teams often need an approved developer AI path.",
      "Healthcare environments usually require governed tooling — frame any pilot around security, privacy, and team standards.",
    ],
    5,
  );

  const talkTrack = [
    `"I've been reviewing public materials around ${company}'s technology and digital priorities — where is engineering capacity most constrained right now?"`,
    hiringItems[0]
      ? `"I noticed public hiring/technology activity such as ${hiringItems[0].title}. How are those teams thinking about developer productivity?"`
      : `"How are your teams approaching developer productivity as digital and AI work expands?"`,
    techDetected[0]
      ? `"Public materials mention ${techDetected[0]} among other technologies — where is custom development creating the most delivery pressure?"`
      : `"Would a short, governed pilot with engineering and security stakeholders be useful?"`,
    '"Would a short, governed pilot with engineering and security stakeholders be useful?"',
  ];

  const prospectTargets =
    extractedLeaders.length > 0
      ? extractedLeaders.slice(0, 3).map((leader) => ({
          name: leader.name,
          title: leader.title,
          relevance: `Extracted from public source: ${formatHeadline(leader.sourceTitle, { companyName: company })}. Confirm before outreach.`,
        }))
      : [
          {
            name: "[Confirm from public sources]",
            title: "CIO / technology executive",
            relevance:
              "No clearly named technology leaders were extracted from live sources yet. Confirm via company leadership pages before outreach.",
          },
          {
            name: "[Confirm from public sources]",
            title: "VP / Director Engineering",
            relevance:
              "Likely technical champion for a developer-tooling pilot — confirm the actual person.",
          },
        ];

  const cursorSellingAngles = buildCursorHiringAngles(organized.hiring);

  const jobIntelligence: ExperimentalIntelligence["jobIntelligence"] = {
    isSample: false,
    totalRelevantOpenings: organized.hiring.length,
    categories: jobCategories,
    technologiesDetected: techDetected,
    cursorSellingAngles,
    signals: hiringItems.slice(0, 4).map((item) => {
      const itemTech = detectTech([item]);
      const skillsAndTasks = extractSkillsAndTasks(item);
      return {
        signal: item.title,
        supportingJobPostings: [item.title],
        supportingJobCount: 1,
        technologiesDetected: itemTech,
        skillsAndTasks,
        evidence: item.snippet || item.title,
        sourceUrls: [item.url],
        businessImplication:
          skillsAndTasks.length > 0
            ? `Mentions ${skillsAndTasks.slice(0, 3).join("; ")} — may indicate active delivery or platform work.`
            : itemTech.length > 0
              ? `Mentions ${itemTech.slice(0, 3).join(", ")} — may indicate active delivery or platform work.`
              : "May indicate active delivery or platform work — not proof of a tooling gap.",
        cursorRelevance: cursorRelevanceForItem(item, skillsAndTasks),
        confidence: "Medium" as const,
        claimType: "INFERENCE" as const,
      };
    }),
    summary:
      organized.hiring.length > 0
        ? `Found ${organized.hiring.length} live hiring-related sources for ${company}. ${
            cursorSellingAngles.length > 0
              ? `${cursorSellingAngles.length} Cursor-relevant skill/technology angles were extracted from titles and snippets.`
              : "Category counts are keyword matches from public research, not a full job board scrape."
          }`
        : `No strong hiring sources were organized yet for ${company}.`,
  };

  const ROLE_PLACEHOLDERS: Record<
    BuyingCommitteeRole,
    { name: string; title: string }
  > = {
    "EXECUTIVE SPONSOR": {
      name: "[Confirm] CIO / technology executive",
      title: "CIO / Chief Digital Officer",
    },
    "TECHNICAL CHAMPION": {
      name: "[Confirm] VP / Director Engineering",
      title: "VP Engineering / Platform",
    },
    "TECHNICAL EVALUATOR": {
      name: "[Confirm] Enterprise / solution architect",
      title: "Enterprise Architect",
    },
    "SECURITY / GOVERNANCE": {
      name: "[Confirm] CISO / security leader",
      title: "CISO / Security & Governance",
    },
    "ECONOMIC / PROCUREMENT": {
      name: "[Confirm] Procurement / finance owner",
      title: "Procurement / Finance stakeholder",
    },
  };

  const usedRoles = new Set<BuyingCommitteeRole>();
  const buyingCommitteePeople: ExperimentalIntelligence["buyingCommittee"]["people"] =
    [];

  for (const leader of extractedLeaders.slice(0, 5)) {
    // Use title only — shared leadership-page snippets mention many executives
    // and would otherwise mis-map everyone to finance/supply-chain.
    const role = inferBuyingRole(leader.title);
    usedRoles.add(role);

    buyingCommitteePeople.push({
      name: leader.name,
      title: leader.title,
      role,
      relevantInitiative:
        initiativeItems[0]?.title || "Technology / digital priorities",
      potentialPriority: "Technology delivery and digital outcomes",
      whyTheyMayCare:
        "Named in public leadership/technology materials that may relate to tooling and delivery decisions.",
      reasonToContact:
        "Publicly associated with technology leadership — confirm current role before outreach.",
      outreachAngle:
        "Ask how digital/AI priorities are affecting engineering capacity and approved developer tools.",
      evidence: leader.evidence,
      sourceUrl: leader.sourceUrl,
      confidence: "Medium",
      relationshipStatus: "UNKNOWN",
      claimType: "FACT",
      isPlaceholderName: false,
    });
  }

  // Keep every buying-committee lane clear: placeholders instead of article titles.
  (
    [
      "EXECUTIVE SPONSOR",
      "TECHNICAL CHAMPION",
      "TECHNICAL EVALUATOR",
      "SECURITY / GOVERNANCE",
      "ECONOMIC / PROCUREMENT",
    ] as BuyingCommitteeRole[]
  ).forEach((role) => {
    if (usedRoles.has(role)) return;
    const placeholder = ROLE_PLACEHOLDERS[role];
    buyingCommitteePeople.push({
      name: placeholder.name,
      title: placeholder.title,
      role,
      relevantInitiative:
        initiativeItems[0]?.title || "Technology / digital priorities",
      potentialPriority: "Technology delivery and digital outcomes",
      whyTheyMayCare:
        "Role is typically involved in enterprise tooling decisions — confirm the actual person.",
      reasonToContact: "Confirm identity before outreach.",
      outreachAngle:
        "Ask how digital/AI priorities are affecting engineering capacity and approved developer tools.",
      evidence:
        leadershipItems[0]?.snippet ||
        "No clearly named person extracted for this role from live sources yet.",
      sourceUrl: leadershipItems[0]?.url || "",
      confidence: "Low",
      relationshipStatus: "UNKNOWN",
      claimType: "INFERENCE",
      isPlaceholderName: true,
    });
  });

  const buyingCommittee: ExperimentalIntelligence["buyingCommittee"] = {
    isSample: false,
    relationshipNote:
      "Relationships are UNKNOWN unless a public source confirms them. Names appear only when a clear First Last + title pattern is found in live research — otherwise roles stay as confirm placeholders.",
    people: buyingCommitteePeople,
    topPeopleToProspect: [
      {
        name: extractedLeaders[0]
          ? extractedLeaders[0].name
          : ROLE_PLACEHOLDERS["EXECUTIVE SPONSOR"].name,
        title:
          extractedLeaders[0]?.title ||
          ROLE_PLACEHOLDERS["EXECUTIVE SPONSOR"].title,
        role: "EXECUTIVE SPONSOR",
        rankReason:
          "Technology sponsorship usually sits with senior IT/digital leadership.",
        relatedSignal:
          leadershipItems[0]?.title || "Leadership research pending",
        cursorAngle:
          "Governed AI coding tools to support digital delivery capacity.",
        firstConversationTopic:
          "Where software delivery capacity is becoming a constraint.",
      },
      {
        name: extractedLeaders.find(
          (leader) => inferBuyingRole(leader.title) === "TECHNICAL CHAMPION",
        )?.name ||
          extractedLeaders[1]?.name ||
          ROLE_PLACEHOLDERS["TECHNICAL CHAMPION"].name,
        title:
          extractedLeaders.find(
            (leader) => inferBuyingRole(leader.title) === "TECHNICAL CHAMPION",
          )?.title ||
          extractedLeaders[1]?.title ||
          ROLE_PLACEHOLDERS["TECHNICAL CHAMPION"].title,
        role: "TECHNICAL CHAMPION",
        rankReason: "Closest to developer workflow and pilot success.",
        relatedSignal: hiringItems[0]?.title || "Hiring/technology research",
        cursorAngle:
          "Team productivity on active software and integration work.",
        firstConversationTopic:
          "Current developer tooling stack and pilot openness.",
      },
    ],
  };

  const researchText = combinedText(liveResearch.items);
  const snapshotPreview = buildAccountSnapshot(
    company,
    liveResearch.items,
    initiativeItems[0]?.title || techItems[0]?.title || company,
  );
  const complianceSecurity = buildComplianceSecurityIntelligence({
    companyName: company,
    companyWebsite: liveResearch.companyWebsite,
    industry: snapshotPreview.industry,
    headquarters: snapshotPreview.headquarters,
    researchText,
    isSample: false,
  });

  const whyNowSynthesis: ExperimentalIntelligence["whyNowSynthesis"] =
    mergeWhyNowSignals(
      [
        ...initiativeItems.slice(0, 2).map((item) => ({
          trigger: item.title,
          date: item.publishedDate || "Recent (from live research)",
          evidence: item.snippet || item.title,
          source: item.title,
          sourceUrl: item.url,
          relevantPersona: "CIO / digital leadership",
          whyItMatters:
            "Public initiative activity can create timing for outreach.",
          cursorRelevance:
            "May indicate growing software/digital delivery demand — validate with the customer.",
          discoveryQuestion: `Which parts of "${item.title}" are creating the most delivery pressure?`,
          confidence: "Medium" as const,
          claimType: "FACT" as const,
          combinedSignals: [RESEARCH_CATEGORY_LABELS.initiatives],
        })),
        ...(hiringItems[0] && techItems[0]
          ? [
              {
                trigger: "Hiring + technology/AI signals appearing together",
                date: "Recent (from live research)",
                evidence: `${sourceLine(hiringItems[0])} + ${sourceLine(techItems[0])}`,
                source: "Combined live research",
                sourceUrl: hiringItems[0].url,
                relevantPersona: "VP Engineering / Platform",
                whyItMatters:
                  "Combined signals can create a stronger sales hypothesis than either alone.",
                cursorRelevance:
                  "Possible reason to discuss developer productivity and AI-assisted delivery.",
                discoveryQuestion:
                  "Are new initiatives increasing engineering throughput requirements?",
                confidence: "Low" as const,
                claimType: "SALES_HYPOTHESIS" as const,
                combinedSignals: [
                  RESEARCH_CATEGORY_LABELS.hiring,
                  RESEARCH_CATEGORY_LABELS.technology,
                ],
              },
            ]
          : []),
        ...regulatoryTriggersToWhyNowSignals(complianceSecurity.whyNowTriggers),
      ],
      6,
    );

  const researchGaps: ExperimentalIntelligence["researchGaps"] = [
    {
      whatWeDontKnow: "Confirmed developer / engineer population",
      currentEvidence:
        hiringItems[0]?.title ||
        "Hiring sources found, but no confirmed headcount in live research.",
      whyItMatters: "Needed for ROI sizing and rollout planning.",
      whoToAsk: "CIO / VP Engineering",
      discoveryQuestion: `Roughly how many software engineers and builders are in scope at ${company}?`,
    },
    {
      whatWeDontKnow: "Existing AI coding tools already approved or in use",
      currentEvidence:
        organized.ai[0]?.title || "AI-related public sources found, tool stack unknown.",
      whyItMatters: "Determines displacement vs complementary positioning.",
      whoToAsk: "VP Engineering / Platform / DevEx",
      discoveryQuestion: "Which AI coding tools are approved, piloted, or blocked today?",
    },
    {
      whatWeDontKnow: "Budget owner and procurement path",
      currentEvidence:
        financialItems[0]?.title || "No confirmed procurement owner in live research.",
      whyItMatters: "Determines deal path and timeline.",
      whoToAsk: "CIO chief of staff / procurement",
      discoveryQuestion: "Who owns evaluation and budget for developer productivity tools?",
    },
  ];

  const prospectingPlan: ExperimentalIntelligence["prospectingPlan"] = {
    isSample: false,
    whoToTarget: [
      {
        persona: "CIO / technology executive (confirm)",
        whyThem: "Likely sponsor for enterprise developer tooling.",
        talkAbout: "Digital delivery capacity and governed AI adoption.",
        relatedSignal: leadershipItems[0]?.title || initiativeItems[0]?.title || "Live research",
      },
      {
        persona: "VP / Director Engineering (confirm)",
        whyThem: "Best technical champion for a pilot.",
        talkAbout: "Where teams lose time and how AI coding tools could help.",
        relatedSignal: hiringItems[0]?.title || techItems[0]?.title || "Live research",
      },
    ],
    conversationAngles: [
      `${company} shows public initiative/digital activity that may increase software delivery demand.`,
      hiringItems.length > 0
        ? "Hiring-related public signals suggest active technology delivery work."
        : "Technology/AI public signals suggest active modernization or digital work.",
      "Healthcare governance requirements make an approved AI coding path a useful conversation.",
    ],
    strongestWhyNow:
      whyNow[0] ||
      `Public research indicates active technology/digital discussion at ${company}. Validate urgency with the customer.`,
    discoveryQuestions: [
      `Where is ${company} feeling the most pressure to deliver software faster this year?`,
      "Which teams own internal AI or digital product development today?",
      "What AI coding tools are already approved or under evaluation?",
      "Who owns budget for developer productivity platforms?",
      "What would a successful 30-day pilot need to prove?",
    ],
    stillNeedToDiscover: [
      "Developer population",
      "Current AI coding stack",
      "Confirmed buying committee names",
      "Budget owner",
    ],
    outreach: {
      email: `Subject: ${company} digital delivery capacity

Hi {{FirstName}},

I've been reviewing public materials around ${company}'s technology and digital priorities${initiativeItems[0] ? `, including ${initiativeItems[0].title}` : ""}.

I'd value 20 minutes to learn how your engineering teams are balancing delivery speed with quality — and whether governed AI-assisted development is on your radar.

Would next week work for a brief conversation?

Best,
{{YourName}}`,
      coldCallOpener: `Hi {{FirstName}}, this is {{YourName}}. I'm calling because ${company} appears to have active public digital/technology work, and I help engineering leaders evaluate governed AI coding tools. Is now a bad time for 30 seconds?`,
      linkedInMessage: `Hi {{FirstName}} — following ${company}'s public technology/digital priorities. Curious how your teams are approaching developer productivity as that work scales. Open to a short conversation?`,
    },
  };

  const recentHeadline =
    initiativeItems[0]?.title ||
    techItems[0]?.title ||
    hiringItems[0]?.title ||
    `${company} public research summary`;

  const formatOpts = { companyName: company };
  const prospectingBrief = buildProspectingBrief(liveResearch);

  // Keep legacy string lists aligned to the cleaned prospecting brief.
  const briefOpportunitySignals = prospectingBrief.prioritySignals.map(
    (signal) => signal.headline,
  );
  const briefWhyCursor = prospectingBrief.whyCursorNow.map(
    (signal) => `${signal.headline} — ${signal.insight}`,
  );
  const briefWhyNow = prospectingBrief.prioritySignals
    .filter((signal) =>
      ["Identify Pain", "Metrics", "Decision Criteria"].includes(signal.meddpicc),
    )
    .map((signal) => signal.headline);

  return {
    status: "local",
    message: `Local analysis built from ${liveResearch.items.length} organized live sources into a MEDDPICC + Command prospecting brief (no OpenAI required).`,
    model: "local-rules",
    dossierPatch: {
      snapshot: buildAccountSnapshot(company, liveResearch.items, recentHeadline),
      whatsHappening: formatDisplayList(
        whatsHappening.length > 0
          ? whatsHappening
          : [
              `Public research found sources for ${company}, but initiative details are limited.`,
            ],
        formatOpts,
      ),
      techAndAI: formatDisplayList(
        techAndAI.length > 0
          ? techAndAI
          : [`No strong AI/technology sources were organized yet for ${company}.`],
        formatOpts,
      ),
      prospectTargets: prospectTargets.map((target) => ({
        name: formatPersonName(target.name, formatOpts),
        title: formatJobTitle(target.title, formatOpts),
        relevance: formatDisplayText(target.relevance, formatOpts),
      })),
      opportunitySignals: formatDisplayList(
        briefOpportunitySignals.length > 0
          ? briefOpportunitySignals
          : opportunitySignals.length > 0
            ? opportunitySignals
            : [`Review live sources for ${company} to identify outreach timing.`],
        formatOpts,
      ),
      whyCursor: formatDisplayList(
        briefWhyCursor.length > 0 ? briefWhyCursor : whyCursor,
        formatOpts,
      ),
      whyNow: formatDisplayList(
        briefWhyNow.length > 0
          ? briefWhyNow
          : whyNow.length > 0
            ? whyNow
            : [
                `Use live sources on the Sources page to identify timing for ${company}.`,
              ],
        formatOpts,
      ),
      talkTrack: formatDisplayList(
        [
          ...prospectingBrief.discoveryQuestions.slice(0, 3).map((q) => `"${q}"`),
          ...talkTrack.slice(0, 2),
        ],
        {
          ...formatOpts,
          ensurePunctuation: false,
        },
      ),
      prospectingBrief,
      sources: liveResearch.items.slice(0, 20).map((item) => ({
        title: formatHeadline(item.title, formatOpts),
        url: item.url,
      })),
    },
    experimentalPatch: {
      jobIntelligence: {
        ...jobIntelligence,
        summary: formatDisplayText(jobIntelligence.summary, formatOpts),
        cursorSellingAngles: jobIntelligence.cursorSellingAngles.map((angle) => ({
          ...angle,
          skillOrTech: formatHeadline(angle.skillOrTech, formatOpts),
          whyItHelpsSellCursor: formatDisplayText(
            angle.whyItHelpsSellCursor,
            formatOpts,
          ),
          supportingJobs: angle.supportingJobs.map((job) =>
            formatHeadline(job, formatOpts),
          ),
        })),
        signals: jobIntelligence.signals.map((signal) => ({
          ...signal,
          signal: formatHeadline(signal.signal, formatOpts),
          supportingJobPostings: signal.supportingJobPostings.map((posting) =>
            formatHeadline(posting, formatOpts),
          ),
          evidence: formatDisplayText(signal.evidence, formatOpts),
          businessImplication: formatDisplayText(
            signal.businessImplication,
            formatOpts,
          ),
          cursorRelevance: formatDisplayText(signal.cursorRelevance, formatOpts),
        })),
      },
      buyingCommittee: {
        ...buyingCommittee,
        relationshipNote: formatDisplayText(
          buyingCommittee.relationshipNote,
          formatOpts,
        ),
        people: buyingCommittee.people.map((person) => ({
          ...person,
          name: formatPersonName(person.name, formatOpts),
          title: formatJobTitle(person.title, formatOpts),
          relevantInitiative: formatHeadline(person.relevantInitiative, formatOpts),
          potentialPriority: formatDisplayText(person.potentialPriority, formatOpts),
          whyTheyMayCare: formatDisplayText(person.whyTheyMayCare, formatOpts),
          reasonToContact: formatDisplayText(person.reasonToContact, formatOpts),
          outreachAngle: formatDisplayText(person.outreachAngle, formatOpts),
          evidence: formatDisplayText(person.evidence, formatOpts),
        })),
        topPeopleToProspect: buyingCommittee.topPeopleToProspect.map((person) => ({
          ...person,
          name: formatPersonName(person.name, formatOpts),
          title: formatJobTitle(person.title, formatOpts),
          rankReason: formatDisplayText(person.rankReason, formatOpts),
          relatedSignal: formatHeadline(person.relatedSignal, formatOpts),
          cursorAngle: formatDisplayText(person.cursorAngle, formatOpts),
          firstConversationTopic: formatDisplayText(
            person.firstConversationTopic,
            formatOpts,
          ),
        })),
      },
      whyNowSynthesis: whyNowSynthesis.map((signal) => ({
        ...signal,
        trigger: formatHeadline(signal.trigger, formatOpts),
        evidence: formatDisplayText(signal.evidence, formatOpts),
        source: formatHeadline(signal.source, formatOpts),
        relevantPersona: formatJobTitle(signal.relevantPersona, formatOpts),
        whyItMatters: formatDisplayText(signal.whyItMatters, formatOpts),
        cursorRelevance: formatDisplayText(signal.cursorRelevance, formatOpts),
        discoveryQuestion: formatDisplayText(signal.discoveryQuestion, {
          ...formatOpts,
          ensurePunctuation: false,
        }),
      })),
      researchGaps: researchGaps.map((gap) => ({
        ...gap,
        whatWeDontKnow: formatHeadline(gap.whatWeDontKnow, formatOpts),
        currentEvidence: formatDisplayText(gap.currentEvidence, formatOpts),
        whyItMatters: formatDisplayText(gap.whyItMatters, formatOpts),
        whoToAsk: formatHeadline(gap.whoToAsk, formatOpts),
        discoveryQuestion: formatDisplayText(gap.discoveryQuestion, {
          ...formatOpts,
          ensurePunctuation: false,
        }),
      })),
      prospectingPlan: {
        ...prospectingPlan,
        strongestWhyNow: formatDisplayText(
          prospectingPlan.strongestWhyNow,
          formatOpts,
        ),
        conversationAngles: formatDisplayList(
          prospectingPlan.conversationAngles,
          formatOpts,
        ),
        discoveryQuestions: formatDisplayList(prospectingPlan.discoveryQuestions, {
          ...formatOpts,
          ensurePunctuation: false,
        }),
        stillNeedToDiscover: prospectingPlan.stillNeedToDiscover.map((item) =>
          formatHeadline(item, formatOpts),
        ),
        whoToTarget: prospectingPlan.whoToTarget.map((target) => ({
          ...target,
          persona: formatHeadline(target.persona, formatOpts),
          whyThem: formatDisplayText(target.whyThem, formatOpts),
          talkAbout: formatDisplayText(target.talkAbout, formatOpts),
          relatedSignal: formatHeadline(target.relatedSignal, formatOpts),
        })),
      },
      complianceSecurity: {
        ...complianceSecurity,
        disclaimer: formatDisplayText(complianceSecurity.disclaimer, formatOpts),
        accountContextSummary: formatDisplayText(
          complianceSecurity.accountContextSummary,
          formatOpts,
        ),
        discoveryQuestions: formatDisplayList(
          complianceSecurity.discoveryQuestions,
          { ...formatOpts, ensurePunctuation: false },
        ),
        accountImpact: complianceSecurity.accountImpact.map((item) => ({
          ...item,
          requirement: formatHeadline(item.requirement, formatOpts),
          accountImplication: formatDisplayText(
            item.accountImplication,
            formatOpts,
          ),
          potentialCursorConversation: formatDisplayText(
            item.potentialCursorConversation,
            formatOpts,
          ),
          targetPersona: formatJobTitle(item.targetPersona, formatOpts),
          discoveryQuestion: formatDisplayText(item.discoveryQuestion, {
            ...formatOpts,
            ensurePunctuation: false,
          }),
        })),
        whyNowTriggers: complianceSecurity.whyNowTriggers.map((item) => ({
          ...item,
          trigger: formatHeadline(item.trigger, formatOpts),
          accountRelevance: formatDisplayText(item.accountRelevance, formatOpts),
          securityTechImplication: formatDisplayText(
            item.securityTechImplication,
            formatOpts,
          ),
          potentialCursorRelevance: formatDisplayText(
            item.potentialCursorRelevance,
            formatOpts,
          ),
          targetPersona: formatJobTitle(item.targetPersona, formatOpts),
          discoveryQuestion: formatDisplayText(item.discoveryQuestion, {
            ...formatOpts,
            ensurePunctuation: false,
          }),
        })),
      },
    },
  };
}
