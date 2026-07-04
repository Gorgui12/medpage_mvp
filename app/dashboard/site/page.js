// app/dashboard/site/page.js
import { getOwnedSite } from "@/lib/getOwnedSite";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

// Lazy loading du SiteEditor pour améliorer les performances
const SiteEditor = dynamic(() => import("@/app/components/dashboard/SiteEditor"), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
    </div>
  ),
});

export default async function SiteEditPage() {
  const { site } = await getOwnedSite();

  if (!site) {
    redirect("/");
  }

  // site est déjà un objet plain grâce à .lean() dans getOwnedSite
  // On convertit juste _id en string pour éviter les erreurs de sérialisation
  const plainSite = {
    ...site,
    _id: site._id?.toString(),
    userId: site.userId?.toString(),
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Mon site</h1>
      <p className="text-sm text-slate-500 mb-8">
        Modifiez le contenu de votre site à tout moment. Les changements sont
        visibles publiquement dès l'enregistrement.
      </p>
      <SiteEditor initialSite={plainSite} />
    </div>
  );
}
