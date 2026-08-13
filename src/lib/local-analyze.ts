import type { AiAnalysisResult } from "@/lib/ai-analyze";
import type { ApolloLeadershipResult } from "@/lib/apollo";
import type { BuyingCommitteeRole } from "@/lib/claim-types";
import type { LiveResearchItem, LiveResearchResult } from "@/lib/live-research";
import type {
  CursorHiringAngle,
  CursorHiringAngleCategory,
  ExperimentalIntelligence,
} from "@/lib/experimental-intelligence";
import {
  addFinding,
  buildEvidenceLibrary,
  buildHiringThemes,
  buildJobSalesSignals,
  buildOverview,
  buildStrategicInitiatives,
  buildTechnologySignals,
  buildTopJobTechnologies,
  extractRelevantJobs,
  rankWhyNowSignals,
} from "@/lib/account-signals";
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

export type LocalAnalyzeOptions = {
  apolloLeadership?: ApolloLeadershipResult;
};

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

type TechCatalogEntry = {
  label: string;
  keywords: string[];
  group:
    | "cloud"
    | "language"
    | "devops"
    | "ai"
    | "data"
    | "ehr"
    | "devtools"
    | "security";
};

/** Technologies searched with evidence — do not invent beyond matches. */
const TECH_CATALOG: TechCatalogEntry[] = [
  { label: "GitHub", keywords: ["github"], group: "devtools" },
  { label: "GitLab", keywords: ["gitlab"], group: "devtools" },
  { label: "VS Code", keywords: ["vs code", "vscode", "visual studio code"], group: "devtools" },
  { label: "Azure DevOps", keywords: ["azure devops", "ado "], group: "devtools" },
  { label: "AWS", keywords: ["aws", "amazon web services"], group: "cloud" },
  { label: "Azure", keywords: ["azure", "microsoft azure"], group: "cloud" },
  { label: "GCP", keywords: ["gcp", "google cloud"], group: "cloud" },
  { label: "Python", keywords: ["python"], group: "language" },
  { label: "Java", keywords: [" java ", "java,", "java.", "java developer"], group: "language" },
  { label: "JavaScript", keywords: ["javascript", "node.js", "nodejs"], group: "language" },
  { label: "TypeScript", keywords: ["typescript"], group: "language" },
  { label: ".NET", keywords: [".net", "dotnet", "c#", "c sharp"], group: "language" },
  { label: "Kubernetes", keywords: ["kubernetes", "k8s"], group: "devops" },
  { label: "Docker", keywords: ["docker"], group: "devops" },
  { label: "Terraform", keywords: ["terraform"], group: "devops" },
  { label: "CI/CD", keywords: ["ci/cd", "continuous integration", "continuous delivery"], group: "devops" },
  { label: "Snowflake", keywords: ["snowflake"], group: "data" },
  { label: "Databricks", keywords: ["databricks"], group: "data" },
  { label: "Epic", keywords: ["epic"], group: "ehr" },
  { label: "LLMs", keywords: [" llm", "llms", "large language model"], group: "ai" },
  { label: "Generative AI", keywords: ["generative ai", "genai", "gen ai"], group: "ai" },
  { label: "Copilot", keywords: ["copilot", "github copilot"], group: "ai" },
  { label: "Claude", keywords: ["claude", "anthropic"], group: "ai" },
  { label: "AI coding tools", keywords: ["ai coding", "ai pair", "coding assistant"], group: "ai" },
  { label: "Cerner", keywords: ["cerner"], group: "ehr" },
  { label: "Oracle Health", keywords: ["oracle health"], group: "ehr" },
  { label: "React", keywords: ["react"], group: "language" },
  { label: "Salesforce", keywords: ["salesforce"], group: "devtools" },
  { label: "ServiceNow", keywords: ["servicenow"], group: "devtools" },
  { label: "Kafka", keywords: ["kafka"], group: "data" },
];

const JOB_CATEGORIES: { category: string; keywords: string[] }[] = [
  { category: "Software Engineering", keywords: ["software engineer", "software developer", "full stack", "fullstack"] },
  { category: "Application Development", keywords: ["application developer", "app developer", ".net", "java developer"] },
  { category: "AI / ML", keywords: ["machine learning", "data scientist", "generative ai", " ai engineer", "llm"] },
  { category: "Data Engineering", keywords: ["data engineer", "data platform", "etl", "snowflake", "databricks"] },
  { category: "Cloud", keywords: ["cloud engineer", "cloud architect", "aws", "azure", "gcp", "google cloud"] },
  { category: "Platform Engineering", keywords: ["platform engineer", "platform engineering", "developer experience", "devex"] },
  { category: "DevOps", keywords: ["devops", "sre", "site reliability", "ci/cd", "kubernetes"] },
  { category: "Cybersecurity", keywords: ["security engineer", "cyber", "ciso", "infosec"] },
  { category: "Enterprise Architecture", keywords: ["enterprise architect", "enterprise architecture"] },
  { category: "Epic / Healthcare Applications", keywords: ["epic", "ehr", "cerner", "clinical systems", "integration engineer"] },
];

type TechEvidence = {
  technology: string;
  group: TechCatalogEntry["group"];
  mentionCount: number;
  evidence: string;
  sourceUrl: string;
  sourceTitle: string;
};

