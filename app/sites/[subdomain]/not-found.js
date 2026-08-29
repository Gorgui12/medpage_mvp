// app/sites/[subdomain]/not-found.js
import Link from "next/link";
import { Stethoscope } from "lucide-react";

export const metadata = {
  title: "Site introuvable | MedPage",
  description: "Ce praticien n'est pas trouvé sur MedPage.",
  robots: { index: false, follow: false },
};

export default function SiteNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center">
          <Stethoscope className="h-8 w-8 text-slate-500" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">
          404
        </p>
        <h1 className="text-xl font-semibold text-slate-800 mb-3">
          Ce praticien n'est pas trouvé sur MedPage
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Ce sous-domaine n'existe pas ou n'est plus disponible. Retournez sur
          medpage.site pour découvrir nos praticiens.
        </p>
        <Link
          href="https://medpage.site"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold transition hover:opacity-90"
          style={{ backgroundColor: "#0EA5A8" }}
        >
          Retour à l'accueil MedPage
        </Link>
      </div>
    </main>
  );
}
