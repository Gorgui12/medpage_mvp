// app/create/page.js
import dynamic from "next/dynamic";

// Lazy loading du SiteForm pour améliorer les performances
const SiteForm = dynamic(() => import("../components/SiteForm"), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
    </div>
  ),
});

export const metadata = {
  title: "Créer votre site — MedPage",
  description: "Créez votre site de cabinet médical en quelques minutes.",
};

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 sm:py-20 px-4">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <p className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-50 text-teal-700 mb-4">
          MedPage
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">
          Votre site de cabinet, en ligne en 2 minutes
        </h1>
        <p className="text-slate-500 text-base">
          Remplissez vos informations, prévisualisez votre page, et activez-la.
          Aucune compétence technique requise.
        </p>
      </div>

      <SiteForm />
    </main>
  );
}
