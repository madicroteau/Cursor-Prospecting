/**
 * Structured account signals from public research.
 * Conservative: FACT from evidence, INFERENCE labeled, no invented people/tech.
 */

import type { Confidence } from "@/lib/claim-types";
import type { LiveResearchItem } from "@/lib/live-research";
import type {
  EvidenceSource,
  ExtractedJob,
  HiringTheme,
  JobSalesSignal,
  OverviewIntelligence,
  SourceGroup,
  StrategicInitiative,
  TechFrequency,
  TechnologyCategory,
  TechnologySignal,
  WhyNowSignal,
} from "@/lib/experimental-intelligence";

type TechCatalogEntry = {
  label: string;
  keywords: string[];
  category: TechnologyCategory;
  whyItMayMatter: string;
};

const TECH_CATALOG: TechCatalogEntry[] = [
  {
    label: "GitHub",
    keywords: ["github"],
    category: "Source control",
    whyItMayMatter:
      "Source-control mentions can indicate where engineering work lives — relevant if Cursor would connect to existing repositories.",
  },
  {
    label: "GitLab",
    keywords: ["gitlab"],
    category: "Source control",
    whyItMayMatter:
      "GitLab mentions may indicate a hosted SCM/CI environment worth confirming in discovery.",
  },
  {
    label: "Azure DevOps",
    keywords: ["azure devops", "ado "],
    category: "Developer tools",
    whyItMayMatter:
      "Azure DevOps mentions can point to Microsoft-centric delivery tooling — confirm whether repos and pipelines sit there.",
  },
  {
    label: "VS Code",
    keywords: ["vs code", "vscode", "visual studio code"],
    category: "Developer tools",
    whyItMayMatter:
      "VS Code familiarity can make an AI coding assistant conversation more concrete for engineering teams.",
  },
  {
    label: "AWS",
    keywords: ["aws", "amazon web services"],
    category: "Cloud",
    whyItMayMatter:
      "Cloud platform work often includes services and integration code where developer productivity tools may be relevant.",
  },
  {
    label: "Azure",
    keywords: ["azure", "microsoft azure"],
    category: "Cloud",
    whyItMayMatter:
      "Azure appearing in public materials may indicate cloud engineering work — not proof the organization is standardized on Azure.",
  },
  {
    label: "GCP",
    keywords: ["gcp", "google cloud"],
    category: "Cloud",
    whyItMayMatter:
      "Google Cloud mentions can indicate cloud engineering or data-platform work worth validating.",
  },
  {
    label: "Python",
    keywords: ["python"],
    category: "Programming languages",
    whyItMayMatter:
      "Language mentions in jobs or tech pages can show where production code is being written.",
  },
  {
    label: "Java",
    keywords: [" java ", "java,", "java.", "java developer"],
    category: "Programming languages",
    whyItMayMatter:
      "Java hiring or documentation can indicate enterprise application development volume.",
  },
  {
    label: "JavaScript",
    keywords: ["javascript", "node.js", "nodejs"],
    category: "Programming languages",
    whyItMayMatter:
      "JavaScript/Node mentions often map to web, integration, or digital-product work.",
  },
  {
    label: "TypeScript",
    keywords: ["typescript"],
    category: "Programming languages",
    whyItMayMatter:
      "TypeScript usage typically means active application engineering — a natural Cursor conversation.",
  },
  {
    label: ".NET",
    keywords: [".net", "dotnet"],
    category: "Programming languages",
    whyItMayMatter:
      ".NET mentions can indicate Microsoft-stack application development.",
  },
  {
    label: "C#",
    keywords: ["c#", "c sharp", "csharp"],
    category: "Programming languages",
    whyItMayMatter:
      "C# mentions usually travel with .NET application work.",
  },
  {
    label: "Kubernetes",
    keywords: ["kubernetes", "k8s"],
    category: "Infrastructure",
    whyItMayMatter:
      "Kubernetes mentions can indicate platform/DevOps engineering, not organization-wide adoption.",
  },
  {
    label: "Docker",
    keywords: ["docker"],
    category: "Infrastructure",
    whyItMayMatter:
      "Container tooling mentions may indicate modern delivery practices on some teams.",
  },
  {
    label: "Terraform",
    keywords: ["terraform"],
    category: "Infrastructure",
    whyItMayMatter:
      "Infrastructure-as-code mentions can indicate platform engineering work.",
  },
  {
    label: "CI/CD",
    keywords: ["ci/cd", "continuous integration", "continuous delivery"],
    category: "CI/CD",
    whyItMayMatter:
      "CI/CD language suggests investment in software delivery systems.",
  },
  {
    label: "Snowflake",
    keywords: ["snowflake"],
    category: "Data platforms",
    whyItMayMatter:
      "Data-platform mentions can indicate analytics engineering adjacent to software delivery.",
  },
  {
    label: "Databricks",
    keywords: ["databricks"],
    category: "Data platforms",
    whyItMayMatter:
      "Databricks mentions may indicate data/AI platform engineering.",
  },
  {
    label: "Epic",
    keywords: ["epic ehr", " epic ", "epic systems", "epic analyst", "epic developer"],
    category: "Enterprise applications",
    whyItMayMatter:
      "Epic-adjacent work is often integration-heavy. Cursor relevance is strongest for custom/integration software around the EHR — validate with engineering.",
  },
  {
    label: "Generative AI",
    keywords: ["generative ai", "genai", "gen ai"],
    category: "AI/ML",
    whyItMayMatter:
      "Public generative-AI language can open a conversation about approved AI tools for builders — not proof an AI coding tool is already in use.",
  },
  {
    label: "LLMs",
    keywords: [" llm", "llms", "large language model"],
    category: "AI/ML",
    whyItMayMatter:
      "LLM mentions may indicate AI build or evaluation work worth confirming.",
  },
  {
    label: "Copilot",
    keywords: ["github copilot", "microsoft copilot", "copilot"],
    category: "AI/ML",
    whyItMayMatter:
      "Copilot mentions can indicate existing AI-assistant evaluation. Treat as a competitive/complementary discovery topic, not a confirmed standard.",
  },
  {
    label: "Claude",
    keywords: ["claude", "anthropic"],
    category: "AI/ML",
    whyItMayMatter:
      "Claude/Anthropic mentions may indicate generative-AI exploration — confirm whether that includes developer tooling.",
  },
];

