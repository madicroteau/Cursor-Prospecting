import type { ClaimType } from "@/lib/claim-types";
import type { LiveResearchItem, LiveResearchResult } from "@/lib/live-research";
import { formatDisplayText, formatHeadline } from "@/lib/text-format";

export type MeddpiccLens =
  | "Metrics"
  | "Economic Buyer"
  | "Decision Criteria"
  | "Decision Process"
  | "Paper Process"
  | "Identify Pain"
  | "Champion"
  | "Competition";

export type CommandAngle =
  | "Required Capability"
  | "Value Driver"
  | "Differentiator"
  | "Proof Point"
  | "Buyer Pain";

export type SignalSource = {
  title: string;
  url: string;
};

export type SourcedSignal = {
  headline: string;
  insight: string;
  meddpicc: MeddpiccLens;
  command: CommandAngle;
  persona: string;
  claimType: ClaimType;
  sources: SignalSource[];
};

export type ProspectingBrief = {
  valueThesis: string;
  prioritySignals: SourcedSignal[];
  whyCursorNow: SourcedSignal[];
  discoveryQuestions: string[];
  nextActions: string[];
};

function sourceFrom(item: LiveResearchItem, companyName: string): SignalSource {
  return {
    title: formatHeadline(item.title, { companyName }),
    url: item.url,
  };
}

function cleanHeadline(item: LiveResearchItem, companyName: string) {
  return formatHeadline(item.title, { companyName });
}

function scoreItem(item: LiveResearchItem) {
  const text = `${item.title} ${item.snippet}`.toLowerCase();
  let score = 0;
  const boosts = [
    "digital",
    "ai",
    "software",
    "engineer",
    "cloud",
    "epic",
    "platform",
    "transformation",
    "hiring",
    "cio",
    "expansion",
    "modernization",
    "developer",
  ];
  for (const word of boosts) {
    if (text.includes(word)) score += 1;
  }
  if (item.snippet.length > 80) score += 1;
  return score;
}

function pickBest(items: LiveResearchItem[], count: number) {
  return [...items].sort((a, b) => scoreItem(b) - scoreItem(a)).slice(0, count);
}

function detectTechMentions(items: LiveResearchItem[]) {
  const catalog = [
    "Epic",
    "AWS",
    "Azure",
    "GCP",
    "Google Cloud",
    "Snowflake",
    "Databricks",
    "Kubernetes",
    "Docker",
    "Terraform",
    "GitHub",
    "GitLab",
    "VS Code",
    "Python",
    "Java",
    "TypeScript",
    ".NET",
    "Copilot",
    "Claude",
    "Generative AI",
    "Salesforce",
  ];
  const text = items.map((i) => `${i.title} ${i.snippet}`).join(" ").toLowerCase();
  return catalog.filter((tech) => {
    const needle = tech.toLowerCase();
    if (needle === "java") {
      return /\bjava\b/.test(text);
    }
    return text.includes(needle);
  });
}

/**
 * Builds a compact, sales-ready prospecting brief from live research.
 * Prioritizes Cursor-selling value over dumping every search result.
 */
