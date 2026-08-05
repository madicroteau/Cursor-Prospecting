/**
 * Compliance & Security intelligence models + builders.
 * Sales intelligence only — not legal advice.
 */

import type { ClaimType, Confidence } from "@/lib/claim-types";
import type { WhyNowSignal } from "@/lib/experimental-intelligence";

export type RegulationClassification =
  | "MANDATORY REGULATION"
  | "CONTRACTUAL / PROGRAM REQUIREMENT"
  | "INDUSTRY STANDARD"
  | "VOLUNTARY GUIDANCE"
  | "PROPOSED / PENDING RULE";

export type ApplicabilityStatus =
  | "CONFIRMED APPLICABLE"
  | "LIKELY APPLICABLE"
  | "POSSIBLY APPLICABLE"
  | "NOT ENOUGH EVIDENCE";

export type ChangeStatus =
  | "FINAL"
  | "PROPOSED"
  | "EFFECTIVE"
  | "PENDING"
  | "GUIDANCE ONLY";

export type ControlArea =
  | "AI governance"
  | "Data privacy"
  | "Access control"
  | "Auditability"
  | "Identity"
  | "Secure software development"
  | "Third-party risk"
  | "Model governance"
  | "Developer tooling"
  | "Data protection";

export type PenaltyAmountCategory =
  | "STATUTORY"
  | "INFLATION-ADJUSTED"
  | "SETTLEMENT-SPECIFIC"
  | "OTHER"
  | "NOT VERIFIED";

export interface ApplicableRegulation {
  regulation: string;
  regulatoryAuthority: string;
  classification: RegulationClassification;
  applicability: ApplicabilityStatus;
  whyItMayApply: string;
  effectiveDate: string;
  mostRecentUpdate: string;
  officialSourceTitle: string;
  officialSourceUrl: string;
  confidence: Confidence;
  claimType: ClaimType;
  evidence: string;
}

export interface SecurityGuidanceItem {
  framework: string;
  issuingAuthority: string;
  mandatoryOrVoluntary: "MANDATORY" | "VOLUNTARY";
  relevantSecurityAreas: string[];
  whyItMayMatter: string;
  officialSourceTitle: string;
  officialSourceUrl: string;
  lastUpdated: string;
  confidence: Confidence;
  claimType: ClaimType;
}

export interface PenaltyConsequence {
  requirement: string;
  category: string;
  amountOrRange: string;
  amountCategory: PenaltyAmountCategory;
  authority: string;
  effectiveYearOrDate: string;
  officialSourceTitle: string;
  officialSourceUrl: string;
  notes: string;
  confidence: Confidence;
  claimType: ClaimType;
}

export interface RegulatoryChange {
  whatChanged: string;
  date: string;
  status: ChangeStatus;
  issuingAuthority: string;
  whoMayBeAffected: string;
  potentialAccountImpact: string;
  officialSourceTitle: string;
  officialSourceUrl: string;
  confidence: Confidence;
  claimType: ClaimType;
}

export interface AccountImpactItem {
  requirement: string;
  controlArea: ControlArea;
  accountImplication: string;
  potentialCursorConversation: string;
  targetPersona: string;
  discoveryQuestion: string;
  confidence: Confidence;
  claimType: ClaimType;
  requiresProductValidation: boolean;
}

export interface CursorRelevanceItem {
  topic: string;
  whyItMayMatter: string;
  enterpriseAiAngle: string;
  requiresProductValidation: boolean;
  confidence: Confidence;
  claimType: ClaimType;
}

export interface RegulatoryWhyNowTrigger {
  trigger: string;
  date: string;
  status: ChangeStatus;
  authority: string;
  accountRelevance: string;
  securityTechImplication: string;
  potentialCursorRelevance: string;
  targetPersona: string;
  discoveryQuestion: string;
  officialSourceTitle: string;
  officialSourceUrl: string;
  confidence: Confidence;
  claimType: ClaimType;
}

export interface ComplianceSecurityIntelligence {
  isSample: boolean;
  disclaimer: string;
  accountContextSummary: string;
  applicableRegulations: ApplicableRegulation[];
  securityGuidance: SecurityGuidanceItem[];
  penalties: PenaltyConsequence[];
  latestChanges: RegulatoryChange[];
  accountImpact: AccountImpactItem[];
  cursorRelevance: CursorRelevanceItem[];
  whyNowTriggers: RegulatoryWhyNowTrigger[];
  discoveryQuestions: string[];
}

export type ComplianceBuildContext = {
  companyName: string;
  companyWebsite: string;
  industry?: string;
  headquarters?: string;
  researchText?: string;
  isSample?: boolean;
};

