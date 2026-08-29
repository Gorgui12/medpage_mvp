// app/not-found.js
import Link from "next/link";
import { Stethoscope } from "lucide-react";

export const metadata = {
  title: "Page introuvable | MedPage",
  description: "Le praticien que vous cherchez n'est pas trouvé sur MedPage.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center">
          <Stethoscope className="h-8 w-8 text-teal-600" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-2">
          404
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Ce praticien n'est pas trouvé sur MedPage
        </h1>
        <p className="text-slate-500 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée. Retournez
          sur la page d'accueil pour découvrir MedPage.
        </p>
        <Link
          href="https://medpage.site"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
        >
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
