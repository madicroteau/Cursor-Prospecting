import type { AccountDossier } from "./dossier-types";

function normalizeWebsite(website: string) {
  if (!website) return "";
  return website.startsWith("http") ? website : `https://${website}`;
}

/**
 * Builds a clearly labeled SAMPLE dossier so the results page
 * looks complete in demos before live research is connected.
 * This is not real research.
 */
export function buildPlaceholderDossier(
  companyName: string,
  companyWebsite: string,
): AccountDossier {
  const company = companyName.trim() || "This company";
  const website = normalizeWebsite(companyWebsite.trim());
  const siteLabel = website || "the company website";

  return {
    companyName: company,
    companyWebsite: website,
    isPlaceholder: true,
    executiveBrief: {
      companySummary: `${company} appears to be a large healthcare organization investing in digital care, modern IT, and operational efficiency. This summary is SAMPLE content for layout testing until live research is connected.`,
      strategicPriorities: [
        "Improve patient access and care quality",
        "Modernize clinical and operational systems",
        "Expand digital and AI-enabled capabilities",
      ],
      technologyPriorities: [
        "Cloud and platform modernization",
        "AI / automation for clinical and ops workflows",
        "Cybersecurity and data platforms",
      ],
      whyNowSignals: [
        "Public digital / AI language suggesting active modernization",
        "Technology hiring that may indicate delivery capacity needs",
        "Strategic growth or transformation messaging",
      ],
      topPersonas: [
        "CIO / VP Applications",
        "VP Engineering / Platform",
        "Chief Digital / AI Officer",
      ],
      recommendedAngle:
        "Explore whether software delivery speed and AI application development are becoming constraints as digital initiatives scale.",
    },
    whyNow: [
      {
        whatHappened: `${company} publicly discusses digital transformation and technology modernization.`,
        date: "Recent (sample)",
        evidence:
          "SAMPLE: Press or leadership language references digital care, modernization, or AI.",
        sourceId: "s1",
        whyItMatters:
          "Modernization programs often create urgency for better developer tooling and faster delivery.",
        cursorRelevance:
          "Possible opening to discuss AI-assisted software development for internal engineering teams.",
        confidence: "Medium",
        claimType: "INFERENCE",
      },
      {
        whatHappened:
          "Technology hiring appears active in software, cloud, data, or cybersecurity roles.",
        date: "Recent (sample)",
        evidence:
          "SAMPLE: Career pages show openings tied to engineering and digital platforms.",
        sourceId: "s2",
        whyItMatters:
          "Hiring volume can signal delivery pressure or new initiative staffing.",
        cursorRelevance:
          "If teams are hiring rapidly, productivity tools may help ramp and ship faster.",
        confidence: "Medium",
        claimType: "INFERENCE",
      },
      {
        whatHappened:
          "Leadership messaging emphasizes efficiency, quality, or innovation.",
        date: "Recent (sample)",
        evidence:
          "SAMPLE: Executive statements or strategic plan language.",
        sourceId: "s3",
        whyItMatters:
          "Efficiency goals can make engineering throughput a board-relevant topic.",
        cursorRelevance:
          "Frame Cursor around faster, safer delivery for mission-critical healthcare software.",
        confidence: "Low",
        claimType: "SALES_HYPOTHESIS",
      },
    ],
    people: [
      {
        name: "[Name to be confirmed from public sources]",
        title: "CIO or equivalent",
        whyRelevant:
          "Owns enterprise technology strategy and major platform investments.",
        initiativesOrStatements:
          "SAMPLE PLACEHOLDER — do not treat as a real person. Live research will replace this.",
        sourceId: "s1",
        claimType: "INFERENCE",
      },
      {
        name: "[Name to be confirmed from public sources]",
        title: "VP Engineering / Applications",
        whyRelevant:
          "Likely close to software delivery, modernization, and tooling decisions.",
        initiativesOrStatements:
          "SAMPLE PLACEHOLDER — do not treat as a real person.",
        sourceId: "s2",
        claimType: "INFERENCE",
      },
    ],
    hiring: {
      jobs: [
        {
          title: "Software Engineer (sample)",
          category: "Software engineering",
          technologies: ["Java", "Python", "Cloud"],
          sourceId: "s2",
        },
        {
          title: "Cloud / Platform Engineer (sample)",
          category: "Cloud / DevOps",
          technologies: ["AWS", "Kubernetes", "Terraform"],
          sourceId: "s2",
        },
        {
          title: "Data / AI Engineer (sample)",
          category: "AI / Data",
          technologies: ["Python", "Snowflake", "Machine Learning"],
          sourceId: "s2",
        },
      ],
      commonCategories: [
        "Software engineering",
        "Cloud / platform",
        "Data / AI",
        "Cybersecurity",
      ],
      technologiesMentioned: [
        "AWS",
        "Python",
        "Java",
        "Kubernetes",
        "Snowflake",
      ],
      patterns:
        "SAMPLE: Open roles cluster around application delivery, cloud platforms, and data/AI.",
      patternSuggestion:
        "This may suggest active build work and a need to improve engineering productivity — validate with the customer.",
    },
    initiatives: [
      {
        name: "Digital transformation / digital care",
        evidence:
          "SAMPLE: Public website or press language about digital patient experiences.",
        date: "Recent (sample)",
        sourceId: "s1",
        relevantExecutive: "CIO / Chief Digital Officer (if confirmed)",
        salesRelevance:
          "Digital programs usually require more software delivery capacity.",
        claimType: "INFERENCE",
      },
      {
        name: "AI / automation exploration",
        evidence:
          "SAMPLE: Mentions of AI, automation, or advanced analytics in public materials.",
        date: "Recent (sample)",
        sourceId: "s3",
        salesRelevance:
          "AI initiatives often increase demand for developers who can ship internal tools quickly.",
        claimType: "SALES_HYPOTHESIS",
      },
      {
        name: "Cloud / application modernization",
        evidence:
          "SAMPLE: Job posts or IT messaging referencing cloud migration or modernization.",
        date: "Recent (sample)",
        sourceId: "s2",
        salesRelevance:
          "Modernization work creates a reason to talk about developer velocity and code quality.",
        claimType: "INFERENCE",
      },
    ],
    technologies: [
      {
        name: "Epic",
        evidence:
          "SAMPLE: Common in large health systems; only keep if a source confirms it.",
        sourceId: "s1",
      },
      {
        name: "AWS or Azure",
        evidence:
          "SAMPLE: Often referenced in cloud engineering job posts.",
        sourceId: "s2",
      },
      {
        name: "Python / Java",
        evidence:
          "SAMPLE: Frequently listed in software and data engineering openings.",
        sourceId: "s2",
      },
    ],
    financial: [
      {
        title: "Capital / growth investment areas",
        detail:
          "SAMPLE: Look in annual reports, bond disclosures, or strategic plans for IT, facilities, and digital investment language.",
        sourceId: "s4",
        claimType: "INFERENCE",
      },
      {
        title: "Cost pressure or efficiency focus",
        detail:
          "SAMPLE: Public comments about operating efficiency can support a productivity conversation.",
        sourceId: "s4",
        claimType: "SALES_HYPOTHESIS",
      },
    ],
    prospectingPlan: {
      whoToTarget: [
        {
          persona: "CIO / VP Applications",
          why: "Owns major technology investments and delivery outcomes.",
          relatedSignal: "Digital / modernization language in public materials.",
          talkAbout:
            "How engineering teams are keeping pace with digital and AI demand.",
        },
        {
          persona: "VP Engineering / Platform",
          why: "Closest to developer tooling and software throughput.",
          relatedSignal: "Hiring for engineering and platform roles.",
          talkAbout:
            "Where AI-assisted development could reduce cycle time without increasing headcount risk.",
        },
        {
          persona: "Chief Digital / AI Officer",
          why: "Accountable for turning AI ideas into shipped products.",
          relatedSignal: "AI and automation messaging.",
          talkAbout:
            "How internal builders can prototype and productionize AI features faster.",
        },
      ],
      conversationAngles: [
        `${company} appears to be scaling digital initiatives — engineering capacity may become the bottleneck.`,
        "Hiring across cloud, software, and data may indicate delivery pressure that tooling can ease.",
        "AI ambitions create a need for teams that can ship internal applications quickly and safely.",
      ],
      whyNowSummary:
        "SAMPLE: Public modernization language plus technology hiring create a timely reason to open a conversation — validate with live sources next.",
      discoveryQuestions: [
        `Where is ${company} feeling the most pressure to deliver software faster this year?`,
        "Which teams own internal AI or digital product development today?",
        "Are platform or application teams constrained more by headcount, tooling, or process?",
        "What does a typical change look like from idea to production for internal apps?",
        "How are you evaluating AI coding tools for regulated healthcare environments?",
      ],
      outreach: {
        email: `Subject: Quick question on ${company}'s digital delivery capacity

Hi {{FirstName}},

I've been reviewing public materials around ${company}'s digital and technology priorities. It looks like modernization and AI/digital work may be expanding.

I'd value 20 minutes to learn how your engineering teams are balancing delivery speed with quality in a healthcare environment — and whether AI-assisted development is on your radar.

Would next week work for a brief conversation?

Best,
{{YourName}}`,
        coldCallOpener: `Hi {{FirstName}}, this is {{YourName}}. I'm calling because ${company} appears to be investing in digital and technology modernization, and I help engineering leaders improve software delivery speed with AI-assisted development. Is now a bad time for 30 seconds?`,
        linkedInMessage: `Hi {{FirstName}} — following ${company}'s public digital/technology priorities. Curious how your teams are approaching developer productivity as AI and modernization work scales. Open to a short conversation?`,
      },
    },
    sources: [
      {
        id: "s1",
        title: `${company} website / news (sample)`,
        url: website || siteLabel,
        date: "Sample",
        usedFor: "Company summary, initiatives, and technology clues",
      },
      {
        id: "s2",
        title: `${company} careers page (sample)`,
        url: website ? `${website.replace(/\/$/, "")}/careers` : "#",
        date: "Sample",
        usedFor: "Hiring patterns and technology mentions",
      },
      {
        id: "s3",
        title: "Leadership / strategy communications (sample)",
        url: website || "#",
        date: "Sample",
        usedFor: "Why Now signals and AI/digital language",
      },
      {
        id: "s4",
        title: "Public financial or strategic documents (sample)",
        url: website || "#",
        date: "Sample",
        usedFor: "Investment priorities and cost-pressure clues",
      },
    ],
  };
}
