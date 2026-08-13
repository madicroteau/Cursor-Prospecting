/**
 * Mock data for Account Intel UI development.
 * Replace with live research results in later phases.
 */

import {
  getExperimentalIntelligence,
  type ExperimentalIntelligence,
} from "@/lib/experimental-intelligence";
import {
  emptyProspectingBrief,
  type ProspectingBrief,
} from "@/lib/prospecting-brief";

export interface MockAccountInput {
  companyName: string;
  companyWebsite: string;
}

export interface DossierSource {
  title: string;
  url: string;
}

export interface ProspectTarget {
  name: string;
  title: string;
  relevance: string;
}

export interface AccountSnapshot {
  industry: string;
  headquarters: string;
  sizeSignal: string;
  recentHeadline: string;
}

export interface AccountDossier {
  companyName: string;
  companyWebsite: string;
  generatedAt: string;
  snapshot: AccountSnapshot;
  whatsHappening: string[];
  techAndAI: string[];
  prospectTargets: ProspectTarget[];
  opportunitySignals: string[];
  whyCursor: string[];
  whyNow: string[];
  talkTrack: string[];
  sources: DossierSource[];
  /** Compact MEDDPICC + Command of the Message prospecting brief with sourced signals. */
  prospectingBrief: ProspectingBrief;
  /** Experimental enterprise intelligence extensions (SAMPLE / MOCK). */
  experimental: ExperimentalIntelligence;
}

export const MOCK_ACCOUNT_EXAMPLES: MockAccountInput[] = [
  {
    companyName: "AdventHealth",
    companyWebsite: "https://www.adventhealth.com",
  },
  {
    companyName: "Mayo Clinic",
    companyWebsite: "https://www.mayoclinic.org",
  },
];

const ADVENTHEALTH_BRIEF: ProspectingBrief = {
  valueThesis:
    "AdventHealth shows public digital and technology activity that can create pressure to deliver software faster. Use MEDDPICC to find pain and the Economic Buyer, and use Command of the Message to sell Cursor as the governed way for engineering teams to increase delivery capacity.",
  prioritySignals: [
    {
      headline:
        "Digital transformation and ambulatory expansion create software delivery demand",
      insight:
        "Public initiative activity can create delivery pressure — open with software velocity and whether engineering capacity is keeping up.",
      meddpicc: "Identify Pain",
      command: "Buyer Pain",
      persona: "CIO / digital leadership",
      claimType: "INFERENCE",
      sources: [
        {
          title: "AdventHealth — About Us",
          url: "https://www.adventhealth.com/about-us",
        },
      ],
    },
    {
      headline: "Sustained engineering and data hiring suggests active build work",
      insight:
        "Hiring supports Metrics and Identify Pain — ask how new roles and projects affect developer throughput and onboarding.",
      meddpicc: "Metrics",
      command: "Value Driver",
      persona: "VP Engineering / platform leader",
      claimType: "INFERENCE",
      sources: [
        {
          title: "AdventHealth Careers — Technology",
          url: "https://jobs.adventhealth.com",
        },
      ],
    },
  ],
  whyCursorNow: [
    {
      headline: "Governed AI coding path for healthcare engineering teams",
      insight:
        "Command Differentiator + MEDDPICC Decision Criteria: position Cursor Teams as the approved alternative to unmanaged consumer AI coding tools.",
      meddpicc: "Decision Criteria",
      command: "Differentiator",
      persona: "Security / governance + CIO",
      claimType: "SALES_HYPOTHESIS",
      sources: [
        {
          title: "AdventHealth Careers — Technology",
          url: "https://jobs.adventhealth.com",
        },
      ],
    },
  ],
  discoveryQuestions: [
    "Where is AdventHealth feeling the most pressure to deliver software or digital products faster this year?",
    "Who owns budget and approval for developer productivity or AI coding tools?",
    "Which teams would champion a governed pilot — platform, digital, or application engineering?",
  ],
    nextActions: [
    "Confirm MEDDPICC Economic Buyer and Champion before outreach.",
    "Lead with one public initiative or hiring signal, then ask a Metrics / Identify Pain discovery question.",
    "Propose a 30-day governed Cursor pilot using a Command of the Message value driver: faster delivery with enterprise controls.",
  ],
};