function isHealthcareContext(ctx: ComplianceBuildContext) {
  const text = `${ctx.companyName} ${ctx.industry || ""} ${ctx.researchText || ""}`.toLowerCase();
  return /health|hospital|medical|clinic|ehr|hipaa|patient|provider/.test(text);
}

function isFloridaContext(ctx: ComplianceBuildContext) {
  const text = `${ctx.headquarters || ""} ${ctx.companyWebsite || ""} ${ctx.researchText || ""}`.toLowerCase();
  return /florida|\bfl\b|orlando|tampa|jacksonville|miami/.test(text);
}

function mentionsComplianceInResearch(text: string) {
  return /hipaa|hitech|ocr|cms|cisa|nist|breach notification|cybersecurity|42 cfr|part 2|pci dss/.test(
    text.toLowerCase(),
  );
}

/** Map regulatory Why Now triggers into the shared Why Now signal shape. */
export function regulatoryTriggersToWhyNowSignals(
  triggers: RegulatoryWhyNowTrigger[],
): WhyNowSignal[] {
  return triggers.map((trigger) => ({
    trigger: trigger.trigger,
    date: trigger.date,
    evidence: `${trigger.accountRelevance} Status: ${trigger.status}. Authority: ${trigger.authority}. ${trigger.securityTechImplication}`,
    source: trigger.officialSourceTitle,
    sourceUrl: trigger.officialSourceUrl,
    relevantPersona: trigger.targetPersona,
    whyItMatters: trigger.accountRelevance,
    cursorRelevance: trigger.potentialCursorRelevance,
    discoveryQuestion: trigger.discoveryQuestion,
    confidence: trigger.confidence,
    claimType: trigger.claimType,
    combinedSignals: ["Regulatory / Compliance", trigger.status],
  }));
}

function whyNowScore(signal: WhyNowSignal) {
  let score =
    signal.confidence === "High" ? 30 : signal.confidence === "Medium" ? 20 : 10;
  if (signal.claimType === "FACT") score += 15;
  else if (signal.claimType === "INFERENCE") score += 8;
  // No automatic compliance priority — compete evenly with other signals.
  return score;
}

/** Merge Why Now signals across categories; strongest evidence wins. */
export function mergeWhyNowSignals(
  signals: WhyNowSignal[],
  limit = 6,
): WhyNowSignal[] {
  const seen = new Set<string>();
  const deduped: WhyNowSignal[] = [];
  for (const signal of signals) {
    const key = signal.trigger.toLowerCase().slice(0, 120);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(signal);
  }
  return deduped.sort((a, b) => whyNowScore(b) - whyNowScore(a)).slice(0, limit);
}

