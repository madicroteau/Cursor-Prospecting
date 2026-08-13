/**
 * Apollo.io People API for leadership / buying-committee enrichment.
 * Uses REST API key auth (separate from Cursor MCP OAuth).
 */

export type ApolloLeader = {
  id: string;
  name: string;
  title: string;
  linkedinUrl?: string;
  organizationName?: string;
  organizationDomain?: string;
};

export type ApolloLeadershipResult = {
  status: "live" | "missing_key" | "error" | "empty";
  message: string;
  companyDomain: string;
  people: ApolloLeader[];
  errors: string[];
};

const TECH_LEADERSHIP_TITLES = [
  "CIO",
  "Chief Information Officer",
  "CTO",
  "Chief Technology Officer",
  "CISO",
  "Chief Information Security Officer",
  "Chief Digital Officer",
  "Chief AI Officer",
  "Chief Data Officer",
  "VP Engineering",
  "Vice President Engineering",
  "VP Application Development",
  "VP Software Engineering",
  "VP Platform Engineering",
  "VP DevOps",
  "VP Enterprise Architecture",
  "Enterprise Architect",
  "Head of Engineering",
  "Director of Engineering",
  "VP Information Technology",
];

type ApolloPersonApi = {
  id?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  title?: string;
  linkedin_url?: string;
  organization?: {
    id?: string;
    name?: string;
    domain?: string;
    primary_domain?: string;
  };
};

type ApolloSearchResponse = {
  people?: ApolloPersonApi[];
  total_entries?: number;
  error?: string;
  message?: string;
};

export function hasApolloApiKey() {
  return Boolean(process.env.APOLLO_API_KEY?.trim());
}

function hostFromWebsite(website: string, companyName: string) {
  const trimmed = website.trim();
  let candidate = trimmed
    ? trimmed.startsWith("http")
      ? trimmed
      : `https://${trimmed}`
    : `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`;

  try {
    return new URL(candidate).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return companyName.toLowerCase().replace(/\s+/g, "") + ".com";
  }
}

function cleanPersonName(person: ApolloPersonApi) {
  const fromParts = [person.first_name, person.last_name]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const raw = (fromParts || person.name || "").replace(/\s+/g, " ").trim();
  if (!raw || raw.length < 3) return null;
  // Skip heavily obfuscated / placeholder names
  if (/^\*+$/.test(raw) || /\bn\/a\b/i.test(raw)) return null;
  return raw;
}

function toLeader(person: ApolloPersonApi): ApolloLeader | null {
  const name = cleanPersonName(person);
  const title = (person.title || "").replace(/\s+/g, " ").trim();
  if (!name || !title || !person.id) return null;

  return {
    id: person.id,
    name,
    title,
    linkedinUrl: person.linkedin_url || undefined,
    organizationName: person.organization?.name,
    organizationDomain:
      person.organization?.primary_domain || person.organization?.domain,
  };
}

function dedupeLeaders(people: ApolloLeader[]) {
  const seen = new Set<string>();
  return people.filter((person) => {
    const key = `${person.name.toLowerCase()}|${person.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Search Apollo for technology / digital / security leadership at the account.
 * People API Search does not return emails/phones and typically does not consume credits.
 */
export async function searchApolloTechnologyLeaders(
  companyName: string,
  companyWebsite: string,
): Promise<ApolloLeadershipResult> {
  const domain = hostFromWebsite(companyWebsite, companyName);
  const apiKey = process.env.APOLLO_API_KEY?.trim();

    if (!apiKey) {
    return {
      status: "missing_key",
      message:
        "Apollo leadership enrichment is ready, but no APOLLO_API_KEY is set. Add it to .env.local (Apollo Settings → API).",
      companyDomain: domain,
      people: [],
      errors: [],
    };
  }

  try {
    const response = await fetch(
      "https://api.apollo.io/api/v1/mixed_people/api_search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          q_organization_domains_list: [domain],
          person_titles: TECH_LEADERSHIP_TITLES,
          include_similar_titles: true,
          per_page: 25,
          page: 1,
        }),
        cache: "no-store",
        // Fail fast when DNS/network is blocked (was hanging dossier loads).
        signal: AbortSignal.timeout(8_000),
      },
    );

    const text = await response.text();
    let data: ApolloSearchResponse = {};
    try {
      data = text ? (JSON.parse(text) as ApolloSearchResponse) : {};
    } catch {
      data = { error: text.slice(0, 200) };
    }

    if (!response.ok) {
      const detail =
        data.error || data.message || text.slice(0, 240) || response.statusText;
      return {
        status: "error",
        message: `Apollo people search failed (${response.status}): ${detail}`,
        companyDomain: domain,
        people: [],
        errors: [detail],
      };
    }

    const people = dedupeLeaders(
      (data.people || [])
        .map(toLeader)
        .filter((person): person is ApolloLeader => Boolean(person)),
    );

        if (people.length === 0) {
      return {
        status: "empty",
        message: `Apollo returned no technology leaders for ${domain}.`,
        companyDomain: domain,
        people: [],
        errors: [],
      };
    }

    return {
      status: "live",
      message: `Apollo found ${people.length} technology/digital leadership profiles for ${domain}.`,
      companyDomain: domain,
      people,
      errors: [],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Apollo request error";
    const causeObj =
      error instanceof Error && "cause" in error
        ? (error as Error & { cause?: { code?: string; message?: string; hostname?: string } })
            .cause
        : undefined;
    const causeCode = causeObj?.code || "";
    const causeHost = causeObj?.hostname || "api.apollo.io";
    const cause =
      causeObj
        ? `${causeCode} ${causeObj.message || ""} ${causeHost}`.trim()
        : "";
        const dnsHint =
      causeCode === "ENOTFOUND" || causeCode === "EAI_AGAIN"
        ? ` DNS lookup failed for ${causeHost}. Restart npm run dev from your local Mac Terminal (not an agent-started server) so Node can reach the internet.`
        : causeCode === "ECONNREFUSED" || causeCode === "ETIMEDOUT"
          ? ` Network blocked/timeout reaching ${causeHost}. Check VPN/firewall and restart the app from your local Terminal.`
          : "";
    return {
      status: "error",
      message: `Apollo request failed: ${message}${causeCode ? ` (${causeCode})` : ""}.${dnsHint}`,
      companyDomain: domain,
      people: [],
      errors: [message, causeCode].filter(Boolean),
    };
  }
}