export function buildProspectingBrief(
  liveResearch: LiveResearchResult,
): ProspectingBrief {
  const company = liveResearch.companyName;
  const { organized } = liveResearch;
  const initiatives = pickBest(organized.initiatives, 3);
  const hiring = pickBest(organized.hiring, 3);
  const tech = pickBest([...organized.ai, ...organized.technology], 3);
  const leadership = pickBest(organized.leadership, 2);
  const financial = pickBest(organized.financial, 2);
  const news = pickBest(organized.news || [], 2);
  const compliance = pickBest(organized.compliance || [], 2);
  const techMentions = detectTechMentions([
    ...organized.technology,
    ...organized.ai,
    ...organized.hiring,
  ]);

  const prioritySignals: SourcedSignal[] = [];

  for (const item of news.slice(0, 1)) {
    prioritySignals.push({
      headline: cleanHeadline(item, company),
      insight: formatDisplayText(
        `MEDDPICC Identify Pain: recent public trigger — use only if it implies delivery, AI, security, or modernization pressure. Confirm with the customer before treating as urgency.`,
        { companyName: company },
      ),
      meddpicc: "Identify Pain",
      command: "Buyer Pain",
      persona: "CIO / digital leadership",
      claimType: "FACT",
      sources: [sourceFrom(item, company)],
    });
  }

  for (const item of initiatives.slice(0, 2)) {
    prioritySignals.push({
      headline: cleanHeadline(item, company),
      insight: formatDisplayText(
        `MEDDPICC Identify Pain: public initiative activity can create delivery pressure — open with software velocity and whether engineering capacity is keeping up. Command Buyer Pain: this is a strong entry point for Cursor.`,
        { companyName: company },
      ),
      meddpicc: "Identify Pain",
      command: "Buyer Pain",
      persona: "CIO / digital leadership",
      claimType: "FACT",
      sources: [sourceFrom(item, company)],
    });
  }

  if (hiring[0]) {
    prioritySignals.push({
      headline: formatHeadline(
        `Active technical hiring: ${hiring[0].title}`,
        { companyName: company },
      ),
      insight: formatDisplayText(
        `Hiring signals suggest build work is underway. In MEDDPICC terms this supports Metrics and Identify Pain — ask how new roles and projects are affecting developer throughput and onboarding.`,
        { companyName: company },
      ),
      meddpicc: "Metrics",
      command: "Value Driver",
      persona: "VP Engineering / platform leader",
      claimType: "INFERENCE",
      sources: hiring.slice(0, 2).map((item) => sourceFrom(item, company)),
    });
  }

  if (tech[0]) {
    const stackNote =
      techMentions.length > 0
        ? ` Stack mentions include ${techMentions.slice(0, 4).join(", ")}.`
        : "";
    prioritySignals.push({
      headline: cleanHeadline(tech[0], company),
      insight: formatDisplayText(
        `Technology/AI activity is a Command of the Message Required Capability cue: teams need faster, governed ways to ship on existing systems.${stackNote} Position Cursor as the approved AI coding path for builders.`,
        { companyName: company },
      ),
      meddpicc: "Decision Criteria",
      command: "Required Capability",
      persona: "CTO / VP Engineering / security",
      claimType: "INFERENCE",
      sources: tech.slice(0, 2).map((item) => sourceFrom(item, company)),
    });
  }

  if (leadership[0]) {
    prioritySignals.push({
      headline: formatHeadline(
        `Technology leadership signal: ${leadership[0].title}`,
        { companyName: company },
      ),
      insight: formatDisplayText(
        `Use this to map MEDDPICC Economic Buyer and Champion. Confirm who owns developer tooling budget versus who would run a Cursor pilot day to day.`,
        { companyName: company },
      ),
      meddpicc: "Economic Buyer",
      command: "Proof Point",
      persona: "CIO / Chief Digital Officer",
      claimType: "INFERENCE",
      sources: [sourceFrom(leadership[0], company)],
    });
  }

  if (financial[0]) {
    prioritySignals.push({
      headline: cleanHeadline(financial[0], company),
      insight: formatDisplayText(
        `Financial/public disclosure context helps you ask better MEDDPICC Metrics questions — where capital and digital investment may justify a productivity tool evaluation. Do not invent figures.`,
        { companyName: company },
      ),
      meddpicc: "Metrics",
      command: "Value Driver",
      persona: "CIO / finance partner",
      claimType: "FACT",
      sources: [sourceFrom(financial[0], company)],
    });
  }

  if (compliance[0]) {
    prioritySignals.push({
      headline: cleanHeadline(compliance[0], company),
      insight: formatDisplayText(
        `Compliance/security context is Decision Criteria / Paper Process material — ask how AI coding tools are approved. Do not treat voluntary guidance as law.`,
        { companyName: company },
      ),
      meddpicc: "Decision Criteria",
      command: "Required Capability",
      persona: "CISO / compliance",
      claimType: "INFERENCE",
      sources: [sourceFrom(compliance[0], company)],
    });
  }

  const whyCursorNow: SourcedSignal[] = [];

  if (initiatives[0] || hiring[0]) {
    const stackNote =
      techMentions.length > 0
        ? ` Evidence mentions ${techMentions.slice(0, 4).join(", ")}.`
        : "";
    whyCursorNow.push({
      headline: formatHeadline(
        initiatives[0]
          ? `Why Cursor may be relevant: ${cleanHeadline(initiatives[0], company)}`
          : `${company} shows active technical hiring / delivery signals`,
        { companyName: company },
      ),
      insight: formatDisplayText(
        `SALES HYPOTHESIS from account evidence: public initiative/hiring activity may create software delivery pressure.${stackNote} Lead with discovery on capacity — not a generic Cursor pitch.`,
        { companyName: company },
      ),
      meddpicc: "Identify Pain",
      command: "Value Driver",
      persona: "CIO + VP Engineering",
      claimType: "SALES_HYPOTHESIS",
      sources: [initiatives[0] || hiring[0]]
        .filter(Boolean)
        .map((item) => sourceFrom(item!, company)),
    });
  }

  if (techMentions.includes("Epic") || tech.some((t) => /epic|ehr/i.test(t.title))) {
    whyCursorNow.push({
      headline: formatHeadline(
        "Epic/EHR-adjacent evidence may imply complex integration and customization work",
        { companyName: company },
      ),
      insight: formatDisplayText(
        `SALES HYPOTHESIS: Cursor may help in large existing codebases and integration-heavy environments if those teams exist — confirm with engineering. Do not invent Epic projects.`,
        { companyName: company },
      ),
      meddpicc: "Decision Criteria",
      command: "Differentiator",
      persona: "VP Engineering / enterprise architecture",
      claimType: "SALES_HYPOTHESIS",
      sources: tech.slice(0, 2).map((item) => sourceFrom(item, company)),
    });
  }

  if (compliance[0] || techMentions.some((t) => /copilot|claude|generative ai/i.test(t))) {
    whyCursorNow.push({
      headline: formatHeadline(
        "Evidence supports asking about a governed AI coding path",
        { companyName: company },
      ),
      insight: formatDisplayText(
        `Account-specific SALES HYPOTHESIS: compliance/AI signals create a reason to ask about approved vs unmanaged AI coding tools. REQUIRES PRODUCT VALIDATION for any specific Cursor control claims.`,
        { companyName: company },
      ),
      meddpicc: "Paper Process",
      command: "Differentiator",
      persona: "Security / governance + CIO",
      claimType: "SALES_HYPOTHESIS",
      sources: (compliance[0] ? [compliance[0]] : tech[0] ? [tech[0]] : initiatives[0] ? [initiatives[0]] : []).map(
        (item) => sourceFrom(item, company),
      ),
    });
  }

  const valueThesis = formatDisplayText(
    [
      `${company}:`,
      initiatives[0]
        ? `initiative evidence around "${cleanHeadline(initiatives[0], company)}"`
        : "public digital/technology research",
      techMentions.length > 0
        ? `; stack mentions include ${techMentions.slice(0, 5).join(", ")}`
        : "",
      hiring[0] ? `; hiring signals present` : "",
      `. PRIMARY SALES HYPOTHESIS: delivery pressure may create openness to a governed AI coding tool — validate; do not treat as confirmed.`,
    ].join(""),
    { companyName: company },
  );

  const discoveryQuestions = [
    `Where is ${company} feeling the most pressure to deliver software or digital products faster this year?`,
    techMentions[0]
      ? `Public sources mention ${techMentions.slice(0, 3).join(", ")} — which of those create the biggest engineering bottleneck?`
      : "Who is the Economic Buyer for developer productivity or AI coding tools?",
    "Which Champion would run a governed pilot — platform, digital, or application engineering?",
    "What Decision Criteria matter most: security, privacy mode, SSO, auditability, or IDE workflow fit?",
    "How do you prevent shadow-IT AI coding tools while still giving developers modern assistance?",
  ].map((q) => formatDisplayText(q, { companyName: company, ensurePunctuation: false }));

  const nextActions = [
    "Confirm MEDDPICC Economic Buyer and Champion from leadership sources before outreach.",
    "Lead with one public initiative or hiring signal, then ask a Metrics / Identify Pain discovery question.",
    "Propose a 30-day governed Cursor pilot using a Command of the Message value driver: faster delivery with enterprise controls.",
  ].map((a) => formatDisplayText(a, { companyName: company }));

  return {
    valueThesis,
    prioritySignals: prioritySignals.slice(0, 6),
    whyCursorNow: whyCursorNow.slice(0, 4),
    discoveryQuestions,
    nextActions,
  };
}

export function emptyProspectingBrief(companyName: string): ProspectingBrief {
  return {
    valueThesis: formatDisplayText(
      `Run live research for ${companyName} to build MEDDPICC-ready prospecting signals and a Command of the Message value thesis for Cursor.`,
      { companyName },
    ),
    prioritySignals: [],
    whyCursorNow: [],
    discoveryQuestions: [],
    nextActions: [],
  };
}
