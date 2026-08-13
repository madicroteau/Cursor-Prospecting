import { DossierSection } from "@/components/dossier/DossierSection";
import type { LiveResearchItem } from "@/lib/live-research";
import {
  RESEARCH_CATEGORY_LABELS,
  type ResearchCategory,
} from "@/lib/organize-research";
import { formatDisplayText, formatHeadline } from "@/lib/text-format";

export function OrganizedResearchSection({
  category,
  items,
  title,
  companyName,
}: {
  category: ResearchCategory;
  items: LiveResearchItem[];
  title?: string;
  companyName?: string;
}) {
  const label = title || RESEARCH_CATEGORY_LABELS[category];

  return (
    <DossierSection
      id={`organized-${category}`}
      title={label}
      icon="sources"
      accent="emerald"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-200">
          LIVE RESEARCH · ORGANIZED
        </span>
        <span className="text-xs text-text-muted">
          {items.length > 0
            ? `${items.length} public source${items.length === 1 ? "" : "s"} in this category`
            : "No live sources landed in this category yet"}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">
          Run research with a Tavily key to populate this category from public
          sources.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={`${category}-${item.url}`}
              className="rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                {formatHeadline(item.title, { companyName })}
              </a>
              {item.publishedDate ? (
                <p className="mt-1 text-xs text-text-muted">
                  Date: {item.publishedDate}
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {formatDisplayText(item.snippet, {
                  companyName,
                  ensurePunctuation: false,
                })}
              </p>
              <p className="mt-2 break-all text-xs text-text-muted">{item.url}</p>
            </li>
          ))}
        </ul>
      )}
    </DossierSection>
  );
}

export function OrganizedResearchSummary({
  organized,
}: {
  organized: Record<ResearchCategory, LiveResearchItem[]>;
}) {
  const categories: ResearchCategory[] = [
    "leadership",
    "hiring",
    "ai",
    "technology",
    "initiatives",
    "financial",
    "compliance",
    "news",
  ];

  return (
    <DossierSection
      id="organized-summary"
      title="Organized Research Summary"
      icon="signals"
      accent="emerald"
    >
      <p className="mb-4 text-sm text-text-secondary">
        Live public sources grouped into the Step 7 Account Intel categories.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category}
            className="rounded-lg border border-border/80 bg-surface-elevated/60 p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {RESEARCH_CATEGORY_LABELS[category]}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {organized[category].length}
            </p>
          </div>
        ))}
      </div>
    </DossierSection>
  );
}
