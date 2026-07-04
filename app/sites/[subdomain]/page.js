// app/sites/[subdomain]/page.js
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";
import { Clock } from "lucide-react";
import { isSiteAccessible } from "@/lib/siteAccess";
import { serializeMongoose } from "@/lib/serialize";

import SiteHeader from "@/app/components/site-sections/SiteHeader";
import Hero from "@/app/components/site-sections/Hero";
import About from "@/app/components/site-sections/About";
import Services from "@/app/components/site-sections/Services";
import Gallery from "@/app/components/site-sections/Gallery";
import Testimonials from "@/app/components/site-sections/Testimonials";
import FAQ from "@/app/components/site-sections/FAQ";
import LocationMap from "@/app/components/site-sections/LocationMap";
import BookingSection from "@/app/components/site-sections/BookingSection";
import PracticalInfo from "@/app/components/site-sections/PracticalInfo";
import SiteFooter from "@/app/components/site-sections/SiteFooter";
import RevealOnScroll from "@/app/components/site-sections/RevealOnScroll";

// Revalidation courte pendant le trial (le site peut être activé à tout moment)
// et plus longue après paiement (contenu change rarement).
export const revalidate = 30;

async function getSiteData(subdomain) {
  await dbConnect();
  const site = await Site.findOne({ subdomain: subdomain.toLowerCase() }).lean();
  // Sérialiser pour éviter les erreurs de sérialisation Mongoose
  return site ? serializeMongoose(site) : null;
}

/**
 * SEO dynamique : Next.js exécute cette fonction côté serveur AVANT le rendu
 * et injecte le résultat dans le <head> du HTML généré. C'est ce qui permet
 * à Google d'indexer un titre/description uniques pour CHAQUE médecin,
 * sans qu'on écrive une seule ligne de JS côté client.
 */
export async function generateMetadata({ params }) {
  const { subdomain } = await params; // Next.js 15 : params est désormais une Promise
  const site = await getSiteData(subdomain);

  if (!site) {
    return {
      title: "Site introuvable | MedPage",
      description: "Ce site n'existe pas ou n'est plus disponible.",
    };
  }

  const title = `Dr. ${site.doctorName} - ${site.specialty} à ${site.city} | Prendre RDV`;
  const description = site.tagline
    ? `${site.tagline} — ${site.cabinetName} à ${site.city}.`
    : `${site.cabinetName} : cabinet de ${site.specialty.toLowerCase()} à ${site.city}. Prenez rendez-vous en ligne avec Dr. ${site.doctorName} dès maintenant.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: site.coverPhotoUrl ? [site.coverPhotoUrl] : undefined,
    },
    robots: isSiteAccessible(site)
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function MedicalSitePage({ params }) {
  const { subdomain } = await params;
  const site = await getSiteData(subdomain);

  // --- Cas 1 : sous-domaine inconnu ---
  if (!site) {
    return <NotConfiguredPage message="Ce site n'existe pas." />;
  }

  // --- Cas 2 : trial expiré et pas d'abonnement actif ---
  if (!isSiteAccessible(site)) {
    return (
      <NotConfiguredPage message="Ce site est momentanément indisponible." />
    );
  }

  // --- Cas 3 : trial en cours OU abonnement actif ---
  const accent = site.themeColor || "#0EA5A8";

  return (
    <main className="min-h-screen bg-white text-slate-800 antialiased">
      <SiteHeader site={site} accent={accent} />

      <Hero site={site} accent={accent} />

      <div id="about">
        <RevealOnScroll>
          <About site={site} accent={accent} />
        </RevealOnScroll>
      </div>

      <div id="services">
        <RevealOnScroll>
          <Services site={site} accent={accent} />
        </RevealOnScroll>
      </div>

      <div id="gallery">
        <RevealOnScroll>
          <Gallery site={site} accent={accent} />
        </RevealOnScroll>
      </div>

      <div id="testimonials">
        <RevealOnScroll>
          <Testimonials site={site} accent={accent} />
        </RevealOnScroll>
      </div>

      <RevealOnScroll>
        <FAQ site={site} accent={accent} />
      </RevealOnScroll>

      <RevealOnScroll>
        <LocationMap site={site} accent={accent} />
      </RevealOnScroll>

      <RevealOnScroll>
        <BookingSection site={site} accent={accent} />
      </RevealOnScroll>

      <RevealOnScroll>
        <PracticalInfo site={site} accent={accent} />
      </RevealOnScroll>

      <SiteFooter site={site} />
    </main>
  );
}

/**
 * Page neutre affichée quand le site n'est pas (encore) accessible publiquement.
 */
function NotConfiguredPage({ message }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center">
          <Clock className="h-8 w-8 text-slate-500" />
        </div>
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          {message}
        </h1>
        <p className="text-sm text-slate-500">
          Propulsé par{" "}
          <span className="font-medium text-slate-700">MedPage</span>
        </p>
      </div>
    </main>
  );
}
