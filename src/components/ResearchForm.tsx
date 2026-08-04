"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResearchForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = companyName.trim();
    const website = companyWebsite.trim();

    if (!name || !website) {
      setError("Please enter both a company name and website.");
      return;
    }

    setError("");

    const params = new URLSearchParams({
      company: name,
      website,
    });

    router.push(`/account?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="companyName"
          className="block text-sm font-semibold tracking-wide text-foreground"
        >
          Company Name
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          placeholder="AdventHealth"
          className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted"
          autoComplete="organization"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="companyWebsite"
          className="block text-sm font-semibold tracking-wide text-foreground"
        >
          Company Website
        </label>
        <input
          id="companyWebsite"
          name="companyWebsite"
          type="text"
          value={companyWebsite}
          onChange={(event) => setCompanyWebsite(event.target.value)}
          placeholder="https://www.adventhealth.com"
          className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted"
          autoComplete="url"
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-md bg-accent px-4 py-3.5 text-sm font-bold tracking-[0.08em] text-white transition-colors hover:bg-accent-hover"
      >
        RESEARCH ACCOUNT
      </button>
    </form>
  );
}
