import AccountDossierView from "@/components/AccountDossierView";
import { buildPlaceholderDossier } from "@/lib/placeholder-dossier";

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
  const dossier = buildPlaceholderDossier(company, website);

  return <AccountDossierView dossier={dossier} />;
}
