export const DOSSIER_SECTIONS = [
  { id: "executive-brief", label: "Executive Brief" },
  { id: "why-now", label: "Why Now" },
  { id: "buying-committee", label: "Buying Committee" },
  { id: "job-intelligence", label: "Job Intelligence" },
  { id: "initiatives", label: "Initiatives" },
  { id: "technology", label: "Technology" },
  { id: "financials", label: "Financials" },
  { id: "roi", label: "ROI / TCO" },
  { id: "research-gaps", label: "Research Gaps" },
  { id: "prospecting", label: "Prospecting" },
  { id: "sources", label: "Sources" },
] as const;

export type DossierSectionId = (typeof DOSSIER_SECTIONS)[number]["id"];

export const DEFAULT_DOSSIER_SECTION: DossierSectionId = "executive-brief";

export function isDossierSectionId(value: string): value is DossierSectionId {
  return DOSSIER_SECTIONS.some((section) => section.id === value);
}
