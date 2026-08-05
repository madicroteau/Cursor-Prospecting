import { SampleBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import type { LiveResearchResult } from "@/lib/live-research";
import {
  RESEARCH_CATEGORIES,
  RESEARCH_CATEGORY_LABELS,
} from "@/lib/organize-research";
import { formatDisplayText, formatHeadline } from "@/lib/text-format";

export function LiveResearchSection({
  research,
  companyName,
}: {
  research: LiveResearchResult;
  companyName?: string;
}) {
  const isLive = research.status === "live";
  const name = companyName || research.companyName;

  return (
    <DossierSection
      id="live-research"
      title="Live Web Research"
      icon="sources"
      accent="emerald"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {isLive ? (
          <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-200">
            LIVE SOURCES
          </span>
        ) : (
          <SampleBadge label="LIVE RESEARCH NOT ACTIVE" />
        )}
        <span className="text-xs text-text-muted">
          {formatDisplayText(research.message, {
            companyName: name,
            ensurePunctuation: false,
          })}
        </span>
      </div>

      {research.status === "missing_key" ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-text-secondary">
          <p className="font-medium text-amber-100">What this means</p>
          <p className="mt-2">
            The app can search the public web with Tavily, but it needs your API
            key first.
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5">
            <li>
              Create a free key at{" "}
              <a
                href="https://tavily.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                tavily.com
              </a>
            </li>
            <li>
              Create a file named{" "}
              <code className="text-amber-100">.env.local</code> in this project
            </li>
            <li>
              Add:{" "}
              <code className="text-amber-100">TAVILY_API_KEY=your_key_here</code>
            </li>
            <li>Restart the app with npm run dev</li>
          </ol>
        </div>
      ) : null}

      {research.status === "error" ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
          Live research failed. The mock dossier below is still available.
          {research.errors.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-200/80">
              {research.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {isLive
        ? RESEARCH_CATEGORIES.map((category) => {
            const items = research.organized[category];
            if (items.length === 0) return null;

            return (
              <div key={category} className="mt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {RESEARCH_CATEGORY_LABELS[category]}
                </h3>
                <ul className="mt-3 space-y-3">
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
                        {formatHeadline(item.title, { companyName: name })}
                      </a>
                      {item.publishedDate ? (
                        <p className="mt-1 text-xs text-text-muted">
                          Date: {item.publishedDate}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                        {formatDisplayText(item.snippet, { companyName: name })}
                      </p>
                      <p className="mt-2 break-all text-xs text-text-muted">
                        {item.url}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        : null}
    </DossierSection>
  );
}