const JOB_THEMES: { theme: string; keywords: string[] }[] = [
  { theme: "Software Engineering", keywords: ["software engineer", "software developer", "full stack", "fullstack"] },
  { theme: "Application Development", keywords: ["application developer", "app developer", "application development"] },
  { theme: "AI / ML", keywords: ["machine learning", "data scientist", "generative ai", "ai engineer", "llm"] },
  { theme: "Data Engineering", keywords: ["data engineer", "data platform", "etl"] },
  { theme: "Cloud Engineering", keywords: ["cloud engineer", "cloud architect", "aws", "azure", "gcp"] },
  { theme: "Platform Engineering", keywords: ["platform engineer", "platform engineering", "developer experience"] },
  { theme: "DevOps", keywords: ["devops", "sre", "site reliability", "ci/cd", "kubernetes"] },
  { theme: "Cybersecurity", keywords: ["security engineer", "cyber", "infosec"] },
  { theme: "Enterprise Architecture", keywords: ["enterprise architect", "enterprise architecture"] },
  { theme: "Application Modernization", keywords: ["modernization", "legacy", "refactor", "migration"] },
  { theme: "Epic / Clinical Technology", keywords: ["epic", "ehr", "cerner", "clinical systems"] },
];

const INITIATIVE_THEMES: {
  label: string;
  keywords: string[];
  techImplication: string;
  cursorRelevance?: string;
}[] = [
  {
    label: "AI / Generative AI",
    keywords: ["generative ai", "artificial intelligence", "machine learning", "llm", "genai"],
    techImplication: "May increase demand for internal software that uses or supports AI.",
    cursorRelevance:
      "If builders are expected to ship AI-enabled software, ask whether they have an approved AI coding path.",
  },
  {
    label: "Digital transformation",
    keywords: ["digital transformation", "digital health", "digital front", "digital strategy"],
    techImplication: "Digital programs often increase custom software and integration work.",
    cursorRelevance:
      "Ask where digital delivery is constrained by engineering capacity.",
  },
  {
    label: "Cloud modernization",
    keywords: ["cloud migration", "cloud modernization", "azure", "aws", "google cloud"],
    techImplication: "Cloud programs typically require platform and application engineering.",
    cursorRelevance:
      "Cloud engineering teams often write infra and service code where a governed AI coding tool can help — validate stack and approval path.",
  },
  {
    label: "Application modernization",
    keywords: ["application modernization", "legacy", "modernize applications"],
    techImplication: "Modernization usually means changing existing codebases.",
    cursorRelevance:
      "Large-codebase modernization is a strong place to discuss AI-assisted development.",
  },
  {
    label: "Software development",
    keywords: ["software development", "software engineering", "internal development"],
    techImplication: "Direct signal of in-house build work.",
    cursorRelevance: "Open with developer productivity and current coding-tool standards.",
  },
  {
    label: "Automation",
    keywords: ["automation", "rpa", "workflow automation"],
    techImplication: "Automation programs can include custom scripts and integrations.",
  },
  {
    label: "Cybersecurity",
    keywords: ["cybersecurity", "information security", "zero trust"],
    techImplication: "Security programs can affect how developer tools are approved.",
    cursorRelevance:
      "Lead with governance, privacy, and an approved path for AI coding tools rather than unmanaged consumer tools.",
  },
  {
    label: "Data modernization",
    keywords: ["data modernization", "data platform", "analytics platform"],
    techImplication: "Data platforms often require engineering around pipelines and services.",
  },
  {
    label: "Epic / clinical technology",
    keywords: ["epic", "ehr", "electronic health record", "clinical technology"],
    techImplication: "EHR ecosystems typically create ongoing integration and adjacent application work.",
    cursorRelevance:
      "Cursor relevance is strongest for custom/integration software around Epic — not for the EHR product itself.",
  },
  {
    label: "Patient experience technology",
    keywords: ["patient experience", "patient portal", "digital front door", "virtual care"],
    techImplication: "Patient-facing digital products usually require web/mobile engineering.",
  },
  {
    label: "M&A",
    keywords: ["acquisition", "merger", "acquire"],
    techImplication: "M&A can create integration and system-consolidation engineering work.",
  },
  {
    label: "Expansion",
    keywords: ["expansion", "new hospital", "new campus", "opens "],
    techImplication: "Expansion can increase demand for digital and operational systems.",
  },
  {
    label: "Cost optimization",
    keywords: ["cost reduction", "operating margin", "productivity", "efficiency"],
    techImplication: "Cost pressure can support a productivity conversation if engineering capacity is constrained.",
  },
  {
    label: "Developer productivity",
    keywords: ["developer productivity", "developer experience", "devex"],
    techImplication: "Direct language about builder productivity.",
    cursorRelevance: "This is a direct opening to discuss governed AI coding tools.",
  },
];

