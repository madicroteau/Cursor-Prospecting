import type { AccountDossier } from "@/lib/mock-data";
import type { LiveResearchResult } from "@/lib/live-research";
import type { ExperimentalIntelligence } from "@/lib/experimental-intelligence";
import {
  RESEARCH_CATEGORIES,
  RESEARCH_CATEGORY_LABELS,
} from "@/lib/organize-research";

export type AiAnalysisStatus =
  | "live"
  | "local"
  | "missing_key"
  | "no_research"
  | "error";

export type AiAnalysisResult = {
  status: AiAnalysisStatus;
  message: string;
  model?: string;
  dossierPatch?: Partial<
    Pick<
      AccountDossier,
      | "snapshot"
      | "whatsHappening"
      | "techAndAI"
      | "prospectTargets"
      | "opportunitySignals"
      | "whyCursor"
      | "whyNow"
      | "talkTrack"
      | "sources"
      | "prospectingBrief"
    >
  >;
  experimentalPatch?: Partial<ExperimentalIntelligence>;
  error?: string;
};

type AiJsonPayload = {
  snapshot?: AccountDossier["snapshot"];
  whatsHappening?: string[];
  techAndAI?: string[];
  prospectTargets?: AccountDossier["prospectTargets"];
  opportunitySignals?: string[];
  whyCursor?: string[];
  whyNow?: string[];
  talkTrack?: string[];
  sources?: AccountDossier["sources"];
  jobIntelligence?: ExperimentalIntelligence["jobIntelligence"];
  buyingCommittee?: ExperimentalIntelligence["buyingCommittee"];
  whyNowSynthesis?: ExperimentalIntelligence["whyNowSynthesis"];
  researchGaps?: ExperimentalIntelligence["researchGaps"];
  prospectingPlan?: ExperimentalIntelligence["prospectingPlan"];
};

export function hasOpenAiApiKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function buildPrompt(liveResearch: LiveResearchResult) {
  const organizedBlock = RESEARCH_CATEGORIES.map((category) => {
    const items = liveResearch.organized[category];
    if (items.length === 0) {
      return `${RESEARCH_CATEGORY_LABELS[category]}: none`;
    }
    return `${RESEARCH_CATEGORY_LABELS[category]}:\n${items
      .map(
        (item, index) =>
          `  ${index + 1}. ${item.title}\n     url: ${item.url}\n     snippet: ${item.snippet}`,
      )
      .join("\n")}`;
  }).join("\n\n");

  return `You are helping an enterprise salesperson build an Account Intel dossier for Cursor (an AI coding tool for software teams).

Company: ${liveResearch.companyName}
Website: ${liveResearch.companyWebsite}

ORGANIZED PUBLIC RESEARCH:
${organizedBlock}

Return ONLY valid JSON (no markdown) with this shape:
{
  "snapshot": { "industry": string, "headquarters": string, "sizeSignal": string, "recentHeadline": string },
  "whatsHappening": string[],
  "techAndAI": string[],
  "prospectTargets": [{ "name": string, "title": string, "relevance": string }],
  "opportunitySignals": string[],
  "whyCursor": string[],
  "whyNow": string[],
  "talkTrack": string[],
  "sources": [{ "title": string, "url": string }],
  "jobIntelligence": {
    "isSample": false,
    "totalRelevantOpenings": number,
    "categories": [{ "category": string, "count": number }],
    "technologiesDetected": string[],
    "signals": [{
      "signal": string,
      "supportingJobPostings": string[],
      "supportingJobCount": number,
      "technologiesDetected": string[],
      "evidence": string,
      "sourceUrls": string[],
      "businessImplication": string,
      "cursorRelevance": string,
      "confidence": "High" | "Medium" | "Low",
      "claimType": "FACT" | "INFERENCE" | "SALES_HYPOTHESIS"
    }],
    "summary": string
  },
  "buyingCommittee": {
    "isSample": false,
    "relationshipNote": string,
    "people": [{
      "name": string,
      "title": string,
      "role": "EXECUTIVE SPONSOR" | "TECHNICAL CHAMPION" | "TECHNICAL EVALUATOR" | "SECURITY / GOVERNANCE" | "ECONOMIC / PROCUREMENT",
      "relevantInitiative": string,
      "potentialPriority": string,
      "whyTheyMayCare": string,
      "reasonToContact": string,
      "outreachAngle": string,
      "evidence": string,
      "sourceUrl": string,
      "confidence": "High" | "Medium" | "Low",
      "relationshipStatus": "CONFIRMED" | "INFERRED" | "UNKNOWN",
      "claimType": "FACT" | "INFERENCE" | "SALES_HYPOTHESIS",
      "isPlaceholderName": boolean
    }],
    "topPeopleToProspect": [{
      "name": string,
      "title": string,
      "role": "EXECUTIVE SPONSOR" | "TECHNICAL CHAMPION" | "TECHNICAL EVALUATOR" | "SECURITY / GOVERNANCE" | "ECONOMIC / PROCUREMENT",
      "rankReason": string,
      "relatedSignal": string,
      "cursorAngle": string,
      "firstConversationTopic": string
    }]
  },
  "whyNowSynthesis": [{
    "trigger": string,
    "date": string,
    "evidence": string,
    "source": string,
    "sourceUrl": string,
    "relevantPersona": string,
    "whyItMatters": string,
    "cursorRelevance": string,
    "discoveryQuestion": string,
    "confidence": "High" | "Medium" | "Low",
    "claimType": "FACT" | "INFERENCE" | "SALES_HYPOTHESIS",
    "combinedSignals": string[]
  }],
  "researchGaps": [{
    "whatWeDontKnow": string,
    "currentEvidence": string,
    "whyItMatters": string,
    "whoToAsk": string,
    "discoveryQuestion": string
  }],
  "prospectingPlan": {
    "isSample": false,
    "whoToTarget": [{ "persona": string, "whyThem": string, "talkAbout": string, "relatedSignal": string }],
    "conversationAngles": string[],
    "strongestWhyNow": string,
    "discoveryQuestions": string[],
    "stillNeedToDiscover": string[],
    "outreach": { "email": string, "coldCallOpener": string, "linkedInMessage": string }
  }
}

RULES:
1. Distinguish FACT vs INFERENCE vs SALES_HYPOTHESIS. Never present inference/hypothesis as fact.
2. Every important fact should reference a real source URL from the research list.
3. Do NOT invent people or titles. If a person is not clearly named in the sources, set name to "[Confirm from public sources]" and isPlaceholderName=true.
4. Do NOT invent reporting relationships. Prefer relationshipStatus="UNKNOWN".
5. Do NOT invent exact job counts. If uncertain, use cautious language and Medium/Low confidence.
6. Presence of a technology is not automatically a problem.
7. Use the organized categories. Combine evidence when strong (for example AI + hiring + modernization).
8. Outreach and conversation angles must use account-specific evidence when available.
9. Keep arrays concise and useful for a sales demo.
10. sources should only include URLs from the research list.`;
}

