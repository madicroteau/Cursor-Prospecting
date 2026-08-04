import Link from "next/link";

type AccountPageProps = {
  searchParams: Promise<{
    company?: string;
    website?: string;
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const company = params.company?.trim() || "Unknown company";
  const website = params.website?.trim() || "";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
      <Link
        href="/"
        className="text-sm font-semibold text-accent hover:text-accent-hover"
      >
        ← Back to search
      </Link>

      <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-foreground">
        {company}
      </h1>

      {website ? (
        <p className="mt-2 text-base text-muted">
          Website:{" "}
          <a
            href={website.startsWith("http") ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline-offset-2 hover:underline"
          >
            {website}
          </a>
        </p>
      ) : null}

      <section className="mt-10 rounded-md border border-border bg-surface px-6 py-8">
        <h2 className="text-lg font-semibold text-foreground">
          Research coming next
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          This page will become the full Account Intel dossier. For now, it
          confirms that your company name and website were received correctly.
        </p>
      </section>
    </main>
  );
}
