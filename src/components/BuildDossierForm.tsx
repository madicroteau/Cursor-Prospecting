"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function BuildDossierForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const name = companyName.trim();
    if (!name) {
      setError("Enter a company name to build a dossier.");
      return;
    }

    const params = new URLSearchParams({ name });
    const website = companyWebsite.trim();
    if (website) {
      params.set("website", website);
    }

    router.push(`/dossier?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-lg">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-surface-card/80 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_48px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm"
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="company-name"
              className="mb-2 block text-sm font-medium text-text-secondary"
            >
              Company Name
            </label>
            <input
              id="company-name"
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="e.g. AdventHealth"
              className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm text-white placeholder:text-text-muted transition-colors outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-glow"
            />
          </div>

          <div>
            <label
              htmlFor="company-website"
              className="mb-2 block text-sm font-medium text-text-secondary"
            >
              Company Website
            </label>
            <input
              id="company-website"
              type="url"
              value={companyWebsite}
              onChange={(event) => setCompanyWebsite(event.target.value)}
              placeholder="https://www.adventhealth.com"
              className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm text-white placeholder:text-text-muted transition-colors outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-glow"
            />
          </div>
        </div>

        {error ? (
          <p className="mt-5 text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="mt-8 w-full rounded-lg bg-accent px-4 py-3.5 text-sm font-semibold tracking-wide text-white transition-all hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent-glow focus:ring-offset-2 focus:ring-offset-surface-card active:scale-[0.99]"
        >
          BUILD DOSSIER
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-text-muted">
        Research powered by public sources. No CRM connection required.
      </p>
    </div>
  );
}
