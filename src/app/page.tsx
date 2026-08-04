import ResearchForm from "@/components/ResearchForm";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl">
        <p className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
          Account Intel
        </p>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
          Enter a company and get a sales prospecting dossier from public
          information.
        </p>

        <ResearchForm />

        <p className="mt-8 text-sm text-muted">
          Try a healthcare account like AdventHealth, Orlando Health, or BayCare.
        </p>
      </section>
    </main>
  );
}
