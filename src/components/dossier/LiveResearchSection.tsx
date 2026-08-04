import { SampleBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import type {
  LiveResearchBucket,
  LiveResearchResult,
} from "@/lib/live-research";

const BUCKET_LABELS: Record<LiveResearchBucket, string> = {
  overview: "Overview",
  technology: "Technology / AI",
  leadership: "Leadership",
  hiring: "Hiring",
  news: "Recent news",
};

const BUCKET_ORDER: LiveResearchBucket[] = [
  "overview",
  "technology",
  "leadership",
  "hiring",
  "news",
];

export function LiveResearchSection({
  research,
}: {
  research: LiveResearchResult;
}) {
  const isLive = research.status === "live";

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
        <span className="text-xs text-text-muted">{research.message}</span>
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
        ? BUCKET_ORDER.map((bucket) => {
            const items = research.items.filter((item) => item.bucket === bucket);
            if (items.length === 0) return null;

            return (
              <div key={bucket} className="mt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {BUCKET_LABELS[bucket]}
                </h3>
                <ul className="mt-3 space-y-3">
                  {items.map((item) => (
                    <li
                      key={`${bucket}-${item.url}`}
                      className="rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
                    >
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-400 hover:text-blue-300"
                      >
                        {item.title}
                      </a>
                      {item.publishedDate ? (
                        <p className="mt-1 text-xs text-text-muted">
                          Date: {item.publishedDate}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                        {item.snippet}
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