function extractJson(text: string): AiJsonPayload {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as AiJsonPayload;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as AiJsonPayload;
    }
    throw new Error("AI response was not valid JSON");
  }
}

export async function analyzeAccountResearch(
  liveResearch: LiveResearchResult,
): Promise<AiAnalysisResult> {
  if (!hasOpenAiApiKey()) {
    return {
      status: "missing_key",
      message:
        "AI analysis is ready, but no OpenAI API key is set yet. Add OPENAI_API_KEY to .env.local.",
    };
  }

  if (liveResearch.status !== "live" || liveResearch.items.length === 0) {
    return {
      status: "no_research",
      message:
        "AI analysis needs live research sources first. Complete Tavily research, then retry.",
    };
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY?.trim()}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a careful enterprise sales research analyst. Return only JSON. Never invent unsupported facts or people.",
          },
          {
            role: "user",
            content: buildPrompt(liveResearch),
          },
        ],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI request failed (${response.status}): ${text}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response");
    }

    const parsed = extractJson(content);

    return {
      status: "live",
      message: `AI analysis completed with ${model} using ${liveResearch.items.length} organized public sources.`,
      model,
      dossierPatch: {
        snapshot: parsed.snapshot,
        whatsHappening: parsed.whatsHappening,
        techAndAI: parsed.techAndAI,
        prospectTargets: parsed.prospectTargets,
        opportunitySignals: parsed.opportunitySignals,
        whyCursor: parsed.whyCursor,
        whyNow: parsed.whyNow,
        talkTrack: parsed.talkTrack,
        sources: parsed.sources,
      },
      experimentalPatch: {
        jobIntelligence: parsed.jobIntelligence
          ? { ...parsed.jobIntelligence, isSample: false }
          : undefined,
        buyingCommittee: parsed.buyingCommittee
          ? { ...parsed.buyingCommittee, isSample: false }
          : undefined,
        whyNowSynthesis: parsed.whyNowSynthesis,
        researchGaps: parsed.researchGaps,
        prospectingPlan: parsed.prospectingPlan
          ? { ...parsed.prospectingPlan, isSample: false }
          : undefined,
      },
    };
  } catch (error) {
    return {
      status: "error",
      message:
        "AI analysis failed. Showing fallback sample/mock dossier content instead.",
      error: error instanceof Error ? error.message : "Unknown AI error",
    };
  }
}
