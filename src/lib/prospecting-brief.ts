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
    "Google Cloud",
    "Snowflake",
    "Databricks",
    "Kubernetes",
    "Salesforce",
  ];
  const text = items.map((i) => `${i.title} ${i.snippet}`).join(" ").toLowerCase();
  return catalog.filter((tech) => text.includes(tech.toLowerCase()));
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
  const techMentions = detectTechMentions([
    ...organized.technology,
    ...organized.ai,
    ...organized.hiring,
  ]);

  const prioritySignals: SourcedSignal[] = [];

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
        `Financial/public disclosure context helps you ask better MEDDPICC Metrics questions — where capital and digital investment may justify a productivity tool evaluation.`,
        { companyName: company },
      ),
      meddpicc: "Metrics",
      command: "Value Driver",
      persona: "CIO / finance partner",
      claimType: "FACT",
      sources: [sourceFrom(financial[0], company)],
    });
  }

  const whyCursorNow: SourcedSignal[] = [];

  if (initiatives[0] || hiring[0]) {
    whyCursorNow.push({
      headline: formatHeadline(
        `${company} appears to have active digital or technical delivery work`,
        { companyName: company },
      ),
      insight: formatDisplayText(
        `Command of the Message: lead with the Value Driver of faster, higher-quality software delivery under governance. Cursor helps engineering teams ship initiative work without shadow-IT AI tools.`,
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
        "Complex healthcare systems work often means heavy integration and customization",
        { companyName: company },
      ),
      insight: formatDisplayText(
        `Command Differentiator: Cursor accelerates work in large, existing codebases and integration-heavy environments — common around EHR-adjacent platforms — while Teams controls support regulated Decision Criteria.`,
        { companyName: company },
      ),
      meddpicc: "Decision Criteria",
      command: "Differentiator",
      persona: "VP Engineering / enterprise architecture",
      claimType: "SALES_HYPOTHESIS",
      sources: tech.slice(0, 2).map((item) => sourceFrom(item, company)),
    });
  }

  whyCursorNow.push({
    headline: formatHeadline(
      "Healthcare buyers usually need a governed AI coding path",
      { companyName: company },
    ),
    insight: formatDisplayText(
      `MEDDPICC Paper Process / Decision Criteria: position Cursor Teams (SSO, privacy controls, team standards) as the approved alternative to unmanaged consumer AI coding tools.`,
      { companyName: company },
    ),
    meddpicc: "Paper Process",
    command: "Differentiator",
    persona: "Security / governance + CIO",
    claimType: "SALES_HYPOTHESIS",
    sources: tech[0]
      ? [sourceFrom(tech[0], company)]
      : initiatives[0]
        ? [sourceFrom(initiatives[0], company)]
        : [],
  });

  const valueThesis = formatDisplayText(
    `${company} shows public digital, technology, or hiring activity that can create pressure to deliver software faster. Use MEDDPICC to find pain and the Economic Buyer, and use Command of the Message to sell Cursor as the governed way for engineering teams to increase delivery capacity.`,
    { companyName: company },
  );

  const discoveryQuestions = [
    `Where is ${company} feeling the most pressure to deliver software or digital products faster this year?`,
    "Who is the Economic Buyer for developer productivity or AI coding tools?",
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
