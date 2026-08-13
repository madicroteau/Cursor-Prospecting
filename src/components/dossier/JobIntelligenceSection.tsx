import { ClaimBadge, ConfidenceBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import {
  SourceLink,
  UnavailableState,
} from "@/components/dossier/UnavailableState";
import type { JobIntelligence } from "@/lib/experimental-intelligence";
import { formatDisplayText, formatHeadline, formatJobTitle } from "@/lib/text-format";

export function JobIntelligenceSection({
  data,
  companyName,
}: {
  data: JobIntelligence;
  companyName?: string;
}) {
  const hasJobs =
    data.extractedJobs.length > 0 ||
    data.topTechnologies.length > 0 ||
    data.hiringThemes.length > 0;

  return (
    <DossierSection
      id="job-intelligence"
      title="Job Intelligence"
      icon="tech"
      accent="emerald"
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        {formatDisplayText(data.summary, { companyName })}
      </p>

      {!hasJobs ? (
        <div className="mt-4">
          <UnavailableState
            title="No relevant technical jobs analyzed yet"
            message={
              data.unavailableNote ||
              "This page analyzes sales signals in public technical openings. It stays empty rather than inventing job postings."
            }
          />
        </div>
      ) : null}

      {data.topTechnologies.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Top technologies mentioned in jobs
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {data.topTechnologies.map((item) => (
              <div
                key={item.technology}
                className="flex items-center justify-between rounded-lg border border-border/80 bg-surface-elevated/60 px-3 py-2 text-sm"
              >
                <span className="text-white">{item.technology}</span>
                <span className="text-text-muted">
                  {item.count} posting{item.count === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data.hiringThemes.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Hiring themes
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.hiringThemes.map((theme) => (
              <span
                key={theme.theme}
                className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100/90"
              >
                {theme.theme} · {theme.count}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {data.salesSignals.length > 0 ? (
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Potential sales signals
          </h3>
          {data.salesSignals.map((signal, index) => (
            <article
              key={`${signal.fact}-${index}`}
              className="space-y-3 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
            >
              <ConfidenceBadge level={signal.confidence} />
              <div>
                <ClaimBadge type="FACT" />
                <p className="mt-2 text-sm text-text-secondary">
                  {formatDisplayText(signal.fact, { companyName })}
                </p>
              </div>
              <div>
                <ClaimBadge type="INFERENCE" />
                <p className="mt-2 text-sm text-text-secondary">
                  {formatDisplayText(signal.inference, { companyName })}
                </p>
              </div>
              <div>
                <ClaimBadge type="SALES_HYPOTHESIS" />
                <p className="mt-2 text-sm text-text-secondary">
                  {formatDisplayText(signal.salesHypothesis, { companyName })}
                </p>
              </div>
              {signal.sourceUrls.length > 0 ? (
                <ul className="space-y-1">
                  {signal.sourceUrls.map((url) => (
                    <li key={url}>
                      <SourceLink href={url} label={url} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      {data.extractedJobs.length > 0 ? (
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Relevant technical jobs
          </h3>
          {data.extractedJobs.map((job) => (
            <article
              key={job.sourceUrl}
              className="space-y-2 rounded-lg border border-border/80 bg-surface-elevated/50 p-4"
            >
              <h4 className="font-medium text-white">
                {formatJobTitle(job.title, { companyName })}
              </h4>
              <Meta label="Department" value={job.department} />
              <Meta label="Location" value={job.location} />
              <Meta
                label="Technologies mentioned"
                value={job.technologies.join(", ") || "None extracted"}
              />
              <Meta
                label="Responsibilities"
                value={formatDisplayText(job.responsibilities, {
                  companyName,
                  ensurePunctuation: false,
                })}
              />
              <Meta
                label="AI terminology"
                value={job.aiTerminology.join(", ") || "None extracted"}
              />
              <Meta
                label="Cloud terminology"
                value={job.cloudTerminology.join(", ") || "None extracted"}
              />
              <Meta
                label="Developer tooling"
                value={job.developerTooling.join(", ") || "None extracted"}
              />
              <SourceLink
                href={job.sourceUrl}
                label={formatHeadline(job.sourceTitle, { companyName })}
              />
            </article>
          ))}
        </div>
      ) : null}
    </DossierSection>
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
