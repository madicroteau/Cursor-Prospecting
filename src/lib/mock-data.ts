/**
 * Base dossier shell. Live analysis overwrites these fields.
 * Empty values are intentional — do not invent account facts.
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
  prospectingBrief: ProspectingBrief;
  experimental: ExperimentalIntelligence;
}

export const MOCK_ACCOUNT_EXAMPLES: MockAccountInput[] = [
  {
    companyName: "AdventHealth",
    companyWebsite: "https://www.adventhealth.com",
  },
];

function emptySnapshot(companyName: string): AccountSnapshot {
  return {
    industry: "Pending live research",
    headquarters: "Not available until live research runs",
    sizeSignal: "Not available until live research runs",
    recentHeadline: `No public headline loaded yet for ${companyName}`,
  };
}

export function getMockDossier(
  companyName: string,
  companyWebsite: string,
): AccountDossier {
  const normalizedName = companyName.trim() || "AdventHealth";
  const normalizedWebsite =
    companyWebsite.trim() ||
    `https://www.${normalizedName.toLowerCase().replace(/\s+/g, "")}.com`;

  return {
    companyName: normalizedName,
    companyWebsite: normalizedWebsite,
    generatedAt: new Date().toISOString(),
    snapshot: emptySnapshot(normalizedName),
    whatsHappening: [],
    techAndAI: [],
    prospectTargets: [],
    opportunitySignals: [],
    whyCursor: [],
    whyNow: [],
    talkTrack: [],
    sources: [
      {
        title: `${normalizedName} — Company website`,
        url: normalizedWebsite.startsWith("http")
          ? normalizedWebsite
          : `https://${normalizedWebsite}`,
      },
    ],
    prospectingBrief: emptyProspectingBrief(normalizedName),
    experimental: getExperimentalIntelligence(normalizedName, normalizedWebsite),
  };
}
