/**
 * Display text cleanup for dossier copy: capitalization, names/titles,
 * company names, common acronyms, and light punctuation.
 */

const ACRONYMS = [
  "AI",
  "ML",
  "LLM",
  "CIO",
  "CTO",
  "CDO",
  "CISO",
  "CEO",
  "CFO",
  "COO",
  "VP",
  "SVP",
  "EVP",
  "AWS",
  "GCP",
  "EHR",
  "EMR",
  "HIPAA",
  "ROI",
  "TCO",
  "IT",
  "HR",
  "API",
  "SaaS",
  "DevOps",
  "DevEx",
  "SRE",
  "ASC",
  "MEDDPICC",
  "KPI",
  "OKR",
];

const SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "from",
  "in",
  "into",
  "nor",
  "of",
  "on",
  "or",
  "the",
  "to",
  "via",
  "with",
  "vs",
]);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function decodeBasicEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

function fixCompanyName(text: string, companyName?: string) {
  const name = companyName?.trim();
  if (!name) return text;

  const pattern = new RegExp(`\\b${escapeRegExp(name)}\\b`, "gi");
  return text.replace(pattern, name);
}

function fixAcronyms(text: string) {
  let result = text;
  for (const acronym of ACRONYMS) {
    const pattern = new RegExp(`\\b${escapeRegExp(acronym)}\\b`, "gi");
    result = result.replace(pattern, acronym);
  }
  // Standalone lowercase i
  result = result.replace(/\bi\b/g, "I");
  return result;
}

function capitalizeLetter(char: string) {
  return char.toUpperCase();
}

