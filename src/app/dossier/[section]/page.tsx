import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DossierBackLink } from "@/components/dossier/DossierSection";
import { DossierSectionPage } from "@/components/dossier/DossierSectionPages";
import { DossierTopNav } from "@/components/dossier/DossierTopNav";
import { SiteHeader } from "@/components/SiteHeader";
import {
  DEFAULT_DOSSIER_SECTION,
  resolveDossierSection,
} from "@/lib/dossier-sections";
import {
  buildAccountDossierBundle,
  getDossierStatusLabel,
} from "@/lib/build-account-dossier";

interface DossierSectionRouteProps {
  params: Promise<{
    section: string;
  }>;
  searchParams: Promise<{
    name?: string;
    website?: string;
  }>;
}

export default async function DossierSectionRoute({
  params,
  searchParams,
}: DossierSectionRouteProps) {
  const { section: rawSection } = await params;
  const query = await searchParams;

  const resolvedSection = resolveDossierSection(rawSection);

  if (!resolvedSection) {
    const fallback = new URLSearchParams();
    if (query.name) fallback.set("name", query.name);
    if (query.website) fallback.set("website", query.website);
    const suffix = fallback.toString();
    redirect(
      `/dossier/${DEFAULT_DOSSIER_SECTION}${suffix ? `?${suffix}` : ""}`,
    );
  }

  if (resolvedSection !== rawSection) {
    const next = new URLSearchParams();
    if (query.name) next.set("name", query.name);
    if (query.website) next.set("website", query.website);
    const suffix = next.toString();
    redirect(`/dossier/${resolvedSection}${suffix ? `?${suffix}` : ""}`);
  }

  const companyName = query.name?.trim() || "AdventHealth";
  const companyWebsite =
    query.website?.trim() || "https://www.adventhealth.com";

  const bundle = await buildAccountDossierBundle(companyName, companyWebsite);
  const { dossier, liveResearch, aiAnalysis } = bundle;
  const statusLabel = getDossierStatusLabel(bundle);
  const statusIsLive =
    aiAnalysis.status === "live" || aiAnalysis.status === "local";

  return (
    <div className="relative min-h-screen">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(37,99,235,0.12),transparent)]" />
      </div>

      <SiteHeader />

      <main className="relative mx-auto max-w-5xl px-6 py-10">
        <DossierBackLink />

        <header className="mt-6 border-b border-border pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                Account Intel
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {dossier.companyName}
              </h1>
              <Link
                href={dossier.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-blue-400"
              >
                {dossier.companyWebsite}
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v8.25A2.25 2.25 0 0 0 5.25 18.75h13.5A2.25 2.25 0 0 0 21 16.5V8.25m-10.5 0V6a2.25 2.25 0 0 1 2.25-2.25h1.372c.516 0 1.01.205 1.372.568l1.07 1.07a2.25 2.25 0 0 0 1.372.568H18a2.25 2.25 0 0 1 2.25 2.25v2.25"
                  />
                </svg>
              </Link>
              <p className="mt-3 max-w-2xl text-sm text-text-muted">
                What do I need to know before prospecting into this account?
              </p>
              <p className="mt-2 max-w-2xl text-sm text-text-muted">
                {aiAnalysis.message}
              </p>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                statusIsLive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-200"
              }`}
            >
              {statusLabel}
            </span>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="border-b border-border py-3 text-sm text-text-muted">
              Loading navigation…
            </div>
          }
        >
          <DossierTopNav activeSection={resolvedSection} />
        </Suspense>

        <div className="py-8">
          <DossierSectionPage
            section={resolvedSection}
            dossier={dossier}
            liveResearch={liveResearch}
          />
        </div>
      </main>
    </div>
  );
}
