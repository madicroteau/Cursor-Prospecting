import type { ReactNode } from "react";

type DossierSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export default function DossierSection({
  id,
  title,
  children,
}: DossierSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-border pt-10 first:border-t-0 first:pt-0"
    >
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-foreground">
        {children}
      </div>
    </section>
  );
}
