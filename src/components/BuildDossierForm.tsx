"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function normalizeWebsiteInput(website: string) {
  const trimmed = website.trim();
  if (!trimmed) return "";
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    url.hash = "";
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    return `${url.origin}${path}${url.search}`;
  } catch {
    return withProtocol.replace(/\/$/, "");
  }
}

export function BuildDossierForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("AdventHealth");
  const [companyWebsite, setCompanyWebsite] = useState(
    "https://www.adventhealth.com",
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const name = companyName.trim();
    const website = normalizeWebsiteInput(companyWebsite);

    if (!name) {
      setError("Enter a company name to build a dossier.");
      return;
    }

    const params = new URLSearchParams({ name });
    if (website) {
      params.set("website", website);
    }

    const target = `/dossier/overview?${params.toString()}`;
    setIsSubmitting(true);
    router.push(target);
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
              disabled={isSubmitting}
              className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm text-white placeholder:text-text-muted transition-colors outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-glow disabled:opacity-60"
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
              type="text"
              inputMode="url"
              value={companyWebsite}
              onChange={(event) => setCompanyWebsite(event.target.value)}
              placeholder="https://www.adventhealth.com"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm text-white placeholder:text-text-muted transition-colors outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-glow disabled:opacity-60"
            />
          </div>
        </div>

        {error ? (
          <p className="mt-5 text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        {isSubmitting ? (
          <p className="mt-5 text-sm text-blue-300" role="status">
            Researching account… first load can take a few seconds. This is not
            a login screen.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-8 w-full rounded-lg bg-accent px-4 py-3.5 text-sm font-semibold tracking-wide text-white transition-all hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent-glow focus:ring-offset-2 focus:ring-offset-surface-card active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? "RESEARCHING…" : "RESEARCH ACCOUNT"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-text-muted">
        Public-source research only. Findings are labeled FACT, INFERENCE, or
        SALES HYPOTHESIS. No CRM login required.
      </p>
    </div>
  );
}
