import { DossierSection } from "@/components/dossier/DossierSection";
import {
  SourceLink,
  UnavailableState,
} from "@/components/dossier/UnavailableState";
import type {
  EvidenceSource,
  SourceGroup,
} from "@/lib/experimental-intelligence";
import { formatHeadline } from "@/lib/text-format";

const GROUP_ORDER: SourceGroup[] = [
  "Company",
  "People",
  "Jobs",
  "Technology",
  "Initiatives",
  "News",
  "Financial/Public",
  "Regulatory",
];

export function SourcesLibrarySection({
  sources,
  companyName,
  unavailableNote,
  generatedAt,
  liveStatus,
}: {
  sources: EvidenceSource[];
  companyName?: string;
  unavailableNote?: string;
  generatedAt: string;
  liveStatus: string;
}) {
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: sources.filter((source) => source.group === group),
  })).filter((entry) => entry.items.length > 0);

  return (
    <DossierSection id="sources" title="Sources" icon="sources" accent="emerald">
      <p className="mb-4 text-sm text-text-secondary">
        Evidence library for this dossier. Click through to the original public
        page. Findings listed under a source are the claims that source
        supports.
      </p>

      {sources.length === 0 ? (
        <UnavailableState
          title="No live sources loaded"
          message={
            unavailableNote ||
            "Add TAVILY_API_KEY to .env.local and research the account to populate this library."
          }
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ group, items }) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {group}
              </h3>
              <ul className="mt-3 space-y-3">
                {items.map((source) => (
                  <li
                    key={source.url}
                    className="rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
                  >
                    <SourceLink
                      href={source.url}
                      label={formatHeadline(source.title, { companyName })}
                    />
                    <p className="mt-1 text-xs text-text-muted">
                      {source.publisher}
                      {source.date ? ` · ${source.date}` : ""}
                    </p>
                    {source.supports.length > 0 ? (
                      <p className="mt-2 text-sm text-text-secondary">
                        <span className="font-medium text-text-muted">
                          Supports:{" "}
                        </span>
                        {source.supports.join(" · ")}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 text-xs text-text-muted">
        Generated {new Intl.DateTimeFormat("en-US", {
          dateStyle: "long",
          timeStyle: "short",
        }).format(new Date(generatedAt))}{" "}
        · Live research {liveStatus}
      </p>
    </DossierSection>
  );
}