const ADVENTHEALTH_DOSSIER: Omit<
  AccountDossier,
  "companyName" | "companyWebsite" | "generatedAt" | "experimental"
> = {
  snapshot: {
    industry: "Nonprofit health system",
    headquarters: "Altamonte Springs, Florida",
    sizeSignal: "~90,000 employees · 51 hospitals across 9 states",
    recentHeadline:
      "Expanding virtual care and ambulatory network; ongoing digital front door investments",
  },
  whatsHappening: [
    "Scaling ambulatory and outpatient access to reduce inpatient dependency and improve margin.",
    "Enterprise focus on consumer experience — online scheduling, patient portal, and mobile engagement.",
    "Workforce modernization underway: clinical informatics and IT hiring across multiple regions.",
    "Public emphasis on whole-person care model tying primary care, specialty, and community health.",
  ],
  techAndAI: [
    "Active hiring for software engineers, data engineers, and cloud platform roles on public careers pages.",
    "Epic-centric EHR environment with ongoing integration and analytics initiatives (inferred from job postings and industry profile).",
    "Published interest in AI-assisted documentation, operational analytics, and patient engagement tooling.",
    "Digital transformation language appears in leadership communications and community benefit reporting.",
  ],
  prospectTargets: [
    {
      name: "Victoria (Tori) Wick",
      title: "Senior Vice President & Chief Information Officer",
      relevance:
        "Owns enterprise technology strategy, digital health, and IT modernization — primary economic buyer for developer productivity tools.",
    },
    {
      name: "Engineering & Platform Leadership",
      title: "VP / Director, Software Engineering or Digital Products",
      relevance:
        "Likely evaluators for AI coding tools; search careers site for \"software engineering manager\" or \"digital products\" titles.",
    },
    {
      name: "Clinical Informatics Leadership",
      title: "CMIO or VP Clinical Informatics",
      relevance:
        "Influences workflow tooling and clinician-facing software — relevant for AI governance and adoption narratives.",
    },
  ],
  opportunitySignals: [
    "Sustained engineering and data hiring suggests active software investment.",
    "Health system scale + Epic footprint = large internal dev surface area and integration work.",
    "Consumer digital initiatives create pressure to ship web and mobile features faster.",
    "Industry-wide push on AI documentation and operational efficiency aligns with Cursor value prop.",
  ],
  whyCursor: [
    "Large internal engineering org shipping patient-facing and operational software benefits from AI-assisted development.",
    "Epic integrations, analytics pipelines, and portal work involve repetitive boilerplate where Cursor accelerates delivery.",
    "Enterprise healthcare needs governed, team-ready AI tooling — Cursor Teams maps to their compliance-minded buying process.",
  ],
  whyNow: [
    "Public hiring for engineers and platform roles indicates budget and urgency for velocity.",
    "Peer health systems are publicly piloting AI coding assistants — competitive pressure to evaluate.",
    "Digital front door and ambulatory expansion require faster release cycles on web/mobile properties.",
  ],
  talkTrack: [
    "\"Your ambulatory and digital front door expansion likely means more engineering throughput — how is your team thinking about developer productivity today?\"",
    "\"We see health systems your size running Epic-adjacent integrations and analytics — a lot of that work is high-volume code. Cursor helps teams ship that 30–40% faster without sacrificing review standards.\"",
    "\"Given clinical informatics involvement, we'd start with a governed team pilot — SSO, privacy mode, and clear usage policies — not a shadow-IT rollout.\"",
    "\"Happy to share how similar enterprise healthcare teams structured a 30-day eval with engineering and security stakeholders.\"",
  ],
  sources: [
    {
      title: "AdventHealth — About Us",
      url: "https://www.adventhealth.com/about-us",
    },
    {
      title: "AdventHealth Careers — Technology",
      url: "https://jobs.adventhealth.com",
    },
    {
      title: "AdventHealth Newsroom",
      url: "https://www.adventhealth.com/news",
    },
    {
      title: "AdventHealth Leadership",
      url: "https://www.adventhealth.com/leadership",
    },
  ],
  prospectingBrief: ADVENTHEALTH_BRIEF,
};

