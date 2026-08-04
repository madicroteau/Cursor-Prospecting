import Link from "next/link";
import { AccountDossierView } from "@/components/dossier/AccountDossierView";
import { DossierBackLink } from "@/components/dossier/DossierSection";
import { SiteHeader } from "@/components/SiteHeader";
import { getMockDossier } from "@/lib/mock-data";

interface DossierPageProps {
  searchParams: Promise<{
    name?: string;
    website?: string;
  }>;
}

export default async function DossierPage({ searchParams }: DossierPageProps) {
  const params = await searchParams;
  const companyName = params.name?.trim() || "AdventHealth";
  const companyWebsite =
    params.website?.trim() || "https://www.adventhealth.com";

  const dossier = getMockDossier(companyName, companyWebsite);

  return (
    <div className="relative min-h-screen">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(37,99,235,0.12),transparent)]" />
      </div>

      <SiteHeader />

      <main className="relative mx-auto max-w-5xl px-6 py-10">
        <DossierBackLink />

        <header className="mt-6 border-b border-border pb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                Account Dossier
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
            </div>

            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
              Mock data · Phase 1 preview
            </span>
          </div>
        </header>

        <div className="py-8">
          <AccountDossierView dossier={dossier} />
        </div>
      </main>
    </div>
  );
}
