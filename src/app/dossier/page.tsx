import { redirect } from "next/navigation";
import { DEFAULT_DOSSIER_SECTION } from "@/lib/dossier-sections";

interface DossierIndexProps {
  searchParams: Promise<{
    name?: string;
    website?: string;
  }>;
}

export default async function DossierIndexPage({
  searchParams,
}: DossierIndexProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.name?.trim()) {
    query.set("name", params.name.trim());
  }
  if (params.website?.trim()) {
    query.set("website", params.website.trim());
  }

  const suffix = query.toString();
  redirect(
    `/dossier/${DEFAULT_DOSSIER_SECTION}${suffix ? `?${suffix}` : ""}`,
  );
}
