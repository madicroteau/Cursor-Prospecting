import { ClaimBadge, ConfidenceBadge, SampleBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import type { JobIntelligence } from "@/lib/experimental-intelligence";

export function JobIntelligenceSection({ data }: { data: JobIntelligence }) {
  return (
    <DossierSection
      id="job-intelligence"
      title="Job Intelligence"
      icon="tech"
      accent="emerald"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {data.isSample ? <SampleBadge /> : null}
        <span className="text-xs text-text-muted">
          Analyzes public job signals — not proof of a tooling problem
        </span>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">{data.summary}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Relevant technical openings"
          value={String(data.totalRelevantOpenings)}
        />
        <Metric
          label="Technologies detected"
          value={String(data.technologiesDetected.length)}
        />
        <Metric label="Signals analyzed" value={String(data.signals.length)} />
        <Metric
          label="Top categories"
          value={data.categories
            .filter((c) => c.count > 0)
            .slice(0, 2)
            .map((c) => c.category)
            .join(", ") || "None yet"}
        />
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Categories
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {data.categories.map((category) => (
            <div
              key={category.category}
              className="flex items-center justify-between rounded-lg border border-border/80 bg-surface-elevated/60 px-3 py-2 text-sm"
            >
              <span className="text-text-secondary">{category.category}</span>
              <span className="font-semibold text-white">{category.count}</span>
            </div>
          ))}
        </div>
      </div>

      {data.technologiesDetected.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Technologies & terminology detected
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.technologiesDetected.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100/90"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Meaningful signals
        </h3>
        {data.signals.map((signal) => (
          <article
            key={signal.signal}
            className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <ClaimBadge type={signal.claimType} />
              <ConfidenceBadge level={signal.confidence} />
            </div>
            <h4 className="font-medium text-white">{signal.signal}</h4>
            <Meta
              label="Supporting job postings"
              value={
                signal.supportingJobPostings.length
                  ? signal.supportingJobPostings.join(", ")
                  : "None listed"
              }
            />
            <Meta
              label="Supporting job count"
              value={String(signal.supportingJobCount)}
            />
            <Meta
              label="Technologies detected"
              value={
                signal.technologiesDetected.length
                  ? signal.technologiesDetected.join(", ")
                  : "None"
              }
            />
            <Meta label="Evidence" value={signal.evidence} />
            <Meta
              label="Potential business implication"
              value={signal.businessImplication}
            />
            <Meta
              label="Potential Cursor relevance"
              value={signal.cursorRelevance}
            />
            {signal.sourceUrls.length > 0 ? (
              <div className="pt-1">
                <p className="text-xs font-medium text-text-muted">Source URLs</p>
                <ul className="mt-1 space-y-1">
                  {signal.sourceUrls.map((url) => (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-xs text-blue-400 hover:text-blue-300"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </DossierSection>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/80 bg-surface-elevated/60 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm leading-relaxed text-text-secondary">
      <span className="font-medium text-text-muted">{label}: </span>
      {value}
    </p>
  );
}