function buildGenericDossier(
  companyName: string,
  companyWebsite: string,
): Omit<AccountDossier, "generatedAt" | "experimental"> {
  const domain = companyWebsite.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];

  return {
    companyName,
    companyWebsite,
    snapshot: {
      industry: "Enterprise (public profile pending)",
      headquarters: "Not found in public sources",
      sizeSignal: "Research required — run live dossier in Phase 2",
      recentHeadline: `Mock dossier generated for ${companyName} — replace with live research`,
    },
    whatsHappening: [
      `${companyName} strategic priorities will appear here after live research connects news, press releases, and leadership communications.`,
      "Look for M&A activity, restructuring, new product lines, or geographic expansion as leading indicators.",
    ],
    techAndAI: [
      "Scan public careers pages for software engineering, data, and platform hiring.",
      "Review technology leadership titles and any public cloud or AI partnership announcements.",
      "Check GitHub org (if public) and job descriptions for stack signals (e.g. AWS, Azure, Epic, Salesforce).",
    ],
    prospectTargets: [
      {
        name: "CIO / CTO",
        title: "Chief Information Officer or Chief Technology Officer",
        relevance: "Primary owner of technology budget and developer tooling decisions.",
      },
      {
        name: "VP Engineering",
        title: "VP / SVP Software Engineering",
        relevance: "Technical evaluator and likely pilot sponsor for AI coding tools.",
      },
    ],
    opportunitySignals: [
      "Engineering job postings mentioning AI, modernization, or digital transformation.",
      "Recent leadership changes in technology or digital functions.",
      "Public statements about software velocity, developer experience, or AI adoption.",
    ],
    whyCursor: [
      `${companyName} teams building internal software and integrations can accelerate delivery with AI-assisted development.`,
      "Cursor Teams provides enterprise controls (SSO, privacy mode) suitable for regulated industries.",
    ],
    whyNow: [
      "Peer enterprises are evaluating AI coding tools — early evaluation avoids competitive lag.",
      "If hiring is active, onboarding and productivity tooling ROI is timely.",
    ],
    talkTrack: [
      `"How is ${companyName} thinking about developer productivity as software becomes more central to the business?"`,
      "\"We help enterprise teams ship faster on existing codebases — especially integration-heavy environments.\"",
      "\"Would a short, governed pilot with your platform or app engineering team be worth exploring?\"",
    ],
    sources: [
      {
        title: `${companyName} — Company Website`,
        url: companyWebsite.startsWith("http") ? companyWebsite : `https://${domain}`,
      },
    ],
    prospectingBrief: emptyProspectingBrief(companyName),
  };
}

export function getMockDossier(
  companyName: string,
  companyWebsite: string,
): AccountDossier {
  const normalizedName = companyName.trim();
  const normalizedWebsite =
    companyWebsite.trim() || `https://www.${normalizedName.toLowerCase().replace(/\s+/g, "")}.com`;

  const isAdventHealth = normalizedName.toLowerCase().includes("adventhealth");

  const base = isAdventHealth
    ? {
        companyName: normalizedName || "AdventHealth",
        companyWebsite: normalizedWebsite,
        ...ADVENTHEALTH_DOSSIER,
      }
    : buildGenericDossier(
        normalizedName || "Sample Account",
        normalizedWebsite,
      );

  return {
    ...base,
    generatedAt: new Date().toISOString(),
    experimental: getExperimentalIntelligence(
      base.companyName,
      base.companyWebsite,
    ),
  };
}
