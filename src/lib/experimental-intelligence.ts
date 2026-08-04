/**
 * Experimental enterprise intelligence models + SAMPLE data.
 * Not live research. Replace with researched results later.
 */

import type {
  AssumptionLabel,
  BuyingCommitteeRole,
  ClaimType,
  Confidence,
  RelationshipStatus,
} from "@/lib/claim-types";

export interface JobCategoryCount {
  category: string;
  count: number;
}

export interface JobSignal {
  signal: string;
  supportingJobPostings: string[];
  supportingJobCount: number;
  technologiesDetected: string[];
  evidence: string;
  sourceUrls: string[];
  businessImplication: string;
  cursorRelevance: string;
  confidence: Confidence;
  claimType: ClaimType;
}

export interface JobIntelligence {
  isSample: boolean;
  totalRelevantOpenings: number;
  categories: JobCategoryCount[];
  technologiesDetected: string[];
  signals: JobSignal[];
  summary: string;
}

export interface CommitteePerson {
  name: string;
  title: string;
  role: BuyingCommitteeRole;
  relevantInitiative: string;
  potentialPriority: string;
  whyTheyMayCare: string;
  reasonToContact: string;
  outreachAngle: string;
  evidence: string;
  sourceUrl: string;
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

export interface BuyingCommittee {
  isSample: boolean;
  people: CommitteePerson[];
  topPeopleToProspect: TopProspect[];
  relationshipNote: string;
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
}

export interface ExperimentalIntelligence {
  jobIntelligence: JobIntelligence;
  buyingCommittee: BuyingCommittee;
  roiAssumptions: RoiAssumptions;
  researchGaps: ResearchGap[];
  whyNowSynthesis: WhyNowSignal[];
  prospectingPlan: ProspectingPlanExpanded;
}

function adventHealthExperimental(): ExperimentalIntelligence {
  return {
    jobIntelligence: {
      isSample: true,
      totalRelevantOpenings: 18,
      categories: [
        { category: "Software Engineering", count: 5 },
        { category: "Application Development", count: 3 },
        { category: "AI / ML", count: 2 },
        { category: "Data Engineering", count: 2 },
        { category: "Cloud", count: 2 },
        { category: "Platform Engineering", count: 1 },
        { category: "DevOps", count: 1 },
        { category: "Cybersecurity", count: 1 },
        { category: "Enterprise Architecture", count: 0 },
        { category: "Epic / Healthcare Applications", count: 1 },
      ],
      technologiesDetected: [
        "Epic",
        "AWS",
        "Azure",
        "Python",
        "Java",
        "JavaScript",
        "Kubernetes",
        "Docker",
        "CI/CD",
        "Snowflake",
        "Generative AI",
        "GitHub",
      ],
      signals: [
        {
          signal: "Active software engineering hiring across digital and platform roles",
          supportingJobPostings: [
            "Software Engineer",
            "Application Developer",
            "Cloud Engineer",
          ],
          supportingJobCount: 8,
          technologiesDetected: ["Java", "JavaScript", "AWS", "CI/CD"],
          evidence:
            "SAMPLE: Multiple public technology openings reference application delivery, cloud, and integration work.",
          sourceUrls: ["https://jobs.adventhealth.com"],
          businessImplication:
            "May indicate ongoing software delivery demand — not proof of a tooling gap.",
          cursorRelevance:
            "If delivery volume is rising, AI-assisted development could be worth evaluating with engineering leaders.",
          confidence: "Medium",
          claimType: "INFERENCE",
        },
        {
          signal: "AI / analytics language appearing in technical hiring",
          supportingJobPostings: [
            "Data Engineer",
            "Machine Learning / AI-related role (sample)",
          ],
          supportingJobCount: 4,
          technologiesDetected: ["Python", "Snowflake", "Generative AI"],
          evidence:
            "SAMPLE: Some postings mention analytics, automation, or AI-adjacent responsibilities.",
          sourceUrls: ["https://jobs.adventhealth.com"],
          businessImplication:
            "Could suggest AI experimentation or operational analytics investment.",
          cursorRelevance:
            "Useful opening to ask how AI work is being built and whether developer tools are part of the stack.",
          confidence: "Medium",
          claimType: "INFERENCE",
        },
        {
          signal: "Epic / healthcare application ecosystem remains central",
          supportingJobPostings: ["Epic / Clinical Applications (sample)"],
          supportingJobCount: 1,
          technologiesDetected: ["Epic"],
          evidence:
            "SAMPLE: Healthcare application roles commonly appear in large health-system hiring.",
          sourceUrls: ["https://jobs.adventhealth.com"],
          businessImplication:
            "Integration and adjacent application development often create sustained engineering workload.",
          cursorRelevance:
            "Cursor relevance is strongest for custom/integration software around Epic — validate with the customer.",
          confidence: "Low",
          claimType: "SALES_HYPOTHESIS",
        },
      ],
      summary:
        "SAMPLE Job Intelligence: relevant technical openings cluster around software delivery, cloud/data, and healthcare applications. Treat counts as demo data until live job research is connected.",
    },
    buyingCommittee: {
      isSample: true,
      relationshipNote:
        "Relationships are UNKNOWN unless a public source confirms them. Do not treat this as an org chart.",
      people: [
        {
          name: "Victoria (Tori) Wick",
          title: "Senior Vice President & Chief Information Officer",
          role: "EXECUTIVE SPONSOR",
          relevantInitiative: "Enterprise technology and digital modernization",
          potentialPriority: "Reliable digital delivery at health-system scale",
          whyTheyMayCare:
            "Owns technology strategy and likely sponsors major developer/platform investments.",
          reasonToContact:
            "Primary executive sponsor for enterprise tooling decisions.",
          outreachAngle:
            "Ask how digital and AI initiatives are affecting engineering capacity and tooling standards.",
          evidence:
            "Listed on AdventHealth leadership materials as SVP & CIO (verify before outreach).",
          sourceUrl: "https://www.adventhealth.com/leadership",
          confidence: "Medium",
          relationshipStatus: "UNKNOWN",
          claimType: "FACT",
          isPlaceholderName: false,
        },
        {
          name: "[Confirm from public sources]",
          title: "VP / Director, Software Engineering or Digital Products",
          role: "TECHNICAL CHAMPION",
          relevantInitiative: "Application and digital product delivery",
          potentialPriority: "Developer velocity and platform quality",
          whyTheyMayCare:
            "Closest to day-to-day software delivery and tooling evaluation.",
          reasonToContact:
            "Likely technical champion for an AI coding pilot.",
          outreachAngle:
            "Discuss where teams lose time in delivery and whether AI coding tools are under evaluation.",
          evidence:
            "SAMPLE PLACEHOLDER — title pattern inferred from hiring; person not confirmed.",
          sourceUrl: "https://jobs.adventhealth.com",
          confidence: "Low",
          relationshipStatus: "UNKNOWN",
          claimType: "INFERENCE",
          isPlaceholderName: true,
        },
        {
          name: "[Confirm from public sources]",
          title: "Director of Platform Engineering / DevOps",
          role: "TECHNICAL EVALUATOR",
          relevantInitiative: "Cloud, CI/CD, and platform enablement",
          potentialPriority: "Secure, scalable developer workflows",
          whyTheyMayCare:
            "Evaluates how new tools fit existing SDLC and platform standards.",
          reasonToContact:
            "Important for proving Cursor works in their delivery environment.",
          outreachAngle:
            "Ask about current IDE/SCM standards, CI/CD constraints, and pilot requirements.",
          evidence: "SAMPLE PLACEHOLDER based on common enterprise buying roles.",
          sourceUrl: "https://jobs.adventhealth.com",
          confidence: "Low",
          relationshipStatus: "UNKNOWN",
          claimType: "INFERENCE",
          isPlaceholderName: true,
        },
        {
          name: "[Confirm from public sources]",
          title: "CISO / Security Architecture",
          role: "SECURITY / GOVERNANCE",
          relevantInitiative: "AI governance and data protection",
          potentialPriority: "Risk, privacy, and policy compliance",
          whyTheyMayCare:
            "AI coding tools raise questions about code privacy, access, and governance.",
          reasonToContact:
            "Needed to clear security/governance objections in a healthcare environment.",
          outreachAngle:
            "Lead with privacy mode, SSO, auditability, and healthcare-ready controls.",
          evidence: "SAMPLE PLACEHOLDER — confirm actual security leaders publicly.",
          sourceUrl: "https://www.adventhealth.com/leadership",
          confidence: "Low",
          relationshipStatus: "UNKNOWN",
          claimType: "INFERENCE",
          isPlaceholderName: true,
        },
        {
          name: "Victoria (Tori) Wick",
          title: "SVP & CIO (also economic influence)",
          role: "ECONOMIC / PROCUREMENT",
          relevantInitiative: "Technology investment prioritization",
          potentialPriority: "Value, risk, and enterprise standards",
          whyTheyMayCare:
            "Often involved in vendor prioritization even when procurement executes contracts.",
          reasonToContact:
            "Helpful for understanding budget ownership and evaluation criteria.",
          outreachAngle:
            "Frame ROI around capacity, delivery speed, and governed adoption — not hype.",
          evidence:
            "CIO role often overlaps economic buying influence; procurement contact still unknown.",
          sourceUrl: "https://www.adventhealth.com/leadership",
          confidence: "Low",
          relationshipStatus: "INFERRED",
          claimType: "INFERENCE",
          isPlaceholderName: false,
        },
      ],
      topPeopleToProspect: [
        {
          name: "Victoria (Tori) Wick",
          title: "SVP & CIO",
          role: "EXECUTIVE SPONSOR",
          rankReason:
            "Confirmed public technology executive with likely sponsorship power.",
          relatedSignal: "Digital / technology modernization language + IT hiring",
          cursorAngle:
            "Enterprise-ready AI development tooling to support digital delivery capacity.",
          firstConversationTopic:
            "Where engineering capacity is becoming a constraint on digital initiatives.",
        },
        {
          name: "[Confirm] VP / Director Software Engineering",
          title: "Technical Champion (to confirm)",
          role: "TECHNICAL CHAMPION",
          rankReason:
            "Highest likelihood of owning the pilot and daily developer workflow.",
          relatedSignal: "Software engineering hiring volume",
          cursorAngle:
            "Team productivity on integration-heavy and digital product work.",
          firstConversationTopic:
            "Current developer tooling stack and openness to a governed AI coding pilot.",
        },
        {
          name: "[Confirm] Security / AI Governance lead",
          title: "Security / Governance (to confirm)",
          role: "SECURITY / GOVERNANCE",
          rankReason:
            "Healthcare buying almost always requires early security involvement.",
          relatedSignal: "AI-related hiring and digital initiatives",
          cursorAngle: "Privacy, SSO, and controlled rollout model.",
          firstConversationTopic:
            "What an acceptable AI coding pilot would need for security approval.",
        },
      ],
    },
    roiAssumptions: {
      developerPopulation: 250,
      developerPopulationLabel: "USER ASSUMPTION",
      potentialCursorUsers: 100,
      potentialCursorUsersLabel: "USER ASSUMPTION",
      avgFullyLoadedCost: 180000,
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
        "SCENARIO MODEL — NOT VERIFIED CUSTOMER SAVINGS.",
        "Developer population is not treated as a fact unless a public source confirms it.",
        "Edit assumptions during discovery; mark Customer Validated when confirmed.",
      ],
    },
    researchGaps: [
      {
        whatWeDontKnow: "Actual developer / engineer population",
        currentEvidence:
          "SAMPLE hiring volume suggests an active engineering org, but no confirmed headcount.",
        whyItMatters: "Needed for any credible ROI / rollout sizing conversation.",
        whoToAsk: "CIO, VP Engineering, or People/HR partner supporting technology",
        discoveryQuestion:
          "Roughly how many software engineers and adjacent builders are in scope for developer tooling?",
      },
      {
        whatWeDontKnow: "Existing AI coding platform (if any)",
        currentEvidence: "No confirmed public mention of Copilot, Claude, or Cursor adoption.",
        whyItMatters: "Determines displacement, coexistence, or greenfield evaluation path.",
        whoToAsk: "VP Engineering / Platform / Developer Experience",
        discoveryQuestion:
          "Which AI coding tools are already approved, piloted, or blocked today?",
      },
      {
        whatWeDontKnow: "Source control and developer environment standards",
        currentEvidence:
          "SAMPLE job language may mention GitHub/GitLab/Azure DevOps — not yet confirmed as enterprise standard.",
        whyItMatters: "Affects technical fit, rollout path, and evaluator stakeholders.",
        whoToAsk: "Platform Engineering / DevOps leadership",
        discoveryQuestion:
          "What is the standard SCM and IDE environment for application teams?",
      },
      {
        whatWeDontKnow: "AI governance and security review process",
        currentEvidence: "Healthcare context implies governance exists; process details unknown.",
        whyItMatters: "Pilot success depends on security/privacy approval path.",
        whoToAsk: "CISO, Security Architecture, AI Governance",
        discoveryQuestion:
          "What does an AI developer tool need to clear before a team pilot?",
      },
      {
        whatWeDontKnow: "Budget ownership and procurement path",
        currentEvidence: "CIO influence inferred; procurement process unknown.",
        whyItMatters: "Determines deal path, timeline, and economic buyer.",
        whoToAsk: "CIO chief of staff, procurement, strategic sourcing",
        discoveryQuestion:
          "Who owns budget and vendor evaluation for developer productivity tools?",
      },
      {
        whatWeDontKnow: "Developer productivity metrics currently tracked",
        currentEvidence: "None confirmed from public sources.",
        whyItMatters: "Needed to define success criteria for a pilot.",
        whoToAsk: "VP Engineering / DevEx",
        discoveryQuestion:
          "How do you currently measure engineering productivity or delivery health?",
      },
    ],
    whyNowSynthesis: [
      {
        trigger: "Digital / ambulatory expansion pressure",
        date: "Recent (sample)",
        evidence:
          "SAMPLE: Public messaging emphasizes virtual care, ambulatory access, and digital experience.",
        source: "AdventHealth news / about materials",
        sourceUrl: "https://www.adventhealth.com/news",
        relevantPersona: "CIO / Digital leadership",
        whyItMatters:
          "Expansion programs often increase software delivery demand.",
        cursorRelevance:
          "Creates a timing reason to discuss developer capacity and throughput.",
        discoveryQuestion:
          "Which digital initiatives are most constrained by engineering capacity right now?",
        confidence: "Medium",
        claimType: "INFERENCE",
        combinedSignals: ["Strategic initiatives", "Digital programs"],
      },
      {
        trigger: "Technical hiring across software, cloud, and data",
        date: "Recent (sample)",
        evidence:
          "SAMPLE: Careers pages show multiple relevant technical openings.",
        source: "AdventHealth careers",
        sourceUrl: "https://jobs.adventhealth.com",
        relevantPersona: "VP Engineering / Platform",
        whyItMatters:
          "Hiring can signal delivery pressure, new workstreams, or skill gaps.",
        cursorRelevance:
          "Productivity tooling can complement hiring by improving output per engineer.",
        discoveryQuestion:
          "Are new hires keeping pace with the backlog, or is throughput still constrained?",
        confidence: "Medium",
        claimType: "INFERENCE",
        combinedSignals: ["Job Intelligence", "Technology"],
      },
      {
        trigger: "AI / analytics interest combined with delivery hiring",
        date: "Recent (sample)",
        evidence:
          "SAMPLE: AI/digital language plus engineering hiring appear together in public materials.",
        source: "Leadership + careers (sample synthesis)",
        sourceUrl: "https://www.adventhealth.com",
        relevantPersona: "CIO + Technical Champion",
        whyItMatters:
          "Combined signals create a stronger sales hypothesis than either alone.",
        cursorRelevance:
          "AI ambitions often increase the need for teams that can ship internal software faster.",
        discoveryQuestion:
          "Where is AI work getting stuck — ideas, prototypes, productionization, or governance?",
        confidence: "Low",
        claimType: "SALES_HYPOTHESIS",
        combinedSignals: [
          "AI programs",
          "Software engineering hiring",
          "Executive digital messaging",
        ],
      },
      {
        trigger: "Healthcare governance raises the bar for AI tooling decisions",
        date: "Ongoing",
        evidence:
          "Industry context: health systems typically require security and privacy review for AI tools.",
        source: "Industry pattern (not account-specific proof)",
        sourceUrl: "https://www.adventhealth.com",
        relevantPersona: "CISO / AI Governance",
        whyItMatters:
          "Early security engagement can prevent stalled evaluations.",
        cursorRelevance:
          "Lead with governed rollout, privacy controls, and clear pilot boundaries.",
        discoveryQuestion:
          "What would a safe, approvable AI coding pilot look like here?",
        confidence: "Medium",
        claimType: "INFERENCE",
        combinedSignals: ["Security / Governance", "AI programs"],
      },
    ],
    prospectingPlan: {
      isSample: true,
      whoToTarget: [
        {
          persona: "CIO (Victoria Wick — verify)",
          whyThem: "Likely executive sponsor for enterprise developer tooling.",
          talkAbout:
            "Digital delivery capacity, governed AI adoption, and enterprise standards.",
          relatedSignal: "Public CIO role + digital modernization language",
        },
        {
          persona: "VP / Director Software Engineering (confirm)",
          whyThem: "Best technical champion for a real pilot.",
          talkAbout:
            "Where teams lose time and how AI coding tools could help on real repos.",
          relatedSignal: "Software engineering hiring",
        },
        {
          persona: "Security / AI Governance (confirm)",
          whyThem: "Required path in healthcare buying.",
          talkAbout: "Privacy, SSO, auditability, and pilot guardrails.",
          relatedSignal: "AI interest + regulated industry context",
        },
      ],
      conversationAngles: [
        "Digital and ambulatory initiatives may be increasing software delivery demand — validate whether engineering capacity is a bottleneck.",
        "Hiring across software/cloud/data may indicate active build work where developer productivity tools are timely.",
        "AI ambitions plus healthcare governance create a reason to discuss approved, team-ready AI coding workflows.",
      ],
      strongestWhyNow:
        "SAMPLE synthesis: digital expansion language + technical hiring + AI interest together suggest a timely conversation about developer capacity — still needs customer validation.",
      discoveryQuestions: [
        "Where is engineering capacity most constrained against digital or AI priorities?",
        "Which AI coding tools are already approved, piloted, or prohibited?",
        "Who owns budget and evaluation for developer productivity platforms?",
        "What would a successful 30-day pilot need to prove for engineering and security?",
        "How many builders would realistically be in an initial rollout cohort?",
      ],
      stillNeedToDiscover: [
        "Developer population",
        "Current AI coding stack",
        "SCM / IDE standards",
        "AI governance path",
        "Budget owner and procurement process",
      ],
      outreach: {
        email: `Subject: AdventHealth digital delivery capacity

Hi {{FirstName}},

I've been reviewing public materials around AdventHealth's digital and technology priorities, including ongoing technical hiring and digital care messaging.

I'm exploring whether engineering capacity is becoming a constraint as digital and AI work expands — and whether a governed AI coding pilot would be useful for your teams.

Would you be open to 20 minutes next week to compare notes?

Best,
{{YourName}}`,
        coldCallOpener:
          "Hi {{FirstName}}, this is {{YourName}}. I'm calling because AdventHealth's public digital and technology signals suggest active software delivery work, and I help engineering leaders evaluate governed AI coding tools. Is now a bad time for 30 seconds?",
        linkedInMessage:
          "Hi {{FirstName}} — following AdventHealth's public digital/technology priorities and technical hiring. Curious how your teams are approaching developer productivity as AI and digital work scales. Open to a short conversation?",
      },
    },
  };
}

