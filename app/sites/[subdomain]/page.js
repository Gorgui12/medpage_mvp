// app/sites/[subdomain]/page.js
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";
import { Clock } from "lucide-react";
import { isSiteAccessible } from "@/lib/siteAccess";
import { serializeMongoose } from "@/lib/serialize";
import { detectGeo } from "@/lib/geoDetect";
import { cloudinaryOptimized } from "@/lib/cloudinaryImage";
import dynamic from "next/dynamic";

import SiteHeader from "@/app/components/site-sections/SiteHeader";
import Hero from "@/app/components/site-sections/Hero";
import SiteSchemaOrg from "@/app/components/site-sections/SiteSchemaOrg";
import SectionSkeleton from "@/app/components/site-sections/SectionSkeleton";
import About from "@/app/components/site-sections/About";

// Revalidation courte pendant le trial (le site peut être activé à tout moment)
// et plus longue après paiement (contenu change rarement).
export const revalidate = 30;

// Viewport dynamique (mobile SEO) : maximum-scale autorisé jusqu'à 5 pour la
// lisibilité Google, séparé des métadonnées (convention Next.js 16).
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Sections non critiques chargées en lazy (dynamiquement) avec un squelette
// de chargement : améliore le LCP et le Perceived Performance, donc le SEO.
const Services = dynamic(
  () => import("@/app/components/site-sections/Services"),
  { loading: () => <SectionSkeleton /> }
);
const Gallery = dynamic(
  () => import("@/app/components/site-sections/Gallery"),
  { loading: () => <SectionSkeleton /> }
);
const Testimonials = dynamic(
  () => import("@/app/components/site-sections/Testimonials"),
  { loading: () => <SectionSkeleton /> }
);
const FAQ = dynamic(
  () => import("@/app/components/site-sections/FAQ"),
  { loading: () => <SectionSkeleton /> }
);
const LocationMap = dynamic(
  () => import("@/app/components/site-sections/LocationMap"),
  { loading: () => <SectionSkeleton /> }
);
const BookingSection = dynamic(
  () => import("@/app/components/site-sections/BookingSection"),
  { loading: () => <SectionSkeleton /> }
);
const PracticalInfo = dynamic(
  () => import("@/app/components/site-sections/PracticalInfo"),
  { loading: () => <SectionSkeleton /> }
);
const SiteFooter = dynamic(
  () => import("@/app/components/site-sections/SiteFooter"),
  { loading: () => <SectionSkeleton /> }
);
const RevealOnScroll = dynamic(
  () => import("@/app/components/site-sections/RevealOnScroll"),
  { ssr: true }
);

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
      robots: { index: false, follow: false },
    };
  }

  const geo = detectGeo(site.city);
  const baseUrl = `https://${subdomain}.medpage.site`;
  const isEnglish = geo.lang === "en";
  const doctorFull = `Dr. ${site.doctorName}`;

  // --- Title / Description localisés ---
  const title = isEnglish
    ? `Dr. ${site.doctorName} — ${site.specialty} in ${site.city} | Book Appointment Online`
    : `Dr. ${site.doctorName} — ${site.specialty} à ${site.city} | Consultation & RDV en ligne`;

  let description;
  if (isEnglish) {
    description = site.tagline
      ? `${site.tagline} — ${site.cabinetName} in ${site.city}.`
      : `${site.cabinetName}: ${site.specialty.toLowerCase()} practice in ${site.city}. Book appointment online with Dr. ${site.doctorName} today.`;
  } else {
    description = site.tagline
      ? `${site.tagline} — ${site.cabinetName} à ${site.city}.`
      : `${site.cabinetName} : cabinet de ${site.specialty.toLowerCase()} à ${site.city}. Prenez rendez-vous en ligne avec Dr. ${site.doctorName} dès maintenant.`;
  }
  // Description max 160 caractères (troncature propre sur un mot)
  if (description.length > 160) {
    description = description.slice(0, 157).trim() + "...";
  }

  const keywords = [
    site.specialty,
    site.city,
    `${site.specialty} ${site.city}`,
    isEnglish ? `${site.specialty} practice ${site.city}` : `cabinet médical ${site.city}`,
    isEnglish ? `doctor ${site.city}` : `docteur ${site.city}`,
    isEnglish ? `${site.specialty} doctor` : `médecin ${site.specialty}`,
    `${doctorFull} ${site.city}`,
  ].filter(Boolean);

  const indexed = isSiteAccessible(site);
  const imageUrl =
    cloudinaryOptimized(site.coverPhotoUrl) ||
    cloudinaryOptimized(site.profilePhotoUrl) ||
    "https://medpage.site/og-default.png";
  const nameParts = (site.doctorName || "").split(" ").filter(Boolean);

  return {
    title,
    description,
    keywords,
    // Canonical = sous-domaine, pas l'URL rewritée par le middleware
    alternates: {
      canonical: baseUrl,
      languages: {
        [geo.hreflang]: baseUrl,
        "x-default": baseUrl,
      },
    },
    robots: indexed
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: site.cabinetName,
      locale: geo.locale,
      type: "profile",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${doctorFull} - ${site.specialty} ${site.city}`,
        },
      ],
      profile: {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" ") || undefined,
        username: subdomain,
      },
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    other: {
      "geo.region": geo.addressCountry,
      "geo.placename": site.city,
      "geo.position": "",
      ICBM: "",
      "DC.title": `${site.specialty} ${site.city}`,
      "DC.subject": site.specialty,
      "DC.language": geo.lang,
    },
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
  const geo = detectGeo(site.city);

  return (
    <main
      className="min-h-screen text-slate-800 antialiased"
      style={{ backgroundColor: "var(--bg-base)", ["--accent" ]: accent }}
    >
      {/* Données structurées schema.org injectées côté serveur */}
      <SiteSchemaOrg site={site} />

      <SiteHeader site={site} accent={accent} />

      <Hero site={site} accent={accent} geo={geo} />

      <div id="about">
        {/*
          About reste en statique (au-dessus de la ligne de flottaison) pour
          un meilleur LCP ; les sections suivantes sont lazy-loadées.
        */}
        <RevealOnScroll variant="slide-right">
          <About site={site} accent={accent} geo={geo} />
        </RevealOnScroll>
      </div>

      <div id="services">
        <RevealOnScroll variant="slide-up">
          <Services site={site} accent={accent} />
        </RevealOnScroll>
      </div>

      <div id="gallery">
        <RevealOnScroll variant="scale">
          <Gallery site={site} accent={accent} />
        </RevealOnScroll>
      </div>

      <div id="testimonials">
        <RevealOnScroll variant="slide-left">
          <Testimonials site={site} accent={accent} />
        </RevealOnScroll>
      </div>

      <RevealOnScroll variant="fade">
        <FAQ site={site} accent={accent} />
      </RevealOnScroll>

      <RevealOnScroll variant="slide-left">
        <LocationMap site={site} accent={accent} />
      </RevealOnScroll>

      <RevealOnScroll variant="slide-up">
        <BookingSection site={site} accent={accent} geo={geo} />
      </RevealOnScroll>

      <RevealOnScroll variant="fade">
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