const AI_TERMS = ["generative ai", "genai", "machine learning", "llm", "artificial intelligence", "copilot", "claude"];
const CLOUD_TERMS = ["aws", "azure", "gcp", "google cloud", "kubernetes", "terraform", "cloud"];
const DEVTOOL_TERMS = ["github", "gitlab", "azure devops", "vs code", "ci/cd", "docker", "jira"];

function softTruncate(text: string, max: number) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const slice = cleaned.slice(0, max);
  const sentenceEnd = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("? "),
    slice.lastIndexOf("! "),
  );
  if (sentenceEnd > max * 0.45) return slice.slice(0, sentenceEnd + 1).trim();
  const wordEnd = slice.lastIndexOf(" ");
  return `${(wordEnd > 40 ? slice.slice(0, wordEnd) : slice).trim()}…`;
}

function itemText(item: LiveResearchItem) {
  return ` ${item.title} ${item.snippet} ${item.url} `.toLowerCase();
}

function mentions(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function confidenceFromCount(count: number): Confidence {
  if (count >= 4) return "Medium";
  if (count >= 2) return "Medium";
  return "Low";
}

function evidenceClaim(technology: string, count: number, fromJobs: boolean): string {
  if (fromJobs && count > 1) {
    return `FACT: ${count} job-related sources mention ${technology}.`;
  }
  if (fromJobs) {
    return `FACT: A job-related source mentions ${technology}.`;
  }
  if (count > 1) {
    return `FACT: ${count} public sources mention ${technology}.`;
  }
  return `FACT: A public source mentions ${technology}.`;
}

export function publisherFromUrl(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "");
    if (host.includes("adventhealth.com")) return "AdventHealth";
    if (host.includes("indeed.com")) return "Indeed";
    if (host.includes("linkedin.com")) return "LinkedIn";
    if (host.includes("myworkdayjobs.com") || host.includes("workday.com")) {
      return "Workday";
    }
    if (host.includes("modernhealthcare.com")) return "Modern Healthcare";
    if (host.includes("healthcareitnews.com")) return "Healthcare IT News";
    if (host.includes("beckershospitalreview.com")) return "Becker's Hospital Review";
    if (host.includes("irs.gov")) return "IRS";
    if (host.includes("hhs.gov")) return "HHS";
    return host;
  } catch {
    return "Unknown publisher";
  }
}