function genericExperimental(
  companyName: string,
  companyWebsite: string,
): ExperimentalIntelligence {
  const site = companyWebsite.startsWith("http")
    ? companyWebsite
    : `https://${companyWebsite}`;

  return {
    jobIntelligence: {
      isSample: true,
      totalRelevantOpenings: 0,
      categories: [
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
      ],
      technologiesDetected: [],
      signals: [
        {
          signal: `No live job research connected yet for ${companyName}`,
          supportingJobPostings: [],
          supportingJobCount: 0,
          technologiesDetected: [],
          evidence:
            "SAMPLE placeholder — connect career-page / public job research later.",
          sourceUrls: [site],
          businessImplication:
            "Cannot yet infer delivery pressure from hiring without live postings.",
          cursorRelevance:
            "Use discovery to learn whether software delivery capacity is a priority.",
          confidence: "Low",
          claimType: "INFERENCE",
        },
      ],
      summary: `SAMPLE: Job Intelligence for ${companyName} will populate after live job research is connected.`,
    },
    buyingCommittee: {
      isSample: true,
      relationshipNote:
        "No confirmed org relationships. Placeholder personas only.",
      people: [
        {
          name: "[Confirm from public sources]",
          title: "CIO / CTO",
          role: "EXECUTIVE SPONSOR",
          relevantInitiative: "Technology strategy",
          potentialPriority: "Enterprise standards and investment outcomes",
          whyTheyMayCare: "Likely sponsor for developer tooling decisions.",
          reasonToContact: "Executive sponsorship and prioritization.",
          outreachAngle: "Ask about digital delivery capacity and AI tooling standards.",
          evidence: "SAMPLE placeholder persona",
          sourceUrl: site,
          confidence: "Low",
          relationshipStatus: "UNKNOWN",
          claimType: "INFERENCE",
          isPlaceholderName: true,
        },
        {
          name: "[Confirm from public sources]",
          title: "VP Engineering",
          role: "TECHNICAL CHAMPION",
          relevantInitiative: "Software delivery",
          potentialPriority: "Developer productivity",
          whyTheyMayCare: "Owns day-to-day engineering outcomes.",
          reasonToContact: "Best pilot champion candidate.",
          outreachAngle: "Discuss current tooling and throughput constraints.",
          evidence: "SAMPLE placeholder persona",
          sourceUrl: site,
          confidence: "Low",
          relationshipStatus: "UNKNOWN",
          claimType: "INFERENCE",
          isPlaceholderName: true,
        },
        {
          name: "[Confirm from public sources]",
          title: "CISO / Security Architecture",
          role: "SECURITY / GOVERNANCE",
          relevantInitiative: "AI and data governance",
          potentialPriority: "Risk and compliance",
          whyTheyMayCare: "AI tools require security review in many enterprises.",
          reasonToContact: "Clear the path for an approved pilot.",
          outreachAngle: "Lead with privacy and governance controls.",
          evidence: "SAMPLE placeholder persona",
          sourceUrl: site,
          confidence: "Low",
          relationshipStatus: "UNKNOWN",
          claimType: "INFERENCE",
          isPlaceholderName: true,
        },
      ],
      topPeopleToProspect: [
        {
          name: "[Confirm] CIO / CTO",
          title: "Executive Sponsor",
          role: "EXECUTIVE SPONSOR",
          rankReason: "Budget and sponsorship influence",
          relatedSignal: "Pending live research",
          cursorAngle: "Enterprise AI coding standards",
          firstConversationTopic: "Current developer productivity priorities",
        },
        {
          name: "[Confirm] VP Engineering",
          title: "Technical Champion",
          role: "TECHNICAL CHAMPION",
          rankReason: "Closest to pilot success",
          relatedSignal: "Pending live research",
          cursorAngle: "Team workflow and throughput",
          firstConversationTopic: "Where delivery is slowest today",
        },
      ],
    },
    roiAssumptions: {
      developerPopulation: 100,
      developerPopulationLabel: "USER ASSUMPTION",
      potentialCursorUsers: 40,
      potentialCursorUsersLabel: "USER ASSUMPTION",
      avgFullyLoadedCost: 175000,
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
        "SCENARIO MODEL — NOT VERIFIED CUSTOMER SAVINGS.",
        `No public developer count confirmed for ${companyName}.`,
      ],
    },
    researchGaps: [
      {
        whatWeDontKnow: "Developer population",
        currentEvidence: "None yet",
        whyItMatters: "Required for ROI sizing",
        whoToAsk: "CIO / VP Engineering",
        discoveryQuestion: `How large is the software engineering organization at ${companyName}?`,
      },
      {
        whatWeDontKnow: "Existing AI coding tools",
        currentEvidence: "None yet",
        whyItMatters: "Shapes competitive / complementary positioning",
        whoToAsk: "VP Engineering / DevEx",
        discoveryQuestion: "What AI coding tools are in use or under evaluation?",
      },
      {
        whatWeDontKnow: "Budget owner and procurement path",
        currentEvidence: "None yet",
        whyItMatters: "Determines deal path",
        whoToAsk: "CIO / Procurement",
        discoveryQuestion: "Who owns evaluation and budget for developer tools?",
      },
    ],
    whyNowSynthesis: [
      {
        trigger: "Live Why Now synthesis pending research",
        date: "N/A",
        evidence: `SAMPLE placeholder for ${companyName}`,
        source: "Pending",
        sourceUrl: site,
        relevantPersona: "CIO / VP Engineering",
        whyItMatters: "Need public signals before outreach timing claims.",
        cursorRelevance: "Use discovery to establish urgency.",
        discoveryQuestion: "What is driving technology investment urgency this year?",
        confidence: "Low",
        claimType: "INFERENCE",
      },
    ],
    prospectingPlan: {
      isSample: true,
      whoToTarget: [
        {
          persona: "CIO / CTO",
          whyThem: "Likely sponsor",
          talkAbout: "Digital delivery capacity and AI tooling standards",
          relatedSignal: "Pending live research",
        },
        {
          persona: "VP Engineering",
          whyThem: "Likely champion",
          talkAbout: "Developer productivity and pilot design",
          relatedSignal: "Pending live research",
        },
      ],
      conversationAngles: [
        `${companyName} may have software delivery pressure — validate with public hiring and initiative research.`,
        "AI adoption often increases demand for internal builders — confirm whether that is happening here.",
        "Governance requirements in healthcare can create urgency for approved tooling paths.",
      ],
      strongestWhyNow:
        "SAMPLE: Strongest Why Now will be generated after live research connects hiring, initiatives, and leadership signals.",
      discoveryQuestions: [
        `What are ${companyName}'s top technology priorities this year?`,
        "Where is engineering capacity most constrained?",
        "What AI developer tools are approved today?",
        "Who owns budget for developer productivity platforms?",
        "What would a successful pilot need to prove?",
      ],
      stillNeedToDiscover: [
        "Developer population",
        "Current AI coding stack",
        "Buying committee names",
        "Budget owner",
      ],
      outreach: {
        email: `Subject: ${companyName} developer productivity

Hi {{FirstName}},

I'm researching ${companyName}'s public technology priorities and would value a short conversation about how your teams are approaching developer productivity and AI coding tools.

Would 20 minutes next week work?

Best,
{{YourName}}`,
        coldCallOpener: `Hi {{FirstName}}, this is {{YourName}}. I'm calling about ${companyName}'s technology and engineering priorities and whether AI coding tools are on your radar. Is now a bad time for 30 seconds?`,
        linkedInMessage: `Hi {{FirstName}} — researching ${companyName}'s public technology priorities. Curious how your teams are thinking about developer productivity and AI coding tools.`,
      },
    },
  };
}

export function getExperimentalIntelligence(
  companyName: string,
  companyWebsite: string,
): ExperimentalIntelligence {
  if (companyName.trim().toLowerCase().includes("adventhealth")) {
    return adventHealthExperimental();
  }
  return genericExperimental(companyName, companyWebsite);
}
