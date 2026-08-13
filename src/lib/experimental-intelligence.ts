/**
 * Account intelligence models. Live research fills these; empty values
 * mean the finding is unavailable — never invented people, tech, or jobs.
 */

import type {
  AssumptionLabel,
  BuyingCommitteeRole,
  ClaimType,
  Confidence,
  RelationshipStatus,
} from "@/lib/claim-types";
import {
  buildSampleComplianceSecurity,
  type ComplianceSecurityIntelligence,
} from "@/lib/compliance-security";

export interface JobCategoryCount {
  category: string;
  count: number;
}

export interface JobSignal {
  signal: string;
  supportingJobPostings: string[];
  supportingJobCount: number;
  technologiesDetected: string[];
  skillsAndTasks: string[];
  evidence: string;
  sourceUrls: string[];
  businessImplication: string;
  cursorRelevance: string;
  confidence: Confidence;
  claimType: ClaimType;
}

export type CursorHiringAngleCategory =
  | "Language"
  | "Cloud"
  | "EHR / Epic"
  | "Platform / DevOps"
  | "AI / ML"
  | "Integration"
  | "Delivery pressure";

export interface CursorHiringAngle {
  skillOrTech: string;
  category: CursorHiringAngleCategory;
  whyItHelpsSellCursor: string;
  supportingJobs: string[];
  sourceUrls: string[];
}

export interface ExtractedJob {
  title: string;
  department: string;
  location: string;
  technologies: string[];
  responsibilities: string;
  aiTerminology: string[];
  cloudTerminology: string[];
  developerTooling: string[];
  sourceTitle: string;
  sourceUrl: string;
}

export interface TechFrequency {
  technology: string;
  count: number;
}

export interface HiringTheme {
  theme: string;
  count: number;
  evidence: string;
}

export interface JobSalesSignal {
  fact: string;
  inference: string;
  salesHypothesis: string;
  sourceUrls: string[];
  confidence: Confidence;
}

export interface JobIntelligence {
  isSample: boolean;
  totalRelevantOpenings: number;
  categories: JobCategoryCount[];
  technologiesDetected: string[];
  extractedJobs: ExtractedJob[];
  topTechnologies: TechFrequency[];
  hiringThemes: HiringTheme[];
  salesSignals: JobSalesSignal[];
  cursorSellingAngles: CursorHiringAngle[];
  signals: JobSignal[];
  summary: string;
  unavailableNote?: string;
}

export interface CommitteePerson {
  name: string;
  title: string;
  role: BuyingCommitteeRole;
  roleInferred: boolean;
  relevantInitiative: string;
  potentialPriority: string;
  whyTheyMayCare: string;
  reasonToContact: string;
  outreachAngle: string;
  evidence: string;
  sourceUrl: string;
  sourceTitle?: string;
  confidence: Confidence;
  relationshipStatus: RelationshipStatus;
  claimType: ClaimType;
  isPlaceholderName: boolean;
}

export interface TopProspect {
  name: string;
  title: string;
  role: BuyingCommitteeRole;
  rankReason: string;
  relatedSignal: string;
  cursorAngle: string;
  firstConversationTopic: string;
}

export interface UnfilledBuyingRole {
  role: BuyingCommitteeRole;
  note: string;
}

export interface BuyingCommittee {
  isSample: boolean;
  people: CommitteePerson[];
  topPeopleToProspect: TopProspect[];
  unfilledRoles: UnfilledBuyingRole[];
  relationshipNote: string;
  unavailableNote?: string;
}

export interface RoiAssumptions {
  developerPopulation: number;
  developerPopulationLabel: AssumptionLabel;
  potentialCursorUsers: number;
  potentialCursorUsersLabel: AssumptionLabel;
  avgFullyLoadedCost: number;
  avgFullyLoadedCostLabel: AssumptionLabel;
  productivityImprovementPct: {
    conservative: number;
    expected: number;
    aggressive: number;
  };
  cursorCostPerUser: number;
  cursorCostPerUserLabel: AssumptionLabel;
  currentAiToolingSpend: number;
  currentAiToolingSpendLabel: AssumptionLabel;
  notes: string[];
}

