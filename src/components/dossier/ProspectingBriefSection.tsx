import { ClaimBadge } from "@/components/ClaimBadge";
import { DossierSection } from "@/components/dossier/DossierSection";
import type { ProspectingBrief, SourcedSignal } from "@/lib/prospecting-brief";
import {
  formatDisplayText,
  formatHeadline,
  formatJobTitle,
} from "@/lib/text-format";

function LensBadge({
  label,
  tone,
}: {
  label: string;
  tone: "amber" | "blue" | "violet";
}) {
  const tones = {
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-100/90",
    blue: "border-blue-500/25 bg-blue-500/10 text-blue-100/90",
    violet: "border-violet-500/25 bg-violet-500/10 text-violet-100/90",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

function SignalCard({
  signal,
  companyName,
}: {
  signal: SourcedSignal;
  companyName: string;
}) {
  return (
    <article className="rounded-xl border border-border/80 bg-surface-elevated/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <ClaimBadge type={signal.claimType} />
        <LensBadge label={`MEDDPICC · ${signal.meddpicc}`} tone="amber" />
        <LensBadge label={`Command · ${signal.command}`} tone="blue" />
      </div>

      <h3 className="mt-3 text-sm font-semibold leading-snug text-white">
        {formatHeadline(signal.headline, { companyName })}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {formatDisplayText(signal.insight, { companyName })}
      </p>

      <p className="mt-3 text-xs text-text-muted">
        Talk to:{" "}
        <span className="text-text-secondary">
          {formatJobTitle(signal.persona, { companyName })}
        </span>
      </p>

      {signal.sources.length > 0 ? (
        <div className="mt-3 border-t border-border/60 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Sources
          </p>
          <ul className="mt-2 space-y-1.5">
            {signal.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-words text-xs text-blue-400 hover:text-blue-300"
                >
                  {formatHeadline(source.title, { companyName })}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export function ProspectingBriefSection({
  brief,
  companyName,
}: {
  brief: ProspectingBrief;
  companyName: string;
}) {
  return (
    <div className="space-y-6">
      <DossierSection
        id="value-thesis"
        title="Value Thesis · Sell Cursor"
        icon="cursor"
        accent="blue"
      >
        <p className="text-sm leading-relaxed text-text-secondary">
          {formatDisplayText(brief.valueThesis, { companyName })}
        </p>
        <p className="mt-3 text-xs text-text-muted">
          Framed with MEDDPICC (qualify the deal) and Command of the Message
          (present Cursor value clearly).
        </p>
      </DossierSection>

      <DossierSection
        id="priority-signals"
        title="Priority Prospecting Signals"
        icon="signals"
        accent="amber"
      >
        {brief.prioritySignals.length > 0 ? (
          <div className="space-y-4">
            {brief.prioritySignals.map((signal) => (
              <SignalCard
                key={`${signal.headline}-${signal.sources[0]?.url || "nosource"}`}
                signal={signal}
                companyName={companyName}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            No high-value prospecting signals yet. Run live research to populate
            this brief.
          </p>
        )}
      </DossierSection>

      <DossierSection
        id="why-cursor-now"
        title="Why Cursor · Why Now"
        icon="cursor"
        accent="violet"
      >
        {brief.whyCursorNow.length > 0 ? (
          <div className="space-y-4">
            {brief.whyCursorNow.map((signal) => (
              <SignalCard
                key={`${signal.headline}-${signal.command}`}
                signal={signal}
                companyName={companyName}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Add live technology, hiring, or initiative sources to build Cursor
            timing angles.
          </p>
        )}
      </DossierSection>

      <DossierSection
        id="discovery"
        title="Discovery Questions"
        icon="talk"
        accent="blue"
      >
        <ol className="space-y-3">
          {brief.discoveryQuestions.map((question, index) => (
            <li key={question} className="flex gap-3 text-sm text-text-secondary">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-blue-400 ring-1 ring-accent/30">
                {index + 1}
              </span>
              <span className="pt-0.5">
                {formatDisplayText(question, {
                  companyName,
                  ensurePunctuation: false,
                })}
              </span>
            </li>
          ))}
        </ol>
      </DossierSection>

      <DossierSection
        id="next-actions"
        title="Next Actions"
        icon="people"
        accent="emerald"
      >
        <ul className="space-y-3">
          {brief.nextActions.map((action) => (
            <li
              key={action}
              className="flex gap-3 text-sm leading-relaxed text-text-secondary"
            >
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/80"
              />
              <span>{formatDisplayText(action, { companyName })}</span>
            </li>
          ))}
        </ul>
      </DossierSection>
    </div>
  );
}
