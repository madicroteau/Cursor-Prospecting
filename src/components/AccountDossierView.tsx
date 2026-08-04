import ClaimBadge from "@/components/ClaimBadge";
import DossierSection from "@/components/DossierSection";
import type { AccountDossier, Source } from "@/lib/dossier-types";
import Link from "next/link";

const NAV_ITEMS = [
  { id: "executive-brief", label: "Executive Brief" },
  { id: "why-now", label: "Why Now" },
  { id: "people", label: "People" },
  { id: "hiring", label: "Hiring" },
  { id: "initiatives", label: "Initiatives" },
  { id: "technology", label: "Technology" },
  { id: "financial", label: "Financial" },
  { id: "prospecting-plan", label: "Prospecting Plan" },
  { id: "sources", label: "Sources" },
];

function SourceRef({
  sourceId,
  sources,
}: {
  sourceId: string;
  sources: Source[];
}) {
  const source = sources.find((item) => item.id === sourceId);
  if (!source) return null;

  return (
    <a
      href={`#sources`}
      className="text-sm font-semibold text-accent hover:text-accent-hover"
      title={source.title}
    >
      Source: {source.title}
    </a>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-semibold text-foreground">{label}: </span>
      <span className="text-muted">{value}</span>
    </p>
  );
}

export default function AccountDossierView({
  dossier,
}: {
  dossier: AccountDossier;
}) {
  const websiteHref = dossier.companyWebsite;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 lg:flex-row lg:gap-10">
      <aside className="lg:sticky lg:top-8 lg:h-fit lg:w-56 lg:shrink-0">
        <Link
          href="/"
          className="text-sm font-semibold text-accent hover:text-accent-hover"
        >
          ← New research
        </Link>

        <p className="mt-6 text-xs font-bold tracking-[0.14em] text-muted uppercase">
          Account Intel
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground">
          {dossier.companyName}
        </h1>

        {websiteHref ? (
          <a
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block break-all text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            {websiteHref}
          </a>
        ) : null}

        {dossier.isPlaceholder ? (
          <p className="mt-4 rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-amber-950">
            Sample layout only. Live research is not connected yet.
          </p>
        ) : null}

        <nav className="mt-6 hidden space-y-2 lg:block" aria-label="Dossier sections">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="block text-sm font-medium text-muted transition-colors hover:text-accent"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="mt-8 min-w-0 flex-1 space-y-12 lg:mt-0">
        <DossierSection id="executive-brief" title="Executive Brief">
          <p>{dossier.executiveBrief.companySummary}</p>

          <div>
            <h3 className="text-sm font-bold tracking-wide text-muted uppercase">
              Major strategic priorities
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {dossier.executiveBrief.strategicPriorities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-wide text-muted uppercase">
              Major technology priorities
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {dossier.executiveBrief.technologyPriorities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-wide text-muted uppercase">
              Top 3 Why Now signals
            </h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              {dossier.executiveBrief.whyNowSignals.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-wide text-muted uppercase">
              Top target personas
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {dossier.executiveBrief.topPersonas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-wide text-muted uppercase">
              Recommended prospecting angle
            </h3>
            <p className="mt-2">{dossier.executiveBrief.recommendedAngle}</p>
          </div>
        </DossierSection>

        <DossierSection id="why-now" title="Why Now">
          {dossier.whyNow.map((signal, index) => (
            <article
              key={`${signal.whatHappened}-${index}`}
              className="space-y-2 border-b border-border pb-5 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type={signal.claimType} />
                <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                  Confidence: {signal.confidence}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{signal.whatHappened}</h3>
              {signal.date ? <MetaRow label="Date" value={signal.date} /> : null}
              <MetaRow label="Evidence" value={signal.evidence} />
              <MetaRow label="Why it matters" value={signal.whyItMatters} />
              <MetaRow
                label="Possible relevance to Cursor"
                value={signal.cursorRelevance}
              />
              <SourceRef sourceId={signal.sourceId} sources={dossier.sources} />
            </article>
          ))}
        </DossierSection>

        <DossierSection id="people" title="People">
          <p className="text-sm text-muted">
            Do not invent people or titles. Placeholders below will be replaced
            by confirmed public leaders only.
          </p>
          {dossier.people.map((person, index) => (
            <article
              key={`${person.title}-${index}`}
              className="space-y-2 border-b border-border pb-5 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type={person.claimType} />
              </div>
              <h3 className="text-lg font-semibold">
                {person.name}
                <span className="font-normal text-muted"> — {person.title}</span>
              </h3>
              <MetaRow label="Why relevant" value={person.whyRelevant} />
              <MetaRow
                label="Initiatives / public statements"
                value={person.initiativesOrStatements}
              />
              <SourceRef sourceId={person.sourceId} sources={dossier.sources} />
            </article>
          ))}
        </DossierSection>

        <DossierSection id="hiring" title="Hiring">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-muted uppercase">
              Relevant open jobs
            </h3>
            <ul className="mt-3 space-y-4">
              {dossier.hiring.jobs.map((job) => (
                <li key={job.title} className="space-y-1">
                  <p className="font-semibold">{job.title}</p>
                  <MetaRow label="Category" value={job.category} />
                  <MetaRow
                    label="Technologies"
                    value={job.technologies.join(", ")}
                  />
                  <SourceRef sourceId={job.sourceId} sources={dossier.sources} />
                </li>
              ))}
            </ul>
          </div>

          <MetaRow
            label="Common job categories"
            value={dossier.hiring.commonCategories.join(", ")}
          />
          <MetaRow
            label="Technologies mentioned"
            value={dossier.hiring.technologiesMentioned.join(", ")}
          />
          <MetaRow label="Hiring patterns" value={dossier.hiring.patterns} />
          <div className="flex flex-wrap items-start gap-2">
            <ClaimBadge type="SALES_HYPOTHESIS" />
            <p>
              <span className="font-semibold">What this may suggest: </span>
              {dossier.hiring.patternSuggestion}
            </p>
          </div>
        </DossierSection>

        <DossierSection id="initiatives" title="Initiatives">
          {dossier.initiatives.map((initiative) => (
            <article
              key={initiative.name}
              className="space-y-2 border-b border-border pb-5 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type={initiative.claimType} />
              </div>
              <h3 className="text-lg font-semibold">{initiative.name}</h3>
              <MetaRow label="Evidence" value={initiative.evidence} />
              {initiative.date ? (
                <MetaRow label="Date" value={initiative.date} />
              ) : null}
              {initiative.relevantExecutive ? (
                <MetaRow
                  label="Relevant executive"
                  value={initiative.relevantExecutive}
                />
              ) : null}
              <MetaRow
                label="Possible sales relevance"
                value={initiative.salesRelevance}
              />
              <SourceRef
                sourceId={initiative.sourceId}
                sources={dossier.sources}
              />
            </article>
          ))}
        </DossierSection>

        <DossierSection id="technology" title="Technology">
          <p className="text-sm text-muted">
            Only keep technologies that have evidence in a public source.
          </p>
          {dossier.technologies.map((tech) => (
            <article
              key={tech.name}
              className="space-y-2 border-b border-border pb-5 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type="FACT" />
                <h3 className="text-lg font-semibold">{tech.name}</h3>
              </div>
              <MetaRow label="Evidence" value={tech.evidence} />
              <SourceRef sourceId={tech.sourceId} sources={dossier.sources} />
            </article>
          ))}
        </DossierSection>

        <DossierSection id="financial" title="Financial / Public Information">
          {dossier.financial.map((item) => (
            <article
              key={item.title}
              className="space-y-2 border-b border-border pb-5 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ClaimBadge type={item.claimType} />
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-muted">{item.detail}</p>
              <SourceRef sourceId={item.sourceId} sources={dossier.sources} />
            </article>
          ))}
        </DossierSection>

        <DossierSection id="prospecting-plan" title="Prospecting Plan">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-muted uppercase">
              Who to target
            </h3>
            <ul className="mt-3 space-y-4">
              {dossier.prospectingPlan.whoToTarget.map((persona) => (
                <li key={persona.persona} className="space-y-1">
                  <p className="font-semibold">{persona.persona}</p>
                  <MetaRow label="Why this persona" value={persona.why} />
                  <MetaRow
                    label="Related signal"
                    value={persona.relatedSignal}
                  />
                  <MetaRow
                    label="What to talk about"
                    value={persona.talkAbout}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-wide text-muted uppercase">
              Top 3 conversation angles
            </h3>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              {dossier.prospectingPlan.conversationAngles.map((angle) => (
                <li key={angle}>
                  <div className="inline-flex items-start gap-2">
                    <ClaimBadge type="SALES_HYPOTHESIS" />
                    <span>{angle}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-wide text-muted uppercase">
              Why now
            </h3>
            <p className="mt-2">{dossier.prospectingPlan.whyNowSummary}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-wide text-muted uppercase">
              Discovery questions
            </h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              {dossier.prospectingPlan.discoveryQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wide text-muted uppercase">
              Outreach
            </h3>
            <div>
              <p className="font-semibold">Short email</p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-md bg-surface-muted px-4 py-3 text-sm text-foreground">
                {dossier.prospectingPlan.outreach.email}
              </pre>
            </div>
            <div>
              <p className="font-semibold">Cold call opener</p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-md bg-surface-muted px-4 py-3 text-sm text-foreground">
                {dossier.prospectingPlan.outreach.coldCallOpener}
              </pre>
            </div>
            <div>
              <p className="font-semibold">LinkedIn message</p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-md bg-surface-muted px-4 py-3 text-sm text-foreground">
                {dossier.prospectingPlan.outreach.linkedInMessage}
              </pre>
            </div>
          </div>
        </DossierSection>

        <DossierSection id="sources" title="Sources">
          <ul className="space-y-4">
            {dossier.sources.map((source) => (
              <li key={source.id} className="space-y-1">
                <p className="font-semibold">{source.title}</p>
                {source.url && source.url !== "#" ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm font-medium text-accent underline-offset-2 hover:underline"
                  >
                    {source.url}
                  </a>
                ) : (
                  <p className="text-sm text-muted">URL pending live research</p>
                )}
                {source.date ? (
                  <MetaRow label="Date" value={source.date} />
                ) : null}
                <MetaRow label="Used for" value={source.usedFor} />
              </li>
            ))}
          </ul>
        </DossierSection>
      </div>
    </div>
  );
}