export interface ResearchGap {
  whatWeDontKnow: string;
  currentEvidence: string;
  whyItMatters: string;
  whoToAsk: string;
  discoveryQuestion: string;
}

export interface WhyNowSignal {
  trigger: string;
  date: string;
  evidence: string;
  source: string;
  sourceUrl: string;
  relevantPersona: string;
  whyItMatters: string;
  cursorRelevance: string;
  discoveryQuestion: string;
  confidence: Confidence;
  claimType: ClaimType;
  combinedSignals?: string[];
}

export interface ProspectingPlanExpanded {
  isSample: boolean;
  whoToTarget: {
    persona: string;
    whyThem: string;
    talkAbout: string;
    relatedSignal: string;
  }[];
  conversationAngles: string[];
  strongestWhyNow: string;
  discoveryQuestions: string[];
  stillNeedToDiscover: string[];
  outreach: {
    email: string;
    coldCallOpener: string;
    linkedInMessage: string;
  };
  unavailableNote?: string;
}

export type TechnologyCategory =
  | "Developer tools"
  | "Source control"
  | "Cloud"
  | "Programming languages"
  | "Application platforms"
  | "DevOps"
  | "CI/CD"
  | "Infrastructure"
  | "Data platforms"
  | "AI/ML"
  | "Security"
  | "Enterprise applications";

export interface TechnologySignal {
  technology: string;
  category: TechnologyCategory;
  evidence: string;
  sourceTitle: string;
  sourceUrl: string;
  mentionCount: number;
  confidence: Confidence;
  whyItMayMatter: string;
  claimType: ClaimType;
}

export interface StrategicInitiative {
  initiative: string;
  whatIsHappening: string;
  timeframe: string;
  executiveInvolved?: string;
  evidence: string;
  sourceTitle: string;
  sourceUrl: string;
  technologyImplication: string;
  cursorRelevance?: string;
  confidence: Confidence;
  claimType: ClaimType;
}

export interface OverviewPerson {
  name: string;
  title: string;
  role: string;
}

export interface OverviewIntelligence {
  question: string;
  executiveBrief: string;
  whyNow: { trigger: string; evidence: string }[];
  initiatives: string[];
  technologySignals: string[];
  peopleToEngage: OverviewPerson[];
  recommendedSalesAngle: string;
  unavailableNote?: string;
}

export type SourceGroup =
  | "Company"
  | "People"
  | "Jobs"
  | "Technology"
  | "Initiatives"
  | "News"
  | "Financial/Public"
  | "Regulatory";

export interface EvidenceSource {
  title: string;
  publisher: string;
  date?: string;
  url: string;
  group: SourceGroup;
  supports: string[];
}

export interface ExperimentalIntelligence {
  overview: OverviewIntelligence;
  technologySignals: TechnologySignal[];
  strategicInitiatives: StrategicInitiative[];
  evidenceLibrary: EvidenceSource[];
  jobIntelligence: JobIntelligence;
  buyingCommittee: BuyingCommittee;
  roiAssumptions: RoiAssumptions;
  researchGaps: ResearchGap[];
  whyNowSynthesis: WhyNowSignal[];
  prospectingPlan: ProspectingPlanExpanded;
  complianceSecurity: ComplianceSecurityIntelligence;
}

const EMPTY_JOB_CATEGORIES: JobCategoryCount[] = [
  { category: "Software Engineering", count: 0 },
  { category: "Application Development", count: 0 },
  { category: "AI / ML", count: 0 },
  { category: "Data Engineering", count: 0 },
  { category: "Cloud", count: 0 },
  { category: "Platform Engineering", count: 0 },
  { category: "DevOps", count: 0 },
  { category: "Cybersecurity", count: 0 },
  { category: "Enterprise Architecture", count: 0 },
  { category: "Epic / Healthcare Applications", count: 0 },
];

const EMPTY_BUYING_ROLES: BuyingCommitteeRole[] = [
  "EXECUTIVE SPONSOR",
  "TECHNICAL CHAMPION",
  "TECHNICAL EVALUATOR",
  "SECURITY / GOVERNANCE",
  "INFLUENCER",
  "ECONOMIC / PROCUREMENT",
];

