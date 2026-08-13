export const DOSSIER_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "buying-committee", label: "Buying Committee" },
  { id: "technology", label: "Technology" },
  { id: "job-intelligence", label: "Job Intelligence" },
  { id: "initiatives", label: "Initiatives" },
  { id: "why-now", label: "Why Now" },
  { id: "prospecting", label: "Prospecting Plan" },
  { id: "sources", label: "Sources" },
] as const;

export type DossierSectionId = (typeof DOSSIER_SECTIONS)[number]["id"];

export const DEFAULT_DOSSIER_SECTION: DossierSectionId = "overview";

const LEGACY_SECTION_REDIRECTS: Record<string, DossierSectionId> = {
  "executive-brief": "overview",
  "compliance-security": "why-now",
  financials: "sources",
  roi: "prospecting",
  "research-gaps": "prospecting",
};

export function isDossierSectionId(value: string): value is DossierSectionId {
  return DOSSIER_SECTIONS.some((section) => section.id === value);
}

export function resolveDossierSection(value: string): DossierSectionId | null {
  if (isDossierSectionId(value)) return value;
  return LEGACY_SECTION_REDIRECTS[value] || null;
}