export function buildComplianceSecurityIntelligence(
  ctx: ComplianceBuildContext,
): ComplianceSecurityIntelligence {
  const company = ctx.companyName.trim() || "This account";
  const healthcare = isHealthcareContext(ctx);
  const florida = isFloridaContext(ctx);
  const research = (ctx.researchText || "").toLowerCase();
  const researchMentionsCompliance = mentionsComplianceInResearch(research);
  const isSample = Boolean(ctx.isSample);

  const accountContextSummary = [
    healthcare
      ? `${company} appears to operate in a healthcare / provider context based on public materials.`
      : `${company} industry context is not clearly confirmed as a covered healthcare provider from available signals.`,
    florida
      ? "Florida geographic signals appear in headquarters or public materials."
      : "State jurisdiction is not confirmed from available materials.",
    "This page is sales intelligence only — not legal advice. Applicability must be validated with the customer and counsel.",
  ].join(" ");

  const applicableRegulations: ApplicableRegulation[] = [];

  if (healthcare) {
    applicableRegulations.push(
      {
        regulation: "HIPAA Privacy Rule",
        regulatoryAuthority: "HHS / OCR",
        classification: "MANDATORY REGULATION",
        applicability: researchMentionsCompliance
          ? "LIKELY APPLICABLE"
          : "LIKELY APPLICABLE",
        whyItMayApply:
          "Public materials suggest healthcare operations that often involve protected health information (PHI). Confirm covered-entity / business-associate status.",
        effectiveDate: "Ongoing (Privacy Rule framework)",
        mostRecentUpdate: "See HHS OCR HIPAA materials for current rule text",
        officialSourceTitle: "HHS — HIPAA Privacy Rule",
        officialSourceUrl: "https://www.hhs.gov/hipaa/for-professionals/privacy/index.html",
        confidence: "Medium",
        claimType: "INFERENCE",
        evidence:
          "Healthcare industry signals in account research; covered-entity status not independently confirmed in this build.",
      },
      {
        regulation: "HIPAA Security Rule",
        regulatoryAuthority: "HHS / OCR",
        classification: "MANDATORY REGULATION",
        applicability: "LIKELY APPLICABLE",
        whyItMayApply:
          "If the organization is a covered entity or business associate, Security Rule administrative, physical, and technical safeguards typically apply to ePHI.",
        effectiveDate: "Ongoing (Security Rule framework)",
        mostRecentUpdate: "See HHS OCR HIPAA Security Rule materials",
        officialSourceTitle: "HHS — HIPAA Security Rule",
        officialSourceUrl: "https://www.hhs.gov/hipaa/for-professionals/security/index.html",
        confidence: "Medium",
        claimType: "INFERENCE",
        evidence:
          "Inferred from healthcare context; confirm ePHI systems and BA/CE status in discovery.",
      },
      {
        regulation: "HIPAA Breach Notification Rule",
        regulatoryAuthority: "HHS / OCR",
        classification: "MANDATORY REGULATION",
        applicability: "LIKELY APPLICABLE",
        whyItMayApply:
          "Covered entities and business associates generally have breach notification obligations when unsecured PHI is compromised.",
        effectiveDate: "Ongoing",
        mostRecentUpdate: "See HHS OCR breach notification materials",
        officialSourceTitle: "HHS — Breach Notification Rule",
        officialSourceUrl:
          "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html",
        confidence: "Medium",
        claimType: "INFERENCE",
        evidence: "Tied to likely HIPAA applicability; not a confirmed incident signal.",
      },
      {
        regulation: "HITECH Act (related HIPAA enforcement / EHR incentives context)",
        regulatoryAuthority: "HHS / OCR / Congress",
        classification: "MANDATORY REGULATION",
        applicability: "POSSIBLY APPLICABLE",
        whyItMayApply:
          "HITECH strengthened HIPAA enforcement and breach-related expectations for many healthcare organizations. Confirm specific obligations with counsel.",
        effectiveDate: "2009+ (statutory framework)",
        mostRecentUpdate: "See HHS HITECH / HIPAA enforcement materials",
        officialSourceTitle: "HHS — HITECH Act",
        officialSourceUrl: "https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html",
        confidence: "Low",
        claimType: "INFERENCE",
        evidence: "Possible based on healthcare context only.",
      },
    );
  } else {
    applicableRegulations.push({
      regulation: "HIPAA suite (Privacy / Security / Breach Notification)",
      regulatoryAuthority: "HHS / OCR",
      classification: "MANDATORY REGULATION",
      applicability: "NOT ENOUGH EVIDENCE",
      whyItMayApply:
        "HIPAA applicability depends on covered-entity or business-associate status. Current public signals do not clearly establish that here.",
      effectiveDate: "N/A until applicability confirmed",
      mostRecentUpdate: "N/A",
      officialSourceTitle: "HHS — HIPAA for Professionals",
      officialSourceUrl: "https://www.hhs.gov/hipaa/for-professionals/index.html",
      confidence: "Low",
      claimType: "INFERENCE",
      evidence: "Insufficient public evidence of covered healthcare operations.",
    });
  }

  applicableRegulations.push({
    regulation: "42 CFR Part 2 (substance use disorder confidentiality)",
    regulatoryAuthority: "HHS / SAMHSA",
    classification: "MANDATORY REGULATION",
    applicability: "NOT ENOUGH EVIDENCE",
    whyItMayApply:
      "Applies only when Part 2 programs / SUD records are in scope. Do not assume applicability for all health systems.",
    effectiveDate: "See current Part 2 rule text",
    mostRecentUpdate: "Confirm on eCFR / SAMHSA materials",
    officialSourceTitle: "eCFR — 42 CFR Part 2",
    officialSourceUrl: "https://www.ecfr.gov/current/title-42/chapter-I/subchapter-A/part-2",
    confidence: "Low",
    claimType: "INFERENCE",
    evidence: "No confirmed Part 2 program evidence in local analysis.",
  });

  if (florida && healthcare) {
    applicableRegulations.push({
      regulation: "Florida healthcare / privacy / breach notification requirements",
      regulatoryAuthority: "Florida Legislature / Florida AG / AHCA (as applicable)",
      classification: "MANDATORY REGULATION",
      applicability: "POSSIBLY APPLICABLE",
      whyItMayApply:
        "Florida geographic signals appear. State privacy/breach obligations may apply in addition to HIPAA — confirm which Florida statutes cover this entity.",
      effectiveDate: "Confirm statute-specific effective dates",
      mostRecentUpdate: "Confirm via Florida Legislature / AG materials",
      officialSourceTitle: "Florida Legislature — Online Sunshine",
      officialSourceUrl: "https://www.leg.state.fl.us/",
      confidence: "Low",
      claimType: "INFERENCE",
      evidence: "Florida location signals present; specific statute mapping not verified in this build.",
    });
  } else {
    applicableRegulations.push({
      regulation: "State healthcare / privacy / breach requirements",
      regulatoryAuthority: "State regulators (jurisdiction TBD)",
      classification: "MANDATORY REGULATION",
      applicability: "NOT ENOUGH EVIDENCE",
      whyItMayApply:
        "State obligations depend on confirmed headquarters, facilities, and data subjects. Jurisdiction not confirmed.",
      effectiveDate: "Unknown",
      mostRecentUpdate: "Unknown",
      officialSourceTitle: "Confirm state regulator after jurisdiction known",
      officialSourceUrl: "https://www.hhs.gov/hipaa/for-professionals/index.html",
      confidence: "Low",
      claimType: "INFERENCE",
      evidence: "State not confidently established from available materials.",
    });
  }

  applicableRegulations.push(
    {
      regulation: "CMS program / Conditions of Participation requirements (if applicable)",
      regulatoryAuthority: "CMS",
      classification: "CONTRACTUAL / PROGRAM REQUIREMENT",
      applicability: healthcare ? "POSSIBLY APPLICABLE" : "NOT ENOUGH EVIDENCE",
      whyItMayApply:
        "Medicare/Medicaid participation can create program requirements beyond baseline HIPAA. Participation status not confirmed here.",
      effectiveDate: "Program-specific",
      mostRecentUpdate: "See CMS materials for applicable CoPs / conditions",
      officialSourceTitle: "CMS.gov",
      officialSourceUrl: "https://www.cms.gov/",
      confidence: "Low",
      claimType: "INFERENCE",
      evidence: "No confirmed Medicare/Medicaid participation filing extracted in local analysis.",
    },
    {
      regulation: "PCI DSS",
      regulatoryAuthority: "PCI Security Standards Council (contractual via payment brands/acquirers)",
      classification: "INDUSTRY STANDARD",
      applicability: "NOT ENOUGH EVIDENCE",
      whyItMayApply:
        "May apply if cardholder data is stored, processed, or transmitted. Payment-environment evidence not confirmed.",
      effectiveDate: "Version-specific",
      mostRecentUpdate: "See PCI SSC for current standard version",
      officialSourceTitle: "PCI Security Standards Council",
      officialSourceUrl: "https://www.pcisecuritystandards.org/",
      confidence: "Low",
      claimType: "INFERENCE",
      evidence: "No confirmed cardholder-data environment signals in local analysis.",
    },
  );

  const securityGuidance: SecurityGuidanceItem[] = [
    {
      framework: "HHS Healthcare and Public Health Cybersecurity Performance Goals (CPGs)",
      issuingAuthority: "HHS",
      mandatoryOrVoluntary: "VOLUNTARY",
      relevantSecurityAreas: [
        "Asset inventory",
        "Access control",
        "Vulnerability management",
        "Incident response",
        "Third-party risk",
      ],
      whyItMayMatter:
        "Useful benchmark for healthcare cybersecurity maturity conversations with CISO / security architecture stakeholders — not a substitute for mandatory HIPAA Security Rule analysis.",
      officialSourceTitle: "HHS — Healthcare Cybersecurity Performance Goals",
      officialSourceUrl:
        "https://www.hhs.gov/hipaa/for-professionals/security/guidance/cybersecurity-performance-goals/index.html",
      lastUpdated: "See HHS page for current publication date",
      confidence: "Medium",
      claimType: "FACT",
    },
    {
      framework: "NIST Cybersecurity Framework (CSF)",
      issuingAuthority: "NIST",
      mandatoryOrVoluntary: "VOLUNTARY",
      relevantSecurityAreas: [
        "Identify",
        "Protect",
        "Detect",
        "Respond",
        "Recover",
        "Govern",
      ],
      whyItMayMatter:
        "Common enterprise language for discussing controls around AI tooling, access, and third-party risk.",
      officialSourceTitle: "NIST Cybersecurity Framework",
      officialSourceUrl: "https://www.nist.gov/cyberframework",
      lastUpdated: "See NIST CSF publication page",
      confidence: "High",
      claimType: "FACT",
    },
    {
      framework: "HHS Health Industry Cybersecurity Practices (HICP)",
      issuingAuthority: "HHS / 405(d) Task Group",
      mandatoryOrVoluntary: "VOLUNTARY",
      relevantSecurityAreas: [
        "Email security",
        "Endpoint protection",
        "Access management",
        "Network practices",
      ],
      whyItMayMatter:
        "Healthcare-oriented practical cybersecurity practices that often inform security questionnaire / risk discussions.",
      officialSourceTitle: "HHS 405(d) — HICP",
      officialSourceUrl: "https://405d.hhs.gov/hicp",
      lastUpdated: "See 405(d) site for current edition",
      confidence: "Medium",
      claimType: "FACT",
    },
    {
      framework: "CISA cybersecurity guidance (healthcare / critical infrastructure)",
      issuingAuthority: "CISA",
      mandatoryOrVoluntary: "VOLUNTARY",
      relevantSecurityAreas: [
        "Vulnerability management",
        "Incident response",
        "Supply chain risk",
        "Secure by design",
      ],
      whyItMayMatter:
        "Useful for discussing third-party technology risk and secure development expectations without treating guidance as law.",
      officialSourceTitle: "CISA",
      officialSourceUrl: "https://www.cisa.gov/",
      lastUpdated: "Ongoing guidance publications",
      confidence: "Medium",
      claimType: "FACT",
    },
    {
      framework: "NIST Secure Software Development Framework (SSDF) — SP 800-218",
      issuingAuthority: "NIST",
      mandatoryOrVoluntary: "VOLUNTARY",
      relevantSecurityAreas: [
        "Secure software development",
        "Verification",
        "Supply chain",
        "Developer tooling controls",
      ],
      whyItMayMatter:
        "Creates a natural bridge from secure development expectations to how AI-assisted coding is governed inside the enterprise.",
      officialSourceTitle: "NIST SP 800-218 (SSDF)",
      officialSourceUrl: "https://csrc.nist.gov/pubs/sp/800/218/final",
      lastUpdated: "See NIST publication record",
      confidence: "High",
      claimType: "FACT",
    },
    {
      framework: "Zero Trust architecture guidance (NIST / CISA)",
      issuingAuthority: "NIST / CISA",
      mandatoryOrVoluntary: "VOLUNTARY",
      relevantSecurityAreas: ["Identity", "Access control", "Least privilege", "Continuous verification"],
      whyItMayMatter:
        "Relevant when discussing identity, access, and auditability for developer / AI tooling platforms.",
      officialSourceTitle: "NIST SP 800-207 — Zero Trust Architecture",
      officialSourceUrl: "https://csrc.nist.gov/pubs/sp/800/207/final",
      lastUpdated: "See NIST publication record",
      confidence: "Medium",
      claimType: "FACT",
    },
  ];

  const penalties: PenaltyConsequence[] = healthcare
    ? [
        {
          requirement: "HIPAA civil monetary penalties (general framework)",
          category: "Civil monetary penalties",
          amountOrRange: "CURRENT PENALTY NOT VERIFIED",
          amountCategory: "NOT VERIFIED",
          authority: "HHS / OCR",
          effectiveYearOrDate: "Confirm current inflation-adjusted tiers on HHS.gov",
          officialSourceTitle: "HHS — HIPAA Enforcement / Penalty information",
          officialSourceUrl: "https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/index.html",
          notes:
            "HIPAA CMP tiers exist in statute/regulation and are periodically adjusted. Do not quote a dollar amount in outreach until verified from the current official HHS publication.",
          confidence: "Medium",
          claimType: "FACT",
        },
        {
          requirement: "HIPAA breach notification obligations",
          category: "Breach notification requirements",
          amountOrRange: "CURRENT PENALTY NOT VERIFIED",
          amountCategory: "NOT VERIFIED",
          authority: "HHS / OCR",
          effectiveYearOrDate: "Ongoing",
          officialSourceTitle: "HHS — Breach Notification Rule",
          officialSourceUrl:
            "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html",
          notes:
            "Notification timelines and content requirements are defined in the Breach Notification Rule. Confirm current text before citing specifics.",
          confidence: "Medium",
          claimType: "FACT",
        },
        {
          requirement: "OCR investigations / corrective action / resolution agreements",
          category: "Regulatory investigations / Resolution agreements",
          amountOrRange: "CURRENT PENALTY NOT VERIFIED",
          amountCategory: "SETTLEMENT-SPECIFIC",
          authority: "HHS / OCR",
          effectiveYearOrDate: "Case-specific",
          officialSourceTitle: "HHS OCR Enforcement Examples / Resolution Agreements",
          officialSourceUrl: "https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/index.html",
          notes:
            "Settlement amounts are case-specific. Never generalize a settlement amount as the statutory penalty for this account.",
          confidence: "Medium",
          claimType: "FACT",
        },
      ]
    : [
        {
          requirement: "Applicable mandatory penalties",
          category: "Other material enforcement consequences",
          amountOrRange: "CURRENT PENALTY NOT VERIFIED",
          amountCategory: "NOT VERIFIED",
          authority: "TBD after applicability confirmed",
          effectiveYearOrDate: "Unknown",
          officialSourceTitle: "Confirm after regulation applicability is known",
          officialSourceUrl: "https://www.hhs.gov/hipaa/for-professionals/index.html",
          notes:
            "No verified mandatory healthcare regulation applicability yet, so penalty exposure is not established.",
          confidence: "Low",
          claimType: "INFERENCE",
        },
      ];

  const latestChanges: RegulatoryChange[] = [
    {
      whatChanged:
        researchMentionsCompliance
          ? "Public research mentions compliance / cybersecurity language — treat as a lead for deeper authoritative review, not as a confirmed rule change."
          : "No specific new final/proposed rule uniquely tied to this account was extracted from live snippets in local analysis.",
      date: "Recent research window",
      status: researchMentionsCompliance ? "GUIDANCE ONLY" : "PENDING",
      issuingAuthority: researchMentionsCompliance ? "Multiple (verify primary source)" : "N/A",
      whoMayBeAffected: healthcare
        ? "Healthcare providers, business associates, and security / compliance leaders"
        : "TBD after industry confirmation",
      potentialAccountImpact:
        "Use as a discovery prompt to ask how the organization tracks regulatory change and AI / developer-tooling controls — not as proof of a new obligation.",
      officialSourceTitle: "Prioritize HHS / OCR / CMS / CISA / NIST / state regulators",
      officialSourceUrl: "https://www.hhs.gov/hipaa/for-professionals/index.html",
      confidence: "Low",
      claimType: "INFERENCE",
    },
    {
      whatChanged:
        "Ongoing industry focus on healthcare cybersecurity performance goals and secure software practices (voluntary guidance landscape).",
      date: "Ongoing",
      status: "GUIDANCE ONLY",
      issuingAuthority: "HHS / NIST / CISA",
      whoMayBeAffected: "Healthcare CISOs, security architecture, risk, and digital leadership",
      potentialAccountImpact:
        "May increase internal pressure to standardize approved tools and strengthen third-party / AI risk reviews.",
      officialSourceTitle: "HHS Healthcare Cybersecurity Performance Goals",
      officialSourceUrl:
        "https://www.hhs.gov/hipaa/for-professionals/security/guidance/cybersecurity-performance-goals/index.html",
      confidence: "Medium",
      claimType: "INFERENCE",
    },
  ];

  const accountImpact: AccountImpactItem[] = healthcare
    ? [
        {
          requirement: "HIPAA Security Rule (likely applicable)",
          controlArea: "Access control",
          accountImplication:
            "Enterprise AI coding tools may need clear access controls, least-privilege administration, and role-based availability rather than unmanaged individual subscriptions.",
          potentialCursorConversation:
            "Ask how security evaluates AI coding tools that can touch proprietary or sensitive codebases, and what access model would be required for an approved path.",
          targetPersona: "CISO / Security architecture",
          discoveryQuestion:
            "How does security evaluate new AI development tools before they are approved for engineering use?",
          confidence: "Medium",
          claimType: "SALES_HYPOTHESIS",
          requiresProductValidation: true,
        },
        {
          requirement: "HIPAA Privacy / data protection expectations (likely applicable)",
          controlArea: "Data privacy",
          accountImplication:
            "Teams may restrict sending patient-related or other sensitive content to external AI models. Developer tooling policy often becomes part of privacy / security risk analysis.",
          potentialCursorConversation:
            "Explore whether there are restrictions on sending code or sensitive information to external AI services, and how an enterprise-governed option would be assessed.",
          targetPersona: "Privacy / Compliance + VP Engineering",
          discoveryQuestion:
            "Are there restrictions around sending code or sensitive information to external AI models?",
          confidence: "Medium",
          claimType: "SALES_HYPOTHESIS",
          requiresProductValidation: true,
        },
        {
          requirement: "Third-party / vendor risk expectations",
          controlArea: "Third-party risk",
          accountImplication:
            "AI coding platforms are often reviewed like other SaaS vendors — security questionnaires, BAAs when PHI is in scope, and ongoing monitoring.",
          potentialCursorConversation:
            "Ask how developer tools are included in third-party risk management and what artifacts security needs for an enterprise evaluation.",
          targetPersona: "Third-party risk / CISO organization",
          discoveryQuestion:
            "How are developer tools included in third-party risk management today?",
          confidence: "Medium",
          claimType: "SALES_HYPOTHESIS",
          requiresProductValidation: true,
        },
        {
          requirement: "Secure software development guidance (NIST SSDF — voluntary)",
          controlArea: "Secure software development",
          accountImplication:
            "If the organization is strengthening secure SDLC practices, AI-assisted development may need guardrails, auditability, and standardized tooling rather than ad-hoc use.",
          potentialCursorConversation:
            "Discuss whether tool standardization and auditability are part of their AI / secure development governance strategy.",
          targetPersona: "VP Engineering / AppSec / CISO",
          discoveryQuestion:
            "How does AI-assisted development fit into your secure software development and risk analysis process?",
          confidence: "Low",
          claimType: "SALES_HYPOTHESIS",
          requiresProductValidation: true,
        },
        {
          requirement: "Shadow AI / unmanaged subscriptions risk",
          controlArea: "AI governance",
          accountImplication:
            "Individual AI coding subscriptions can create uncontrolled data paths and inconsistent security posture across teams.",
          potentialCursorConversation:
            "Ask whether developers currently use individual AI coding subscriptions and what an approved enterprise alternative would need to include.",
          targetPersona: "CIO / CISO / VP Engineering",
          discoveryQuestion:
            "Are developers allowed to use individual AI coding subscriptions today, and how is that governed?",
          confidence: "Low",
          claimType: "SALES_HYPOTHESIS",
          requiresProductValidation: true,
        },
      ]
    : [
        {
          requirement: "Enterprise AI / developer tooling governance (applicability TBD)",
          controlArea: "AI governance",
          accountImplication:
            "Even outside confirmed HIPAA scope, many enterprises still require security review, access control, and approved tooling paths for AI coding assistants.",
          potentialCursorConversation:
            "Start with discovery on current AI coding tool approval process and security evaluation criteria.",
          targetPersona: "CISO / VP Engineering",
          discoveryQuestion:
            "How are AI coding tools currently approved and governed in your organization?",
          confidence: "Low",
          claimType: "SALES_HYPOTHESIS",
          requiresProductValidation: true,
        },
      ];

  const cursorRelevance: CursorRelevanceItem[] = [
    {
      topic: "Enterprise AI governance for coding tools",
      whyItMayMatter:
        "Healthcare and regulated environments often need a governed path for AI coding rather than unmanaged consumer tools.",
      enterpriseAiAngle:
        "Conversation should focus on approval workflows, admin controls, and risk review — not a claim that any tool equals compliance.",
      requiresProductValidation: true,
      confidence: "Medium",
      claimType: "SALES_HYPOTHESIS",
    },
    {
      topic: "Access controls, identity, and auditability",
      whyItMayMatter:
        "Security stakeholders typically care whether AI developer tooling supports enterprise identity and oversight.",
      enterpriseAiAngle:
        "Ask what identity, access, and audit requirements would be mandatory before an enterprise rollout.",
      requiresProductValidation: true,
      confidence: "Medium",
      claimType: "SALES_HYPOTHESIS",
    },
    {
      topic: "Privacy controls and sensitive data handling",
      whyItMayMatter:
        "Teams may block tools that cannot meet data-handling expectations for code, secrets, or regulated data.",
      enterpriseAiAngle:
        "REQUIRES PRODUCT VALIDATION before claiming any specific Cursor privacy or residency capability.",
      requiresProductValidation: true,
      confidence: "Low",
      claimType: "SALES_HYPOTHESIS",
    },
    {
      topic: "Shadow AI reduction via tool standardization",
      whyItMayMatter:
        "Standardizing an approved AI coding platform can reduce unmanaged subscriptions if security and engineering align.",
      enterpriseAiAngle:
        "Position as a discovery topic about standardization — not a guarantee of regulatory compliance.",
      requiresProductValidation: true,
      confidence: "Low",
      claimType: "SALES_HYPOTHESIS",
    },
  ];

  const whyNowTriggers: RegulatoryWhyNowTrigger[] = [];

  if (healthcare) {
    whyNowTriggers.push({
      trigger:
        "Healthcare cybersecurity / HIPAA control expectations create timing for governed AI coding tool conversations",
      date: "Ongoing",
      status: "GUIDANCE ONLY",
      authority: "HHS / OCR + voluntary HHS cyber CPGs",
      accountRelevance: `${company} appears healthcare-related; security and privacy stakeholders may already be scrutinizing AI tooling paths.`,
      securityTechImplication:
        "Likely pressure for approved tools, third-party review, access control, and reduced shadow AI — validate with the customer.",
      potentialCursorRelevance:
        "Possible Why Now for discussing an enterprise-governed AI coding path. REQUIRES PRODUCT VALIDATION for any specific control claims. Cursor does not make a customer HIPAA compliant.",
      targetPersona: "CISO / Security architecture / CIO",
      discoveryQuestion:
        "What controls would be required before deploying an AI coding platform enterprise-wide?",
      officialSourceTitle: "HHS HIPAA Security Rule + Healthcare Cybersecurity Performance Goals",
      officialSourceUrl:
        "https://www.hhs.gov/hipaa/for-professionals/security/index.html",
      confidence: "Low",
      claimType: "SALES_HYPOTHESIS",
    });
  }

  if (researchMentionsCompliance) {
    whyNowTriggers.push({
      trigger:
        "Public research mentions compliance / cybersecurity topics for this account context",
      date: "Recent (from live research text)",
      status: "PENDING",
      authority: "Verify against primary regulator source",
      accountRelevance:
        "Secondary/public mentions appeared in research snippets. Confirm whether they reflect a new obligation, guidance adoption, or general industry content.",
      securityTechImplication:
        "May indicate heightened attention to security, privacy, or regulatory change — useful discovery signal only until primary sources are confirmed.",
      potentialCursorRelevance:
        "Only treat as outreach timing if discovery confirms active evaluation of AI tooling controls. Do not claim a regulatory deadline without an official source.",
      targetPersona: "CISO / Compliance / CIO",
      discoveryQuestion:
        "Are any recent regulatory or cybersecurity expectations changing how you approve AI development tools?",
      officialSourceTitle: "Trace claim to HHS / OCR / CMS / CISA / NIST / state primary source",
      officialSourceUrl: "https://www.hhs.gov/hipaa/for-professionals/index.html",
      confidence: "Low",
      claimType: "INFERENCE",
    });
  }

  if (florida && healthcare) {
    whyNowTriggers.push({
      trigger:
        "Florida healthcare / privacy jurisdiction may add state-level expectations alongside HIPAA",
      date: "Jurisdiction inferred",
      status: "PENDING",
      authority: "Florida regulators (confirm specific statute)",
      accountRelevance:
        "Florida signals appear in public materials. State requirements may matter for privacy/breach workflows — confirm with counsel.",
      securityTechImplication:
        "May influence vendor assessments and data-handling questionnaires for developer / AI tools.",
      potentialCursorRelevance:
        "Use as a discovery opener about multi-jurisdiction privacy reviews, not as a confirmed legal trigger.",
      targetPersona: "Privacy officer / Compliance / CISO",
      discoveryQuestion:
        "Do state-specific Florida privacy or breach requirements change how you evaluate AI developer tools?",
      officialSourceTitle: "Florida Legislature — Online Sunshine",
      officialSourceUrl: "https://www.leg.state.fl.us/",
      confidence: "Low",
      claimType: "SALES_HYPOTHESIS",
    });
  }

  const discoveryQuestions = [
    "How are AI coding tools currently approved and governed?",
    "Are developers allowed to use individual AI coding subscriptions?",
    "How does security evaluate new AI development tools?",
    "Are there restrictions around sending code or sensitive information to external AI models?",
    "How are developer tools included in third-party risk management?",
    "How does AI-assisted development fit into the organization's security risk analysis?",
    "How do you manage identity, access, and auditability across developer tooling?",
    "Is tool standardization part of your AI governance strategy?",
    "What controls would be required before deploying an AI coding platform enterprise-wide?",
    healthcare
      ? `For ${company}, which security or privacy reviews typically gate new SaaS developer tools?`
      : `For ${company}, who owns security review for new AI developer tools?`,
  ];

  return {
    isSample,
    disclaimer:
      "Not legal advice. This page translates public regulatory/security context into enterprise sales intelligence. Do not claim a regulation applies, a penalty amount, or that Cursor creates compliance without verified evidence and product validation.",
    accountContextSummary,
    applicableRegulations,
    securityGuidance,
    penalties,
    latestChanges,
    accountImpact,
    cursorRelevance,
    whyNowTriggers,
    discoveryQuestions,
  };
}

export function buildSampleComplianceSecurity(
  companyName: string,
  companyWebsite: string,
): ComplianceSecurityIntelligence {
  const base = buildComplianceSecurityIntelligence({
    companyName,
    companyWebsite,
    industry: companyName.toLowerCase().includes("advent")
      ? "Nonprofit health system"
      : undefined,
    headquarters: companyName.toLowerCase().includes("advent")
      ? "Altamonte Springs, Florida"
      : undefined,
    isSample: true,
  });
  return {
    ...base,
    isSample: true,
    disclaimer: `SAMPLE / MOCK compliance intelligence for ${companyName}. ${base.disclaimer}`,
    accountContextSummary: `SAMPLE context: ${base.accountContextSummary}`,
  };
}
