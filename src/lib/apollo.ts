/**
 * Apollo.io People + Organization APIs for leadership and technology enrichment.
 * Uses REST API key auth (separate from Cursor MCP OAuth).
 */

export type ApolloLeader = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  title: string;
  linkedinUrl?: string;
  organizationName?: string;
  organizationDomain?: string;
  /** True when enrichment returned a usable last name. */
  nameEnriched: boolean;
};

export type ApolloTechnology = {
  name: string;
  uid?: string;
  category?: string;
};

export type ApolloLeadershipResult = {
  status: "live" | "missing_key" | "error" | "empty";
  message: string;
  companyDomain: string;
  people: ApolloLeader[];
  technologies: ApolloTechnology[];
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

/** Cap enrichment credits while still filling Buying Committee. */
const MAX_ENRICH_PEOPLE = 8;

type ApolloPersonApi = {
  id?: string;
  first_name?: string;
  last_name?: string;
  last_name_obfuscated?: string;
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

type ApolloBulkMatchResponse = {
  matches?: Array<ApolloPersonApi | null>;
  people?: Array<ApolloPersonApi | null>;
  error?: string;
  message?: string;
};

type ApolloOrgEnrichResponse = {
  organization?: {
    name?: string;
    primary_domain?: string;
    current_technologies?: Array<{
      name?: string;
      uid?: string;
      category?: string;
      technology?: string;
    }>;
    technologies?: Array<{
      name?: string;
      uid?: string;
      category?: string;
    }>;
  };
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

function looksObfuscated(value: string) {
  return (
    !value ||
    /^\*+$/.test(value) ||
    /\bn\/a\b/i.test(value) ||
    value.includes("*") ||
    value.length < 2
  );
}

function cleanPersonName(person: ApolloPersonApi) {
  const first = (person.first_name || "").replace(/\s+/g, " ").trim();
  const last = (person.last_name || "").replace(/\s+/g, " ").trim();
  const usableLast = looksObfuscated(last) ? "" : last;
  const fromParts = [first, usableLast].filter(Boolean).join(" ").trim();
  const raw = (fromParts || person.name || "").replace(/\s+/g, " ").trim();
  if (!raw || raw.length < 2) return null;
  if (/^\*+$/.test(raw) || /\bn\/a\b/i.test(raw)) return null;
  return {
    name: raw,
    firstName: first || undefined,
    lastName: usableLast || undefined,
    nameEnriched: Boolean(usableLast),
  };
}

function toLeader(person: ApolloPersonApi): ApolloLeader | null {
  const cleaned = cleanPersonName(person);
  const title = (person.title || "").replace(/\s+/g, " ").trim();
  if (!cleaned || !title || !person.id) return null;

  return {
    id: person.id,
    name: cleaned.name,
    firstName: cleaned.firstName,
    lastName: cleaned.lastName,
    title,
    linkedinUrl: person.linkedin_url || undefined,
    organizationName: person.organization?.name,
    organizationDomain:
      person.organization?.primary_domain || person.organization?.domain,
    nameEnriched: cleaned.nameEnriched,
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

function apolloHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    accept: "application/json",
    "x-api-key": apiKey,
  };
}

async function enrichPeopleById(
  apiKey: string,
  people: ApolloLeader[],
): Promise<{ people: ApolloLeader[]; errors: string[] }> {
  const errors: string[] = [];
  const targets = people.slice(0, MAX_ENRICH_PEOPLE);
  if (targets.length === 0) return { people, errors };

  try {
    const response = await fetch(
      "https://api.apollo.io/api/v1/people/bulk_match?reveal_personal_emails=false&reveal_phone_number=false",
      {
        method: "POST",
        headers: apolloHeaders(apiKey),
        body: JSON.stringify({
          details: targets.map((person) => ({ id: person.id })),
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      },
    );

    const text = await response.text();
    let data: ApolloBulkMatchResponse = {};
    try {
      data = text ? (JSON.parse(text) as ApolloBulkMatchResponse) : {};
    } catch {
      data = { error: text.slice(0, 200) };
    }

    if (!response.ok) {
      errors.push(
        `Apollo people enrichment failed (${response.status}): ${
          data.error || data.message || response.statusText
        }`,
      );
      return { people, errors };
    }

    const matches = (data.matches || data.people || []).filter(Boolean) as ApolloPersonApi[];
    const byId = new Map(
      matches
        .map(toLeader)
        .filter((person): person is ApolloLeader => Boolean(person))
        .map((person) => [person.id, person]),
    );

    const enriched = people.map((person) => byId.get(person.id) || person);
    return { people: dedupeLeaders(enriched), errors };
  } catch (error) {
    errors.push(
      error instanceof Error
        ? `Apollo people enrichment error: ${error.message}`
        : "Apollo people enrichment error",
    );
    return { people, errors };
  }
}

async function enrichOrganizationTechnologies(
  apiKey: string,
  domain: string,
): Promise<{ technologies: ApolloTechnology[]; errors: string[] }> {
  const errors: string[] = [];
  try {
    const response = await fetch(
      `https://api.apollo.io/api/v1/organizations/enrich?domain=${encodeURIComponent(domain)}`,
      {
        method: "GET",
        headers: apolloHeaders(apiKey),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );

    const text = await response.text();
    let data: ApolloOrgEnrichResponse = {};
    try {
      data = text ? (JSON.parse(text) as ApolloOrgEnrichResponse) : {};
    } catch {
      data = { error: text.slice(0, 200) };
    }

    if (!response.ok) {
      errors.push(
        `Apollo organization enrich failed (${response.status}): ${
          data.error || data.message || response.statusText
        }`,
      );
      return { technologies: [], errors };
    }

    const raw =
      data.organization?.current_technologies ||
      data.organization?.technologies ||
      [];

    const technologies = raw
      .map((item) => {
        const name = (item.name || item.technology || "")
          .replace(/\s+/g, " ")
          .trim();
        if (!name) return null;
        return {
          name,
          uid: item.uid,
          category: item.category,
        } satisfies ApolloTechnology;
      })
      .filter((item): item is ApolloTechnology => Boolean(item))
      .slice(0, 40);

    return { technologies, errors };
  } catch (error) {
    errors.push(
      error instanceof Error
        ? `Apollo organization enrich error: ${error.message}`
        : "Apollo organization enrich error",
    );
    return { technologies: [], errors };
  }
}

/**
 * Search Apollo for technology / digital / security leadership, enrich full
 * names via bulk_match, and pull organization technology stack.
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
      technologies: [],
      errors: [],
    };
  }

  try {
    const response = await fetch(
      "https://api.apollo.io/api/v1/mixed_people/api_search",
      {
        method: "POST",
        headers: apolloHeaders(apiKey),
        body: JSON.stringify({
          q_organization_domains_list: [domain],
          person_titles: TECH_LEADERSHIP_TITLES,
          include_similar_titles: true,
          per_page: 25,
          page: 1,
        }),
        cache: "no-store",
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
        technologies: [],
        errors: [detail],
      };
    }

    let people = dedupeLeaders(
      (data.people || [])
        .map(toLeader)
        .filter((person): person is ApolloLeader => Boolean(person)),
    );

    const [enrichedPeople, orgTech] = await Promise.all([
      enrichPeopleById(apiKey, people),
      enrichOrganizationTechnologies(apiKey, domain),
    ]);
    people = enrichedPeople.people;
    const errors = [...enrichedPeople.errors, ...orgTech.errors];
    const technologies = orgTech.technologies;
    const fullNameCount = people.filter((person) => person.nameEnriched).length;

    if (people.length === 0 && technologies.length === 0) {
      return {
        status: "empty",
        message: `Apollo returned no technology leaders or technologies for ${domain}.`,
        companyDomain: domain,
        people: [],
        technologies: [],
        errors,
      };
    }

    const peopleNote =
      people.length > 0
        ? `${people.length} technology/digital leadership profiles (${fullNameCount} with full names after enrichment)`
        : "no leadership profiles";
    const techNote =
      technologies.length > 0
        ? `${technologies.length} organization technologies`
        : "no organization technologies";

    return {
      status: "live",
      message: `Apollo found ${peopleNote} and ${techNote} for ${domain}.`,
      companyDomain: domain,
      people,
      technologies,
      errors,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Apollo request error";
    const causeObj =
      error instanceof Error && "cause" in error
        ? (
            error as Error & {
              cause?: { code?: string; message?: string; hostname?: string };
            }
          ).cause
        : undefined;
    const causeCode = causeObj?.code || "";
    const causeHost = causeObj?.hostname || "api.apollo.io";
    const dnsHint =
      causeCode === "ENOTFOUND" || causeCode === "EAI_AGAIN"
        ? ` DNS lookup failed for ${causeHost}. Restart npm run dev from your local Mac Terminal so Node can reach the internet.`
        : causeCode === "ECONNREFUSED" || causeCode === "ETIMEDOUT"
          ? ` Network blocked/timeout reaching ${causeHost}. Check VPN/firewall and restart the app from your local Terminal.`
          : "";
    return {
      status: "error",
      message: `Apollo request failed: ${message}${causeCode ? ` (${causeCode})` : ""}.${dnsHint}`,
      companyDomain: domain,
      people: [],
      technologies: [],
      errors: [message, causeCode].filter(Boolean),
    };
  }
}