function itemMentionsTech(item: LiveResearchItem, entry: TechCatalogEntry) {
  const text = ` ${item.title} ${item.snippet} ${item.url} `.toLowerCase();
  return entry.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function detectTechWithEvidence(items: LiveResearchItem[]): TechEvidence[] {
  const found: TechEvidence[] = [];
  for (const entry of TECH_CATALOG) {
    const matches = items.filter((item) => itemMentionsTech(item, entry));
    if (matches.length === 0) continue;
    const best = matches[0];
    found.push({
      technology: entry.label,
      group: entry.group,
      mentionCount: matches.length,
      evidence: softTruncate(best.snippet || best.title, 220),
      sourceUrl: best.url,
      sourceTitle: best.title,
    });
  }
  return found.sort((a, b) => b.mentionCount - a.mentionCount);
}

function detectTech(items: LiveResearchItem[]) {
  return detectTechWithEvidence(items).map((item) => item.technology);
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

type HiringFrequency = {
  label: string;
  count: number;
  group: "cloud" | "language" | "devops" | "ai" | "devtools" | "security" | "data" | "ehr";
  supportingTitles: string[];
  sourceUrls: string[];
};

function countHiringTechFrequency(items: LiveResearchItem[]): HiringFrequency[] {
  const frequencies: HiringFrequency[] = [];
  for (const entry of TECH_CATALOG) {
    const matches = items.filter((item) => itemMentionsTech(item, entry));
    if (matches.length === 0) continue;
    frequencies.push({
      label: entry.label,
      count: matches.length,
      group: entry.group,
      supportingTitles: matches.slice(0, 4).map((item) => item.title),
      sourceUrls: matches.slice(0, 4).map((item) => item.url),
    });
  }
  return frequencies.sort((a, b) => b.count - a.count);
}

function buildAggregatedHiringSignals(
  company: string,
  hiringItems: LiveResearchItem[],
  frequencies: HiringFrequency[],
): ExperimentalIntelligence["jobIntelligence"]["signals"] {
  const signals: ExperimentalIntelligence["jobIntelligence"]["signals"] = [];
  const total = hiringItems.length;

  const byGroup = (group: HiringFrequency["group"]) =>
    frequencies.filter((item) => item.group === group);

  const pushAgg = (
    signal: string,
    groupItems: HiringFrequency[],
    implication: string,
    claimType: "INFERENCE" | "SALES_HYPOTHESIS",
    cursorRelevance: string,
  ) => {
    if (groupItems.length === 0) return;
    const top = groupItems.slice(0, 5);
    const freqLine = top.map((item) => `${item.count} mention ${item.label}`).join("; ");
    signals.push({
      signal,
      supportingJobPostings: top.flatMap((item) => item.supportingTitles).slice(0, 5),
      supportingJobCount: top.reduce((sum, item) => sum + item.count, 0),
      technologiesDetected: top.map((item) => item.label),
      skillsAndTasks: top.map((item) => item.label),
      evidence: `Across ${total} hiring-related sources: ${freqLine}.`,
      sourceUrls: [...new Set(top.flatMap((item) => item.sourceUrls))].slice(0, 5),
      businessImplication: implication,
      cursorRelevance,
      confidence: top[0].count >= 3 ? "Medium" : "Low",
      claimType,
    });
  };

  pushAgg(
    "CLOUD SIGNALS",
    byGroup("cloud"),
    `Hiring pattern may indicate active cloud platform work at ${company}. This is an inference from public job/tech wording — not confirmation of a specific cloud strategy.`,
    "INFERENCE",
    "SALES HYPOTHESIS: Cloud engineering teams often write infra, services, and integration code where a governed AI coding tool can speed delivery — validate stack and approval path.",
  );
  pushAgg(
    "TECHNOLOGY FREQUENCY",
    frequencies.slice(0, 6),
    `Repeated technology mentions across hiring sources suggest where build work is concentrated. Counts are keyword matches in public sources, not a complete job-board census.`,
    "INFERENCE",
    "SALES HYPOTHESIS: Use the highest-frequency languages/platforms in discovery to ask where custom development creates delivery pressure.",
  );
  pushAgg(
    "DEVELOPER TOOL SIGNALS",
    [...byGroup("devtools"), ...byGroup("devops")],
    `Mentions of developer platforms, CI/CD, or DevOps tooling may indicate investment in engineering delivery systems.`,
    "INFERENCE",
    "SALES HYPOTHESIS: Ask whether AI-assisted coding is part of the approved developer experience — Cursor may fit as a governed productivity layer.",
  );
  pushAgg(
    "AI HIRING SIGNALS",
    byGroup("ai"),
    `AI-related hiring language may indicate build or evaluation work around generative AI / ML — not proof that an AI coding tool is already approved.`,
    "INFERENCE",
    "SALES HYPOTHESIS: If they are hiring for AI build work, ask whether engineering has an approved AI coding path for day-to-day software delivery.",
  );
  pushAgg(
    "HIRING SIGNALS",
    byGroup("language").length > 0 ? byGroup("language") : frequencies.slice(0, 3),
    total >= 4
      ? `Multiple technical hiring sources (${total}) may indicate sustained software delivery demand.`
      : `Limited technical hiring sources were found; treat as a weak signal until careers pages are confirmed.`,
    total >= 4 ? "INFERENCE" : "SALES_HYPOTHESIS",
    "SALES HYPOTHESIS: Active engineering hiring can signal delivery pressure — open with developer productivity and whether capacity is keeping up with digital demand.",
  );

  // Keep a few concrete posting-level signals after aggregates.
  for (const item of hiringItems.slice(0, 3)) {
    const itemTech = detectTech([item]);
    const skillsAndTasks = extractSkillsAndTasks(item);
    signals.push({
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
      confidence: "Medium",
      claimType: "INFERENCE",
    });
  }

  return signals.slice(0, 9);
}

type ExtractedLeader = {
  name: string;
  title: string;
  evidence: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceKind?: "apollo" | "web";
};

function apolloLeadersToExtracted(
  apollo?: ApolloLeadershipResult,
): ExtractedLeader[] {
  if (!apollo || apollo.status !== "live" || apollo.people.length === 0) {
    return [];
  }

  return apollo.people.map((person) => ({
    name: person.name,
    title: person.title,
    evidence: `Apollo people search for ${apollo.companyDomain}: ${person.name}, ${person.title}${
      person.organizationName ? ` at ${person.organizationName}` : ""
    }. Confirm current role before outreach.`,
    sourceUrl:
      person.linkedinUrl ||
      `https://www.apollo.io/people?q=${encodeURIComponent(person.name)}`,
    sourceTitle: `Apollo · ${person.title}`,
    sourceKind: "apollo" as const,
  }));
}

function mergeExtractedLeaders(
  apolloLeaders: ExtractedLeader[],
  webLeaders: ExtractedLeader[],
) {
  const seenNames = new Set<string>();
  const merged: ExtractedLeader[] = [];

  for (const leader of [...apolloLeaders, ...webLeaders]) {
    const key = leader.name.toLowerCase().replace(/\s+/g, " ").trim();
    if (!key || seenNames.has(key)) continue;
    seenNames.add(key);
    merged.push(leader);
  }

  return merged;
}

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
  if (
    /chief (?:ai|data|analytics|nursing|medical|people|human)|chief data officer|chief ai officer/.test(
      t,
    )
  ) {
    return "INFLUENCER";
  }
  if (/chief|president/.test(t)) {
    return "EXECUTIVE SPONSOR";
  }
  if (/director|head of/.test(t)) {
    return "INFLUENCER";
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

  const checks: { keywords: string[]; label: string }[] = [
    {
      keywords: ["form 990", "form990"],
      label: "Form 990 / nonprofit filing signals found in public sources",
    },
    {
      keywords: ["bond offering", "bond disclosure", "bond rating", " bond"],
      label: "Bond / credit disclosure activity appears in public sources",
    },
    {
      keywords: ["capital plan", "capital spending", "capital investment"],
      label: "Capital plan / spending language appears in public sources",
    },
    {
      keywords: ["technology investment", "digital investment", "ai investment"],
      label: "Technology / digital investment language appears in public sources",
    },
    {
      keywords: ["operating margin", "cost pressure", "productivity"],
      label: "Operating margin / cost / productivity pressure language appears in public sources",
    },
    {
      keywords: ["cybersecurity investment", "security investment"],
      label: "Cybersecurity investment language appears in public sources",
    },
    {
      keywords: ["acquisition", "merger"],
      label: "M&A / acquisition language appears in public financial or public docs",
    },
    {
      keywords: ["revenue", "operating income", "audited financial"],
      label: "Revenue / audited financial language appears in public sources",
    },
  ];

  for (const check of checks) {
    if (check.keywords.some((keyword) => text.includes(keyword))) {
      signals.push(check.label);
    }
  }

  for (const item of items.slice(0, 3)) {
    const date = item.publishedDate ? ` (${item.publishedDate})` : "";
    signals.push(`Financial/public source${date}: ${item.title} — ${item.url}`);
  }

  return [...new Set(signals)].slice(0, 8);
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
 * Optional Apollo leadership results enrich Buying Committee names/titles.
 */
export function localAnalyzeAccountResearch(
  liveResearch: LiveResearchResult,
  options?: LocalAnalyzeOptions,
): AiAnalysisResult {
  const apolloLeadership = options?.apolloLeadership;
  const apolloOnlyLeaders = apolloLeadersToExtracted(apolloLeadership);
  const hasLiveResearch =
    liveResearch.status === "live" && liveResearch.items.length > 0;

  // Allow Apollo leadership enrichment even when Tavily research is empty/unavailable.
  if (!hasLiveResearch && apolloOnlyLeaders.length === 0) {
    return {
      status: "no_research",
      message:
        apolloLeadership?.status === "missing_key"
          ? "Local analysis needs live research (Tavily) and/or Apollo leadership (APOLLO_API_KEY)."
          : apolloLeadership?.status === "error"
            ? `Local analysis needs live research sources. Apollo error: ${apolloLeadership.message}`
            : "Local analysis needs live research sources first. Add a Tavily key and research an account.",
    };
  }

  const company = liveResearch.companyName;
  const organized = liveResearch.organized || {
    leadership: [],
    hiring: [],
    ai: [],
    technology: [],
    initiatives: [],
    financial: [],
    compliance: [],
    news: [],
  };
  const initiativeItems = topItems(organized.initiatives, 5);
  const techItems = topItems([...organized.ai, ...organized.technology], 6);
  const hiringItems = topItems(organized.hiring, 10);
  const financialItems = topItems(organized.financial, 5);
  const newsItems = topItems(organized.news || [], 5);
  const complianceItems = topItems(organized.compliance || [], 4);
  const techEvidence = detectTechWithEvidence([
    ...organized.ai,
    ...organized.technology,
    ...organized.hiring,
  ]);
  const techDetected = techEvidence.map((item) => item.technology);
  const hiringFrequencies = countHiringTechFrequency(organized.hiring);
  const webLeaders = hasLiveResearch
    ? extractLeaders([...organized.leadership, ...liveResearch.items]).map(
        (leader) => ({ ...leader, sourceKind: "web" as const }),
      )
    : [];
  const apolloLeaders = apolloOnlyLeaders;
  const extractedLeaders = mergeExtractedLeaders(apolloLeaders, webLeaders);
  const jobCategories = countJobCategories(organized.hiring);
  const financialSignals = detectFinancialSignals(organized.financial);
  const apolloUsed = apolloLeaders.length > 0;

  const whatsHappening = uniqueBullets(
    [
      ...initiativeItems.map((item) => bulletFromItem(item, company)),
      ...newsItems.slice(0, 2).map((item) => bulletFromItem(item, company)),
      ...financialItems.slice(0, 1).map((item) => bulletFromItem(item, company)),
    ],
    7,
  );

  const techAndAI = uniqueBullets(
    [
      ...techEvidence.slice(0, 6).map(
        (item) =>
          `${item.technology} (${item.mentionCount} source${item.mentionCount === 1 ? "" : "s"}): ${item.evidence} — Source: ${item.sourceTitle} (${item.sourceUrl})`,
      ),
      ...techItems
        .slice(0, 3)
        .map((item) => bulletFromItem(item, company)),
    ],
    8,
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
      ...newsItems
        .slice(0, 2)
        .map(
          (item) =>
            `Recent trigger: ${formatHeadline(item.title, { companyName: company })}`,
        ),
      ...initiativeItems
        .slice(0, 2)
        .map(
          (item) =>
            `Public initiative: ${formatHeadline(item.title, { companyName: company })}`,
        ),
      ...hiringItems
        .slice(0, 2)
        .map(
          (item) =>
            `Hiring activity: ${formatHeadline(item.title, { companyName: company })}`,
        ),
      ...techItems
        .slice(0, 1)
        .map(
          (item) =>
            `Technology/AI activity: ${formatHeadline(item.title, { companyName: company })}`,
        ),
      ...complianceItems
        .slice(0, 1)
        .map(
          (item) =>
            `Compliance/security context: ${formatHeadline(item.title, { companyName: company })}`,
        ),
      ...financialItems
        .slice(0, 1)
        .map(
          (item) =>
            `Financial/public signal: ${formatHeadline(item.title, { companyName: company })}`,
        ),
    ],
    8,
  );

  const topHiringFreq = hiringFrequencies.slice(0, 4);
  const whyCursor = uniqueBullets(
    [
      initiativeItems[0]
        ? `WHY CURSOR MAY BE RELEVANT (from evidence): public initiative "${formatHeadline(initiativeItems[0].title, { companyName: company })}" may increase software delivery demand — validate with the customer.`
        : `${company} shows public digital/technology activity that may increase software delivery demand — validate with the customer.`,
      topHiringFreq.length > 0
        ? `Hiring pattern evidence: ${topHiringFreq.map((item) => `${item.count} sources mention ${item.label}`).join("; ")}. SALES HYPOTHESIS: those stacks are where governed AI coding assistance may help — not a confirmed tooling gap.`
        : hiringItems.length > 0
          ? `Technical hiring signals (${organized.hiring.length} live sources) suggest active build or platform work where developer productivity tools may be relevant.`
          : "If engineering delivery capacity is constrained, AI-assisted development may be worth exploring.",
      techEvidence[0]
        ? `Technology evidence: ${techEvidence
            .slice(0, 4)
            .map((item) => item.technology)
            .join(", ")} appear in sourced public materials — use for discovery on where custom development concentrates.`
        : "Confirm technology stack and where custom software work is concentrated.",
      organized.ai.length > 0
        ? "AI-related public activity creates a natural opening to discuss governed AI coding tools for builders (sales hypothesis — confirm approval status)."
        : complianceItems.length > 0
          ? "Compliance/security research context supports asking about an approved developer AI path rather than unmanaged tools."
          : "Even without public AI initiatives, regulated teams often need an approved developer AI path.",
      extractedLeaders[0]
        ? `Buying-committee evidence: ${extractedLeaders[0].name} (${extractedLeaders[0].title}) appears in public leadership materials — confirm before outreach.`
        : "Confirm technology buying committee names from first-party leadership pages before outreach.",
    ],
    6,
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
      ? extractedLeaders.slice(0, 4).map((leader) => ({
          name: leader.name,
          title: leader.title,
          relevance:
            leader.sourceKind === "apollo"
              ? `Apollo leadership match for ${apolloLeadership?.companyDomain || company}. Confirm current role before outreach.`
              : `Extracted from public source: ${formatHeadline(leader.sourceTitle, { companyName: company })}. Confirm before outreach.`,
        }))
      : [];

  const cursorSellingAngles = buildCursorHiringAngles(organized.hiring);
  const aggregatedHiringSignals = buildAggregatedHiringSignals(
    company,
    organized.hiring,
    hiringFrequencies,
  );
  const extractedJobs = extractRelevantJobs(organized.hiring);
  const topJobTechnologies = buildTopJobTechnologies(organized.hiring);
  const hiringThemes = buildHiringThemes(organized.hiring);
  const jobSalesSignals = buildJobSalesSignals(
    company,
    organized.hiring,
    topJobTechnologies,
    hiringThemes,
  );
  const technologySignals = buildTechnologySignals(
    [...organized.ai, ...organized.technology, ...organized.hiring],
    organized.hiring,
  );
  const strategicInitiatives = buildStrategicInitiatives([
    ...organized.initiatives,
    ...organized.news,
    ...organized.ai,
  ]);

  const freqSummary =
    hiringFrequencies.length > 0
      ? ` Technology frequency across hiring sources: ${hiringFrequencies
          .slice(0, 6)
          .map((item) => `${item.count}× ${item.label}`)
          .join(", ")}.`
      : "";

  const jobIntelligence: ExperimentalIntelligence["jobIntelligence"] = {
    isSample: false,
    totalRelevantOpenings: organized.hiring.length,
    categories: jobCategories,
    technologiesDetected: topJobTechnologies.map((item) => item.technology),
    extractedJobs,
    topTechnologies: topJobTechnologies,
    hiringThemes,
    salesSignals: jobSalesSignals,
    cursorSellingAngles,
    signals: aggregatedHiringSignals,
    summary:
      organized.hiring.length > 0
        ? `Found ${organized.hiring.length} live hiring-related sources for ${company}.${freqSummary} Counts are keyword matches in public listings — not a complete job-board census.`
        : `No strong hiring sources were organized yet for ${company}.`,
  };

  const ROLE_NOTES: Record<BuyingCommitteeRole, string> = {
    "EXECUTIVE SPONSOR":
      "No publicly identifiable CIO / CTO / CDO was extracted in this pass.",
    "TECHNICAL CHAMPION":
      "No publicly identifiable VP Engineering / platform leader was extracted in this pass.",
    "TECHNICAL EVALUATOR":
      "No publicly identifiable architect or engineering director was extracted in this pass.",
    "SECURITY / GOVERNANCE":
      "No publicly identifiable CISO / security leader was extracted in this pass.",
    INFLUENCER:
      "No publicly identifiable director-level or adjacent technology leader was extracted in this pass.",
    "ECONOMIC / PROCUREMENT":
      "No publicly identifiable finance / procurement owner was extracted in this pass.",
  };

  const usedRoles = new Set<BuyingCommitteeRole>();
  const buyingCommitteePeople: ExperimentalIntelligence["buyingCommittee"]["people"] =
    [];

  for (const leader of extractedLeaders) {
    const role = inferBuyingRole(leader.title);
    if (buyingCommitteePeople.length >= 8) break;
    usedRoles.add(role);

    const fromApollo = leader.sourceKind === "apollo";
    buyingCommitteePeople.push({
      name: leader.name,
      title: leader.title,
      role,
      roleInferred: true,
      relevantInitiative:
        strategicInitiatives[0]?.initiative ||
        initiativeItems[0]?.title ||
        "Technology / digital priorities (confirm)",
      potentialPriority: "Technology delivery and digital outcomes",
      whyTheyMayCare: fromApollo
        ? "Appears in Apollo technology leadership search for this account domain — likely relevant to tooling and delivery decisions."
        : "Named in public leadership/technology materials that may relate to tooling and delivery decisions.",
      reasonToContact: fromApollo
        ? "Apollo-matched technology leader — confirm current role before outreach."
        : "Publicly associated with technology leadership — confirm current role before outreach.",
      outreachAngle:
        "Ask how digital/AI priorities are affecting engineering capacity and whether an approved AI coding path exists.",
      evidence: leader.evidence,
      sourceUrl: leader.sourceUrl,
      sourceTitle: leader.sourceTitle,
      confidence: "Medium",
      relationshipStatus: "UNKNOWN",
      claimType: "FACT",
      isPlaceholderName: false,
    });
  }

  const buyingCommittee: ExperimentalIntelligence["buyingCommittee"] = {
    isSample: false,
    relationshipNote: apolloUsed
      ? `Named people come from Apollo and/or public web sources. Buying committee roles are INFERRED from title — not proof that someone is involved in purchasing Cursor. Do not treat this as an org chart.`
      : "Named people appear only when a public source supports the name and title. Buying committee roles are INFERRED from title. Add APOLLO_API_KEY to enrich leadership from Apollo.",
    people: buyingCommitteePeople,
    unfilledRoles: (
      [
        "EXECUTIVE SPONSOR",
        "TECHNICAL CHAMPION",
        "TECHNICAL EVALUATOR",
        "SECURITY / GOVERNANCE",
        "INFLUENCER",
        "ECONOMIC / PROCUREMENT",
      ] as BuyingCommitteeRole[]
    )
      .filter((role) => !usedRoles.has(role))
      .map((role) => ({ role, note: ROLE_NOTES[role] })),
    topPeopleToProspect: buyingCommitteePeople.slice(0, 5).map((person) => ({
      name: person.name,
      title: person.title,
      role: person.role,
      rankReason: person.whyTheyMayCare,
      relatedSignal: person.relevantInitiative || hiringItems[0]?.title || "Live research",
      cursorAngle: person.outreachAngle,
      firstConversationTopic: person.outreachAngle,
    })),
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

  const primaryHypothesis = [
    initiativeItems[0]
      ? `PRIMARY SALES HYPOTHESIS: ${company}'s public initiative "${formatHeadline(initiativeItems[0].title, { companyName: company })}" may be creating software delivery pressure`
      : `PRIMARY SALES HYPOTHESIS: ${company} may have digital/technology delivery pressure based on public research`,
    topHiringFreq[0]
      ? ` — supported by hiring mentions of ${topHiringFreq
          .slice(0, 3)
          .map((item) => item.label)
          .join(", ")}`
      : "",
    techEvidence[0]
      ? ` and technology evidence for ${techEvidence
          .slice(0, 3)
          .map((item) => item.technology)
          .join(", ")}`
      : "",
    ". This is a possible opportunity, not a confirmed customer problem.",
  ].join("");

  const whyNowRaw: ExperimentalIntelligence["whyNowSynthesis"] =
    mergeWhyNowSignals(
      [
        ...newsItems.slice(0, 2).map((item) => ({
          trigger: item.title,
          date: item.publishedDate || "Last 12–18 months (from live research)",
          evidence: item.snippet || item.title,
          source: item.title,
          sourceUrl: item.url,
          relevantPersona: "CIO / CISO / digital leadership",
          whyItMatters:
            "Recent public triggers can create outreach timing if they affect technology delivery or leadership priorities.",
          cursorRelevance:
            "Use only if the trigger implies software delivery, AI, security tooling, or modernization — validate with the customer.",
          discoveryQuestion: `How is "${formatHeadline(item.title, { companyName: company })}" changing technology priorities or delivery expectations?`,
          confidence: "Medium" as const,
          claimType: "FACT" as const,
          combinedSignals: [RESEARCH_CATEGORY_LABELS.news],
        })),
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
        ...(hiringFrequencies[0]
          ? [
              {
                trigger: `Hiring pattern: ${hiringFrequencies
                  .slice(0, 4)
                  .map((item) => `${item.count}× ${item.label}`)
                  .join(", ")}`,
                date: "Recent (from live hiring research)",
                evidence: hiringFrequencies
                  .slice(0, 4)
                  .map(
                    (item) =>
                      `${item.count} hiring sources mention ${item.label}`,
                  )
                  .join("; "),
                source: "Aggregated hiring research",
                sourceUrl: hiringFrequencies[0].sourceUrls[0] || "",
                relevantPersona: "VP Engineering / Platform",
                whyItMatters:
                  "INFERENCE: repeated tech mentions across openings can show where build work is concentrated.",
                cursorRelevance:
                  "SALES HYPOTHESIS: position Cursor against the highest-frequency languages/platforms found — not a confirmed tooling gap.",
                discoveryQuestion:
                  "Which engineering stacks are creating the most delivery pressure right now?",
                confidence: "Medium" as const,
                claimType: "INFERENCE" as const,
                combinedSignals: [RESEARCH_CATEGORY_LABELS.hiring],
              },
            ]
          : []),
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
        ...(complianceItems.length > 0
          ? regulatoryTriggersToWhyNowSignals(complianceSecurity.whyNowTriggers).slice(0, 1)
          : []),
      ],
      8,
    );

  const whyNowSynthesis = rankWhyNowSignals(whyNowRaw, 5);

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
        techEvidence.find((item) => item.group === "ai")?.evidence ||
        organized.ai[0]?.title ||
        "AI-related public sources found, tool stack unknown.",
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
    {
      whatWeDontKnow: "Named VP Engineering / Platform / DevOps owners",
      currentEvidence:
        extractedLeaders.find((leader) =>
          /engineer|platform|devops|architect/i.test(leader.title),
        )?.name ||
        (apolloLeadership?.status === "missing_key"
          ? "Apollo key not set; web extraction found no clear engineering VP."
          : "No clearly named engineering VP from Apollo or live web sources."),
      whyItMatters: "Technical champion identity is required for a real pilot path.",
      whoToAsk: "CIO chief of staff / HR leadership page",
      discoveryQuestion: "Who owns engineering productivity and developer experience?",
    },
    ...(apolloLeadership?.status === "missing_key"
      ? [
          {
            whatWeDontKnow: "Apollo-enriched buying committee",
            currentEvidence: apolloLeadership.message,
            whyItMatters:
              "Apollo people search usually returns clearer CIO/CTO/CISO/VP Engineering names than web snippets alone.",
            whoToAsk: "Add APOLLO_API_KEY in .env.local",
            discoveryQuestion:
              "After Apollo is connected, which technology leaders should we prioritize for first outreach?",
          },
        ]
      : []),
    {
      whatWeDontKnow: "Primary-source Form 990 / bond / capital plan detail",
      currentEvidence:
        financialItems[0]?.title ||
        "Financial/public research ran, but deeper filing text may require direct document retrieval.",
      whyItMatters: "Technology investment and margin pressure claims need document-level evidence.",
      whoToAsk: "Finance partner / public filings",
      discoveryQuestion:
        "Where are digital, AI, or cybersecurity investments prioritized in the capital or operating plan?",
    },
  ];

  const outreachAngle1 = initiativeItems[0]
    ? `Initiative angle: reference "${formatHeadline(initiativeItems[0].title, { companyName: company })}" and ask where software delivery is constrained.`
    : `Digital delivery angle: ask where ${company} feels the most pressure to ship software faster.`;
  const outreachAngle2 = topHiringFreq[0]
    ? `Hiring angle: public listings mention ${topHiringFreq
        .slice(0, 3)
        .map((item) => item.label)
        .join(", ")} — ask how those teams handle productivity and AI coding tool approval.`
    : "Hiring angle: confirm active engineering hiring and ask about developer onboarding velocity.";
  const outreachAngle3 = complianceItems[0] || techEvidence.some((item) => item.group === "ai")
    ? "Governance angle: ask how security/compliance reviews AI coding tools and whether an approved path exists for builders."
    : "Governance angle: ask what controls would be required before an enterprise AI coding pilot.";

  const namedTargets = buyingCommitteePeople.slice(0, 5).map((person) => ({
    persona: `${person.name} — ${person.title}`,
    whyThem: person.whyTheyMayCare,
    talkAbout: person.outreachAngle,
    relatedSignal: person.relevantInitiative,
  }));

  const personaFallbacks = [
    {
      persona: "CIO / technology executive (identity not confirmed)",
      whyThem:
        "This persona typically sponsors enterprise developer tooling. Confirm the actual person before outreach.",
      talkAbout: "Digital delivery capacity and whether an approved AI coding path exists.",
      relatedSignal:
        strategicInitiatives[0]?.initiative || initiativeItems[0]?.title || "Live research",
    },
    {
      persona: "VP / Director Engineering (identity not confirmed)",
      whyThem:
        "This persona is typically closest to developer workflow and a possible pilot. Confirm the actual person.",
      talkAbout: topHiringFreq[0]
        ? `Where ${topHiringFreq[0].label} and related stacks create delivery pressure.`
        : "Where teams lose time and how AI coding tools could help.",
      relatedSignal: hiringItems[0]?.title || techItems[0]?.title || "Live research",
    },
    {
      persona: "CISO / security governance (identity not confirmed)",
      whyThem:
        "This persona often gates AI developer tooling in healthcare. Confirm the actual person.",
      talkAbout: "Approved AI coding path, shadow AI, and third-party risk.",
      relatedSignal:
        complianceItems[0]?.title || newsItems[0]?.title || "Compliance research",
    },
  ];

  const prospectingPlan: ExperimentalIntelligence["prospectingPlan"] = {
    isSample: false,
    whoToTarget: namedTargets.length > 0 ? namedTargets : personaFallbacks,
    conversationAngles: [outreachAngle1, outreachAngle2, outreachAngle3],
    strongestWhyNow:
      whyNowSynthesis[0]?.trigger ||
      whyNow[0] ||
      `Public research indicates active technology/digital discussion at ${company}. Validate urgency with the customer.`,
    discoveryQuestions: [
      `Where is ${company} feeling the most pressure to deliver software faster this year?`,
      topHiringFreq[0]
        ? `Public hiring mentions ${topHiringFreq
            .slice(0, 3)
            .map((item) => item.label)
            .join(", ")} — which of those stacks create the most delivery bottleneck?`
        : "Which teams own internal AI or digital product development today?",
      "What AI coding tools are already approved, piloted, or blocked today?",
      "Who owns budget and security review for developer productivity platforms?",
      "What would a successful 30-day governed pilot need to prove for engineering and security?",
    ],
    stillNeedToDiscover: [
      "Developer population",
      "Current AI coding stack",
      "Confirmed buying committee names",
      "Budget owner",
      "Primary financial filing detail (990/bonds/capital)",
      ...(extractedLeaders.length === 0
        ? ["Named technology executives from first-party pages"]
        : []),
    ],
    outreach: {
      email: `Subject: ${company} digital delivery capacity

Hi {{FirstName}},

I've been reviewing public materials around ${company}'s technology and digital priorities${initiativeItems[0] ? `, including ${formatHeadline(initiativeItems[0].title, { companyName: company })}` : ""}${topHiringFreq[0] ? `. Hiring-related sources also mention ${topHiringFreq.slice(0, 2).map((item) => item.label).join(" and ")}` : ""}.

I'd value 20 minutes to learn how your engineering teams are balancing delivery speed with quality — and whether a governed AI-assisted development path is on your radar.

Would next week work for a brief conversation?

Best,
{{YourName}}`,
      coldCallOpener: `Hi {{FirstName}}, this is {{YourName}}. I'm calling because ${company} has public digital/technology signals${initiativeItems[0] ? ` around ${formatHeadline(initiativeItems[0].title, { companyName: company })}` : ""}, and I help engineering leaders evaluate governed AI coding tools. Is now a bad time for 30 seconds?`,
      linkedInMessage: `Hi {{FirstName}} — following ${company}'s public technology/digital priorities${topHiringFreq[0] ? ` and hiring signals around ${topHiringFreq[0].label}` : ""}. Curious how your teams are approaching developer productivity as that work scales. Open to a short conversation?`,
    },
  };

  const findingsByUrl = new Map<string, string[]>();
  for (const person of buyingCommitteePeople) {
    addFinding(findingsByUrl, person.sourceUrl, `${person.name} — ${person.title}`);
  }
  for (const signal of technologySignals) {
    addFinding(findingsByUrl, signal.sourceUrl, `Technology: ${signal.technology}`);
  }
  for (const job of extractedJobs) {
    addFinding(findingsByUrl, job.sourceUrl, `Job: ${job.title}`);
  }
  for (const initiative of strategicInitiatives) {
    addFinding(findingsByUrl, initiative.sourceUrl, `Initiative: ${initiative.initiative}`);
  }
  for (const signal of whyNowSynthesis) {
    addFinding(findingsByUrl, signal.sourceUrl, `Why Now: ${signal.trigger}`);
  }

  const evidenceLibrary = buildEvidenceLibrary({
    items: liveResearch.items,
    findingsByUrl,
  });

  const snapshotForOverview = buildAccountSnapshot(
    company,
    liveResearch.items,
    initiativeItems[0]?.title || techItems[0]?.title || company,
  );
  const overview = buildOverview({
    companyName: company,
    snapshotIndustry: snapshotForOverview.industry,
    snapshotScale: snapshotForOverview.sizeSignal,
    initiatives: strategicInitiatives,
    technologySignals,
    whyNow: whyNowSynthesis,
    people: buyingCommitteePeople.map((person) => ({
      name: person.name,
      title: person.title,
      role: person.role,
    })),
    salesAngle:
      prospectingPlan.conversationAngles[0] ||
      primaryHypothesis,
  });

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
    message: apolloUsed
      ? `Local analysis built from ${liveResearch.items.length} live sources + ${apolloLeaders.length} Apollo leadership matches for buying committee.`
      : `Local analysis built from ${liveResearch.items.length} organized live sources (no OpenAI required).${
          apolloLeadership?.status === "missing_key"
            ? " Add APOLLO_API_KEY to enrich leadership/buying committee."
            : apolloLeadership?.status === "error"
              ? ` Apollo enrichment error: ${apolloLeadership.message}`
              : ""
        }`,
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
      overview: {
        ...overview,
        executiveBrief: formatDisplayText(overview.executiveBrief, formatOpts),
        recommendedSalesAngle: formatDisplayText(
          overview.recommendedSalesAngle,
          formatOpts,
        ),
        whyNow: overview.whyNow.map((item) => ({
          trigger: formatHeadline(item.trigger, formatOpts),
          evidence: formatDisplayText(item.evidence, formatOpts),
        })),
        initiatives: overview.initiatives.map((item) =>
          formatHeadline(item, formatOpts),
        ),
        peopleToEngage: overview.peopleToEngage.map((person) => ({
          ...person,
          name: formatPersonName(person.name, formatOpts),
          title: formatJobTitle(person.title, formatOpts),
        })),
      },
      technologySignals: technologySignals.map((signal) => ({
        ...signal,
        evidence: formatDisplayText(signal.evidence, formatOpts),
        sourceTitle: formatHeadline(signal.sourceTitle, formatOpts),
        whyItMayMatter: formatDisplayText(signal.whyItMayMatter, formatOpts),
      })),
      strategicInitiatives: strategicInitiatives.map((item) => ({
        ...item,
        initiative: formatHeadline(item.initiative, formatOpts),
        whatIsHappening: formatDisplayText(item.whatIsHappening, formatOpts),
        evidence: formatDisplayText(item.evidence, formatOpts),
        sourceTitle: formatHeadline(item.sourceTitle, formatOpts),
        technologyImplication: formatDisplayText(
          item.technologyImplication,
          formatOpts,
        ),
        cursorRelevance: item.cursorRelevance
          ? formatDisplayText(item.cursorRelevance, formatOpts)
          : undefined,
        executiveInvolved: item.executiveInvolved
          ? formatPersonName(item.executiveInvolved, formatOpts)
          : undefined,
      })),
      evidenceLibrary: evidenceLibrary.map((source) => ({
        ...source,
        title: formatHeadline(source.title, formatOpts),
      })),
      jobIntelligence: {
        ...jobIntelligence,
        summary: formatDisplayText(jobIntelligence.summary, formatOpts),
        extractedJobs: jobIntelligence.extractedJobs.map((job) => ({
          ...job,
          title: formatJobTitle(job.title, formatOpts),
          responsibilities: formatDisplayText(job.responsibilities, {
            ...formatOpts,
            ensurePunctuation: false,
          }),
          sourceTitle: formatHeadline(job.sourceTitle, formatOpts),
        })),
        salesSignals: jobIntelligence.salesSignals.map((signal) => ({
          ...signal,
          fact: formatDisplayText(signal.fact, formatOpts),
          inference: formatDisplayText(signal.inference, formatOpts),
          salesHypothesis: formatDisplayText(signal.salesHypothesis, formatOpts),
        })),
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
