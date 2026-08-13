export default function DossierSectionLoading() {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
          Account Dossier
        </p>
        <h1 className="mt-3 text-2xl font-bold text-white">
          Loading account research…
        </h1>
        <p className="mt-3 max-w-xl text-sm text-text-secondary">
          Pulling public sources and building account intelligence. First load
          can take a little while — tab switches are faster after that.
        </p>
        <div className="mt-8 h-2 w-48 animate-pulse rounded-full bg-accent/40" />
      </div>
    </div>
  );
}
