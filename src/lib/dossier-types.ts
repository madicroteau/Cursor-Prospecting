export type ClaimType = "FACT" | "INFERENCE" | "SALES_HYPOTHESIS";

export type Confidence = "High" | "Medium" | "Low";

export type Source = {
  id: string;
  title: string;
  url: string;
  date?: string;
  usedFor: string;
};

export type WhyNowSignal = {
  whatHappened: string;
  date?: string;
  evidence: string;
  sourceId: string;
  whyItMatters: string;
  cursorRelevance: string;
  confidence: Confidence;
  claimType: ClaimType;
};

export type Person = {
  name: string;
  title: string;
  whyRelevant: string;
  initiativesOrStatements: string;
  sourceId: string;
  claimType: ClaimType;
};

export type JobOpening = {
  title: string;
  category: string;
  technologies: string[];
  sourceId: string;
};

export type Initiative = {
  name: string;
  evidence: string;
  date?: string;
  sourceId: string;
  relevantExecutive?: string;
  salesRelevance: string;
  claimType: ClaimType;
};

export type Technology = {
  name: string;
  evidence: string;
  sourceId: string;
};

export type FinancialInsight = {
  title: string;
  detail: string;
  sourceId: string;
  claimType: ClaimType;
};

export type TargetPersona = {
  persona: string;
  why: string;
  relatedSignal: string;
  talkAbout: string;
};

export type Outreach = {
  email: string;
  coldCallOpener: string;
  linkedInMessage: string;
};

export type AccountDossier = {
  companyName: string;
  companyWebsite: string;
  isPlaceholder: boolean;
  executiveBrief: {
    companySummary: string;
    strategicPriorities: string[];
    technologyPriorities: string[];
    whyNowSignals: string[];
    topPersonas: string[];
    recommendedAngle: string;
  };
  whyNow: WhyNowSignal[];
  people: Person[];
  hiring: {
    jobs: JobOpening[];
    commonCategories: string[];
    technologiesMentioned: string[];
    patterns: string;
    patternSuggestion: string;
  };
  initiatives: Initiative[];
  technologies: Technology[];
  financial: FinancialInsight[];
  prospectingPlan: {
    whoToTarget: TargetPersona[];
    conversationAngles: string[];
    whyNowSummary: string;
    discoveryQuestions: string[];
    outreach: Outreach;
  };
  sources: Source[];
};