function titleCaseWord(word: string, index: number, forceCapitalize = false) {
  if (!word) return word;

  // Keep all-caps short tokens (CIO, VP, AI) and mixed product names with digits
  if (/^[A-Z0-9]{2,}$/.test(word) && word.length <= 6) return word;
  if (ACRONYMS.some((a) => a.toLowerCase() === word.toLowerCase())) {
    return (
      ACRONYMS.find((a) => a.toLowerCase() === word.toLowerCase()) || word
    );
  }

  const lower = word.toLowerCase();
  if (!forceCapitalize && index > 0 && SMALL_WORDS.has(lower)) {
    return lower;
  }

  // McDonald / O'Brien style
  if (/^mc[a-z]/i.test(word)) {
    return `Mc${word.slice(2, 3).toUpperCase()}${word.slice(3).toLowerCase()}`;
  }
  if (/^[a-z]+'[a-z]+$/i.test(word)) {
    const [left, right] = word.split("'");
    return `${left.charAt(0).toUpperCase()}${left.slice(1).toLowerCase()}'${right.charAt(0).toUpperCase()}${right.slice(1).toLowerCase()}`;
  }

  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * Title-case a person name: "steven shi" -> "Steven Shi"
 * Rejects obvious sentence fragments so they are not displayed as people.
 */
export function formatPersonName(
  input: string,
  options?: { companyName?: string },
): string {
  if (!input) return input;
  let text = cleanWhitespace(decodeBasicEntities(input));
  text = fixCompanyName(text, options?.companyName);

  // Keep explicit placeholders readable
  if (text.startsWith("[")) {
    return text.replace(/^\[confirm/i, "[Confirm");
  }

  const parts = text.split(/\s+/).filter(Boolean);
  const titleWords =
    /\b(is|are|was|were|and|the|of|system|names|vice|president|chief|officer|director|manager|architect)\b/i;
  // Allow single first names from Apollo when last name is still masked.
  const singleFirstName =
    parts.length === 1 && /^[A-Za-z][A-Za-z'.-]{1,30}$/.test(parts[0]);

  const junkName =
    (!singleFirstName && titleWords.test(text)) ||
    parts.length > 5 ||
    parts.length < 1 ||
    (parts.length === 1 && !singleFirstName);

  if (junkName) {
    return "[Confirm from public sources]";
  }

  text = text
    .split(/(\s+|[-/])/)
    .map((part) => {
      if (/^\s+$/.test(part) || part === "-" || part === "/") return part;
      return titleCaseWord(part, 0, true);
    })
    .join("");

  return fixAcronyms(fixCompanyName(text, options?.companyName));
}

function titleCasePhrase(
  input: string,
  options?: { companyName?: string },
): string {
  let text = cleanWhitespace(decodeBasicEntities(input));
  text = fixCompanyName(text, options?.companyName);

  const segments = text.split(/(\s*\/\s*|\s+·\s+|\s+-\s+)/);
  text = segments
    .map((segment) => {
      if (/^\s*\/\s*$/.test(segment)) return " / ";
      if (/^\s+·\s+$/.test(segment)) return " · ";
      if (/^\s+-\s+$/.test(segment)) return " - ";
      const words = segment.split(/(\s+)/);
      let wordIndex = 0;
      return words
        .map((part) => {
          if (/^\s+$/.test(part)) return part;
          const formatted = titleCaseWord(part, wordIndex, wordIndex === 0);
          wordIndex += 1;
          return formatted;
        })
        .join("");
    })
    .join("");

  return fixAcronyms(fixCompanyName(text, options?.companyName));
}

function looksLikeProseNotJobTitle(text: string) {
  return (
    text.length > 80 ||
    /\b(is|are|was|were|names|system|says|said|announces)\b/i.test(text) ||
    (/[.!?]/.test(text) && text.split(/\s+/).length > 8)
  );
}

/**
 * Title-case a job title / persona label.
 * "vp engineering / platform leader" -> "VP Engineering / Platform Leader"
 */
export function formatJobTitle(
  input: string,
  options?: { companyName?: string },
): string {
  if (!input) return input;
  let text = cleanWhitespace(decodeBasicEntities(input));
  text = fixCompanyName(text, options?.companyName);

  // Prose/headlines are not job titles — shorten + title-case the original
  // instead of collapsing every bad value to the same sentinel (breaks React keys).
  if (looksLikeProseNotJobTitle(text)) {
    const shortened =
      text.length > 72
        ? `${text.slice(0, 72).replace(/\s+\S*$/, "").trim()}…`
        : text;
    return titleCasePhrase(shortened, options);
  }

  return titleCasePhrase(text, options);
}

/**
 * Capitalize the start of the string, and the first letter after
 * sentence endings or a colon (e.g. "Hiring signal: adventhealth..." ).
 */
function capitalizeSentenceStarts(text: string) {
  let result = text.replace(/^([a-z])/, (_, char: string) =>
    capitalizeLetter(char),
  );
  result = result.replace(
    /([.!?]\s+)([a-z])/g,
    (_, lead: string, char: string) => `${lead}${capitalizeLetter(char)}`,
  );
  result = result.replace(
    /(:\s+)([a-z])/g,
    (_, lead: string, char: string) => `${lead}${capitalizeLetter(char)}`,
  );
  result = result.replace(
    /(—\s+)([a-z])/g,
    (_, lead: string, char: string) => `${lead}${capitalizeLetter(char)}`,
  );
  // Contractions at sentence starts / after punctuation
  result = result.replace(/\bi'm\b/gi, "I'm");
  result = result.replace(/\bi've\b/gi, "I've");
  result = result.replace(/\bi'll\b/gi, "I'll");
  result = result.replace(/\bi'd\b/gi, "I'd");
  return result;
}

function ensureEndingPunctuation(text: string) {
  if (!text) return text;
  if (/[.!?…]$/.test(text)) return text;
  if (text.includes("://")) return text;
  if (text.length < 28 || !text.includes(" ")) return text;
  return `${text}.`;
}

function looksLikeMostlyLowercaseHeadline(text: string) {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 8) return false;
  const lower = letters.replace(/[^a-z]/g, "").length;
  return lower / letters.length > 0.7;
}

/**
 * Format a single user-facing string for the dossier UI.
 */
export function formatDisplayText(
  input: string,
  options?: { companyName?: string; ensurePunctuation?: boolean },
): string {
  if (!input) return input;

  let text = cleanWhitespace(decodeBasicEntities(input));
  text = fixCompanyName(text, options?.companyName);
  text = capitalizeSentenceStarts(text);
  text = fixAcronyms(text);
  text = fixCompanyName(text, options?.companyName);

  if (options?.ensurePunctuation !== false) {
    text = ensureEndingPunctuation(text);
  }

  return text;
}

export function formatDisplayList(
  items: string[],
  options?: { companyName?: string; ensurePunctuation?: boolean },
): string[] {
  return items.map((item) => formatDisplayText(item, options));
}

/**
 * Format a headline/title without forcing a trailing period.
 * Improves casing when the source headline is mostly lowercase.
 */
export function formatHeadline(
  input: string,
  options?: { companyName?: string },
): string {
  if (!input) return input;

  let text = cleanWhitespace(decodeBasicEntities(input));
  text = fixCompanyName(text, options?.companyName);

  // Headlines must never go through job-title prose replacement — that used to
  // turn distinct news titles into the same "Technology / digital leader…" string.
  if (looksLikeMostlyLowercaseHeadline(text)) {
    text = titleCasePhrase(text, options);
  } else {
    text = capitalizeSentenceStarts(text);
    text = fixAcronyms(text);
  }

  return fixCompanyName(text, options?.companyName);
}