export function sourceGroupFromBucket(bucket: string): SourceGroup {
  switch (bucket) {
    case "leadership":
      return "People";
    case "hiring":
      return "Jobs";
    case "ai":
    case "technology":
      return "Technology";
    case "initiatives":
      return "Initiatives";
    case "news":
      return "News";
    case "financial":
      return "Financial/Public";
    case "compliance":
      return "Regulatory";
    default:
      return "Company";
  }
}

export function buildTechnologySignals(
  items: LiveResearchItem[],
  hiringItems: LiveResearchItem[],
): TechnologySignal[] {
  const signals: TechnologySignal[] = [];

  for (const entry of TECH_CATALOG) {
    const matches = items.filter((item) => mentions(itemText(item), entry.keywords));
    if (matches.length === 0) continue;
    const jobMatches = hiringItems.filter((item) =>
      mentions(itemText(item), entry.keywords),
    );
    const best = matches[0];
    const count = matches.length;
    const fromJobs = jobMatches.length > 0;
    signals.push({
      technology: entry.label,
      category: entry.category,
      evidence: `${evidenceClaim(entry.label, fromJobs ? jobMatches.length : count, fromJobs)} ${softTruncate(best.snippet || best.title, 180)}`,
      sourceTitle: best.title,
      sourceUrl: best.url,
      mentionCount: count,
      confidence: confidenceFromCount(count),
      whyItMayMatter: `INFERENCE: ${entry.whyItMayMatter}`,
      claimType: "FACT",
    });
  }

  return signals.sort((a, b) => b.mentionCount - a.mentionCount).slice(0, 8);
}

function extractTerms(text: string, catalog: string[]) {
  return catalog.filter((term) => text.includes(term)).map((term) => {
    if (term === "genai") return "Generative AI";
    if (term === "llm") return "LLM";
    return term.replace(/\b\w/g, (char) => char.toUpperCase());
  });
}

function extractLocation(text: string) {
  const match = text.match(
    /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?,\s*(?:FL|TX|GA|NC|TN|KS|KY|CO|WI|IL|CA|NY|WA|AZ|OH|PA|Remote))\b/,
  );
  if (match?.[1]) return match[1];
  if (/\bremote\b/i.test(text)) return "Remote";
  return "Not stated in source";
}

function extractDepartment(text: string) {
  const match = text.match(
    /\b(Information Technology|IT|Digital|Engineering|Software|Platform|Cybersecurity|Clinical Informatics|Data|Cloud)\b/i,
  );
  return match?.[1] || "Not stated in source";
}

function isRelevantTechnicalJob(item: LiveResearchItem) {
  const text = itemText(item);
  return JOB_THEMES.some((theme) => mentions(text, theme.keywords));
}

export function extractRelevantJobs(hiringItems: LiveResearchItem[]): ExtractedJob[] {
  return hiringItems
    .filter(isRelevantTechnicalJob)
    .slice(0, 8)
    .map((item) => {
      const text = itemText(item);
      const technologies = TECH_CATALOG.filter((entry) =>
        mentions(text, entry.keywords),
      ).map((entry) => entry.label);
      return {
        title: item.title.replace(/\s*[|\-–].*$/, "").trim() || item.title,
        department: extractDepartment(`${item.title} ${item.snippet}`),
        location: extractLocation(`${item.title} ${item.snippet}`),
        technologies,
        responsibilities: softTruncate(item.snippet || item.title, 220),
        aiTerminology: extractTerms(text, AI_TERMS),
        cloudTerminology: extractTerms(text, CLOUD_TERMS),
        developerTooling: extractTerms(text, DEVTOOL_TERMS),
        sourceTitle: item.title,
        sourceUrl: item.url,
      };
    });
}

export function buildTopJobTechnologies(hiringItems: LiveResearchItem[]): TechFrequency[] {
  const frequencies: TechFrequency[] = [];
  for (const entry of TECH_CATALOG) {
    const count = hiringItems.filter((item) =>
      mentions(itemText(item), entry.keywords),
    ).length;
    if (count === 0) continue;
    frequencies.push({ technology: entry.label, count });
  }
  return frequencies.sort((a, b) => b.count - a.count).slice(0, 8);
}