export function emptyExperimentalIntelligence(
  companyName: string,
  companyWebsite: string,
  unavailableNote?: string,
): ExperimentalIntelligence {
  const site = companyWebsite.startsWith("http")
    ? companyWebsite
    : `https://${companyWebsite}`;
  const note =
    unavailableNote ||
    `No live public research is available yet for ${companyName}. Findings will appear after Tavily research runs.`;

  return {
    overview: {
      question: "What do I need to know before prospecting into this account?",
      executiveBrief: note,
      whyNow: [],
      initiatives: [],
      technologySignals: [],
      peopleToEngage: [],
      recommendedSalesAngle:
        "Do not outreach on invented angles. Confirm public signals first.",
      unavailableNote: note,
    },
    technologySignals: [],
    strategicInitiatives: [],
    evidenceLibrary: [],
    jobIntelligence: {
      isSample: false,
      totalRelevantOpenings: 0,
      categories: EMPTY_JOB_CATEGORIES,
      technologiesDetected: [],
      extractedJobs: [],
      topTechnologies: [],
      hiringThemes: [],
      salesSignals: [],
      cursorSellingAngles: [],
      signals: [],
      summary: note,
      unavailableNote: note,
    },
    buyingCommittee: {
      isSample: false,
      people: [],
      topPeopleToProspect: [],
      unfilledRoles: EMPTY_BUYING_ROLES.map((role) => ({
        role,
        note: "No publicly identifiable person found for this role yet.",
      })),
      relationshipNote:
        "Buying committee roles are inferred from public titles. Do not treat this as an org chart or as confirmed Cursor buyers.",
      unavailableNote: note,
    },
    roiAssumptions: {
      developerPopulation: 0,
      developerPopulationLabel: "USER ASSUMPTION",
      potentialCursorUsers: 0,
      potentialCursorUsersLabel: "USER ASSUMPTION",
      avgFullyLoadedCost: 0,
      avgFullyLoadedCostLabel: "INDUSTRY ASSUMPTION",
      productivityImprovementPct: {
        conservative: 5,
        expected: 15,
        aggressive: 25,
      },
      cursorCostPerUser: 480,
      cursorCostPerUserLabel: "USER ASSUMPTION",
      currentAiToolingSpend: 0,
      currentAiToolingSpendLabel: "USER ASSUMPTION",
      notes: [
        "ROI figures are withheld until customer-validated. Do not present invented savings.",
      ],
    },
    researchGaps: [
      {
        whatWeDontKnow: "Live public research for this account",
        currentEvidence: note,
        whyItMatters: "Every finding on this dossier requires sourced evidence.",
        whoToAsk: "Add TAVILY_API_KEY (and optionally APOLLO_API_KEY)",
        discoveryQuestion: `What public signals should we confirm before prospecting ${companyName}?`,
      },
    ],
    whyNowSynthesis: [],
    prospectingPlan: {
      isSample: false,
      whoToTarget: [],
      conversationAngles: [],
      strongestWhyNow: note,
      discoveryQuestions: [
        `Where is ${companyName} feeling the most pressure to deliver software this year?`,
        "Which AI coding tools are already approved, piloted, or blocked?",
        "Who owns evaluation for developer productivity platforms?",
      ],
      stillNeedToDiscover: [
        "Named technology leaders",
        "Technology environment evidence",
        "Hiring / delivery pressure",
        "Strategic initiatives with software implications",
      ],
      outreach: {
        email: "",
        coldCallOpener: "",
        linkedInMessage: "",
      },
      unavailableNote: note,
    },
    complianceSecurity: buildSampleComplianceSecurity(companyName, site),
  };
}

export function getExperimentalIntelligence(
  companyName: string,
  companyWebsite: string,
): ExperimentalIntelligence {
  return emptyExperimentalIntelligence(
    companyName,
    companyWebsite,
    `Live research has not populated this dossier yet. No people, technologies, jobs, or initiatives are invented for ${companyName}.`,
  );
}
