// app/page.js
import Link from "next/link";
import { ArrowRight, Check, Clock, Globe, Smartphone, Shield, Zap } from "lucide-react";

export const metadata = {
  title: "MedPage — Créez le site de votre cabinet médical en 2 minutes",
  description:
    "Générez un mini-site professionnel optimisé SEO pour votre cabinet médical, kiné ou clinique, accessible instantanément sur votre propre sous-domaine.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold mb-8">
            <Zap className="h-4 w-4" />
            <span>Gratuit 14 jours, sans engagement</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6">
            Votre site de cabinet médical,{" "}
            <span className="text-teal-600">en ligne en 2 minutes</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Créez un site professionnel optimisé SEO pour votre cabinet, kiné ou clinique. 
            Aucune compétence technique requise.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-600/20"
            >
              Créer mon site gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">2 min</div>
            <div className="text-sm text-slate-500">Pour créer votre site</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">100%</div>
            <div className="text-sm text-slate-500">Optimisé SEO</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">0€</div>
            <div className="text-sm text-slate-500">Essai gratuit 14j</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">24/7</div>
            <div className="text-sm text-slate-500">Support réactif</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Une solution complète pour les professionnels de santé qui veulent se digitaliser sans complications.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="Rapide et simple"
              description="Créez votre site en quelques minutes grâce à notre formulaire guidé. Pas besoin de développeur."
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Votre propre domaine"
              description="Obtenez un sous-domaine personnalisé : votre-cabinet.medpage.com"
            />
            <FeatureCard
              icon={<Smartphone className="h-6 w-6" />}
              title="Responsive mobile"
              description="Votre site s'adapte parfaitement à tous les écrans : ordinateur, tablette, smartphone."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Sécurisé et fiable"
              description="Données protégées, hébergement sécurisé, conformité RGPD."
            />
            <FeatureCard
              icon={<Check className="h-6 w-6" />}
              title="Prêt à l'emploi"
              description="Sections pré-configurées : services, horaires, localisation, prise de rendez-vous."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="SEO optimisé"
              description="Apparaissez dans les résultats de recherche locale et attirez plus de patients."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-slate-600">
              3 étapes simples pour digitaliser votre cabinet
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Remplissez le formulaire"
              description="Entrez vos informations de base : nom du cabinet, spécialité, adresse, horaires..."
            />
            <StepCard
              number="2"
              title="Personnalisez votre site"
              description="Ajoutez vos services, photos, témoignages. Choisissez vos couleurs."
            />
            <StepCard
              number="3"
              title="Publiez votre site"
              description="Activez votre site et commencez à attirer de nouveaux patients dès aujourd'hui."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-teal-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à digitaliser votre cabinet ?
          </h2>
          <p className="text-lg text-teal-100 mb-8">
            Rejoignez les centaines de professionnels de santé qui font confiance à MedPage.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-700 font-semibold rounded-xl hover:bg-slate-100 transition shadow-lg"
          >
            Commencer maintenant
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-400 text-sm">
        <div className="max-w-5xl mx-auto text-center">
          <p>© 2024 MedPage. Tous droits réservés.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
      <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