export function buildHiringThemes(hiringItems: LiveResearchItem[]): HiringTheme[] {
  return JOB_THEMES.map((theme) => {
    const matches = hiringItems.filter((item) =>
      mentions(itemText(item), theme.keywords),
    );
    return {
      theme: theme.theme,
      count: matches.length,
      evidence:
        matches.length > 0
          ? `FACT: ${matches.length} hiring-related source${matches.length === 1 ? "" : "s"} match ${theme.theme}.`
          : "",
    };
  })
    .filter((theme) => theme.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function buildJobSalesSignals(
  company: string,
  hiringItems: LiveResearchItem[],
  topTechnologies: TechFrequency[],
  hiringThemes: HiringTheme[],
): JobSalesSignal[] {
  const signals: JobSalesSignal[] = [];
  const ai = topTechnologies.filter((item) =>
    /generative ai|llm|copilot|claude/i.test(item.technology),
  );
  const cloud = topTechnologies.filter((item) =>
    /azure|aws|gcp/i.test(item.technology),
  );
  const languages = topTechnologies.filter((item) =>
    /python|java|javascript|typescript|\.net|c#/i.test(item.technology),
  );

  if (ai.length > 0 && cloud.length > 0) {
    signals.push({
      fact: `Multiple current technical openings reference ${ai.map((item) => item.technology).join(" / ")} and ${cloud.map((item) => item.technology).join(" / ")}.`,
      inference: `The organization appears to be investing in internal AI and cloud capabilities. This is an inference from public job wording — not confirmation of a specific AI coding tool.`,
      salesHypothesis: `Expansion of AI-enabled software development could create a conversation around developer productivity and enterprise AI development tooling.`,
      sourceUrls: hiringItems.slice(0, 3).map((item) => item.url),
      confidence: "Medium",
    });
  } else if (cloud.length > 0) {
    signals.push({
      fact: `Hiring-related sources mention ${cloud.map((item) => `${item.technology} (${item.count})`).join(", ")}.`,
      inference: `${cloud[0].technology} appears to be part of the organization's technology environment. Do not treat this as proof of an enterprise standard.`,
      salesHypothesis: `Cloud engineering work can create delivery pressure where a governed AI coding tool may be relevant — validate stack and approval path.`,
      sourceUrls: hiringItems.slice(0, 3).map((item) => item.url),
      confidence: confidenceFromCount(cloud[0].count),
    });
  }

  if (languages.length > 0) {
    signals.push({
      fact: `Public hiring sources mention ${languages
        .slice(0, 4)
        .map((item) => `${item.technology} (${item.count})`)
        .join(", ")}.`,
      inference: `These languages appear in technical hiring, which may indicate where production software is being written.`,
      salesHypothesis: `Use the highest-frequency languages in discovery to ask where custom development creates delivery pressure.`,
      sourceUrls: hiringItems.slice(0, 3).map((item) => item.url),
      confidence: confidenceFromCount(languages[0].count),
    });
  }

  const topTheme = hiringThemes[0];
  if (topTheme && hiringItems.length >= 3) {
    signals.push({
      fact: `${hiringItems.length} hiring-related sources were organized for ${company}; the strongest theme is ${topTheme.theme} (${topTheme.count}).`,
      inference: `Sustained technical hiring may indicate ongoing software delivery demand.`,
      salesHypothesis: `Active engineering hiring can support a conversation about developer productivity — not proof of a tooling gap.`,
      sourceUrls: hiringItems.slice(0, 3).map((item) => item.url),
      confidence: "Medium",
    });
  }

  return signals.slice(0, 3);
}

function classifyInitiative(item: LiveResearchItem) {
  const text = itemText(item);
  for (const theme of INITIATIVE_THEMES) {
    if (mentions(text, theme.keywords)) return theme;
  }
  return null;
}

function extractExecutiveName(text: string) {
  const match = text.match(
    /\b((?:CIO|CTO|CISO|CDO|CEO)\s+[A-Z][a-z]+\s+[A-Z][a-z]+|[A-Z][a-z]+\s+[A-Z][a-z]+\s*,?\s+(?:CIO|CTO|CISO|Chief (?:Information|Technology|Digital|Data) Officer))\b/,
  );
  return match?.[1];
}

export function buildStrategicInitiatives(
  items: LiveResearchItem[],
): StrategicInitiative[] {
  const used = new Set<string>();
  const initiatives: StrategicInitiative[] = [];

  for (const item of items) {
    const theme = classifyInitiative(item);
    if (!theme) continue;
    if (used.has(theme.label)) continue;
    used.add(theme.label);
    const executive = extractExecutiveName(`${item.title} ${item.snippet}`);
    initiatives.push({
      initiative: theme.label,
      whatIsHappening: softTruncate(item.snippet || item.title, 240),
      timeframe: item.publishedDate || "Timeframe not clearly stated in source",
      executiveInvolved: executive,
      evidence: `FACT: Public source discusses this theme — ${item.title}.`,
      sourceTitle: item.title,
      sourceUrl: item.url,
      technologyImplication: `INFERENCE: ${theme.techImplication}`,
      cursorRelevance: theme.cursorRelevance
        ? `SALES HYPOTHESIS: ${theme.cursorRelevance}`
        : undefined,
      confidence: item.publishedDate ? "Medium" : "Low",
      claimType: "FACT",
    });
    if (initiatives.length >= 6) break;
  }

  return initiatives;
}

function whyNowScore(signal: WhyNowSignal) {
  let score = 0;
  if (signal.confidence === "High") score += 3;
  if (signal.confidence === "Medium") score += 2;
  if (signal.confidence === "Low") score += 1;
  score += Math.min(signal.combinedSignals?.length || 0, 3);
  if (/hiring|ai|cloud|initiative|digital/i.test(`${signal.trigger} ${signal.evidence}`)) {
    score += 1;
  }
  if (/industry pattern|not account-specific|generic/i.test(signal.evidence)) {
    score -= 3;
  }
  return score;
}

export function rankWhyNowSignals(signals: WhyNowSignal[], limit = 5) {
  return [...signals]
    .filter((signal) => !/industry pattern|not account-specific/i.test(signal.evidence))
    .sort((a, b) => whyNowScore(b) - whyNowScore(a))
    .slice(0, limit);
}

export function buildOverview(input: {
  companyName: string;
  snapshotIndustry: string;
  snapshotScale: string;
  initiatives: StrategicInitiative[];
  technologySignals: TechnologySignal[];
  whyNow: WhyNowSignal[];
  people: { name: string; title: string; role: string }[];
  salesAngle: string;
  unavailableNote?: string;
}): OverviewIntelligence {
  const { companyName } = input;
  const topInitiatives = input.initiatives.slice(0, 3).map((item) => item.initiative);
  const topTech = input.technologySignals
    .slice(0, 4)
    .map((item) => `${item.technology} (${item.category})`);
  const topWhy = input.whyNow.slice(0, 3).map((item) => ({
    trigger: item.trigger,
    evidence: item.evidence,
  }));
  const people = input.people.slice(0, 4);

  const briefParts = [
    `${companyName} is researched here as a strategic account.`,
    input.snapshotIndustry && !/pending/i.test(input.snapshotIndustry)
      ? `Public materials describe it as ${input.snapshotIndustry}.`
      : "",
    input.snapshotScale && !/not available|pending|sources reviewed/i.test(input.snapshotScale)
      ? `Scale signal: ${input.snapshotScale}.`
      : "",
    topInitiatives.length > 0
      ? `Visible strategic themes include ${topInitiatives.join(", ")}.`
      : "",
    topTech.length > 0
      ? `Technology signals that may matter in a Cursor conversation: ${topTech.join(", ")}.`
      : "",
    people.length > 0
      ? `Publicly identifiable technology leaders include ${people.map((person) => `${person.name} (${person.title})`).join("; ")}.`
      : "No publicly identifiable technology leaders were confirmed in this pass.",
  ].filter(Boolean);

  return {
    question: "What do I need to know before prospecting into this account?",
    executiveBrief: briefParts.join(" "),
    whyNow: topWhy,
    initiatives: topInitiatives,
    technologySignals: topTech,
    peopleToEngage: people,
    recommendedSalesAngle: input.salesAngle,
    unavailableNote: input.unavailableNote,
  };
}

export function buildEvidenceLibrary(input: {
  items: LiveResearchItem[];
  findingsByUrl: Map<string, string[]>;
}): EvidenceSource[] {
  const seen = new Set<string>();
  const sources: EvidenceSource[] = [];

  for (const item of input.items) {
    const key = item.url.replace(/\/$/, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({
      title: item.title,
      publisher: publisherFromUrl(item.url),
      date: item.publishedDate,
      url: item.url,
      group: sourceGroupFromBucket(item.bucket),
      supports: input.findingsByUrl.get(key) || [],
    });
  }

  return sources;
}

export function addFinding(
  map: Map<string, string[]>,
  url: string,
  finding: string,
) {
  if (!url) return;
  const key = url.replace(/\/$/, "").toLowerCase();
  const current = map.get(key) || [];
  if (!current.includes(finding)) current.push(finding);
  map.set(key, current);
}
