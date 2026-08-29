// app/components/site-sections/SiteSchemaOrg.jsx
//
// Composant Server chargé d'injecter toutes les données structurées
// schema.org du site client via des balises <script type="application/ld+json">.
// Rendu uniquement côté serveur, donc Google voit les schémas dans le HTML final.
import { detectGeo } from "@/lib/geoDetect";
import { cloudinaryOptimized } from "@/lib/cloudinaryImage";

/**
 * Parser simple des horaires d'ouverture.
 * accepte des formats variés stockés en base, ex :
 *   "Lun - Ven : 9h00 - 18h00"
 *   "Monday-Friday: 9:00-18:00, Saturday: 10:00-13:00"
 * On tente d'extraire des plages « jour(s)-jour : heure-heure » et de les
 * convertir en openingHoursSpecification schema.org. Si rien ne colle,
 * on renvoie un tableau vide (le champ sera simplement omis).
 */
function parseOpeningHours(raw) {
  if (!raw) return [];
  const specs = [];

  // Tokenise les plages séparées par des virgules, points-virgules ou retours ligne.
  const segments = String(raw).split(/[;,\n]/).map((s) => s.trim()).filter(Boolean);

  for (const segment of segments) {
    const parts = segment.split(/[:\-–]/).map((s) => s.trim());

    // Une plage exploitable a besoin d'au moins 4 parties :
    // jour(s) | heure d'ouverture | heure de fermeture (+ évent. jours fin)
    if (parts.length < 3) continue;

    const dayPart = parts[0];
    const open = normalizeTime(parts[1]);
    const close = normalizeTime(parts[2] || parts[1] || "");

    if (!open || !close) continue;

    const days = daysFromPart(dayPart);
    if (days.length === 0) continue;

    specs.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens: open,
      closes: close,
    });
  }

  return specs;
}

function normalizeTime(t) {
  // convertit "9h00", "9:00", "09:00", "18h30" -> "09:00" / "18:30"
  const m = String(t || "").match(/(\d{1,2})\s*h(?:(\d{2}))?|(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const hh = m[1] || m[3];
  const mm = m[2] || m[4] || "00";
  return `${String(hh).padStart(2, "0")}:${mm}`;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_MAP = {
  lun: ["Monday"],
  mar: ["Tuesday"],
  mer: ["Wednesday"],
  jeu: ["Thursday"],
  ven: ["Friday"],
  sam: ["Saturday"],
  dim: ["Sunday"],
  mon: ["Monday"],
  tue: ["Tuesday"], tues: ["Tuesday"],
  wed: ["Wednesday"],
  thu: ["Thursday"], thur: ["Thursday"], thurs: ["Thursday"],
  fri: ["Friday"],
  sat: ["Saturday"],
  sun: ["Sunday"],
};

function daysFromPart(dayPart) {
  const lower = String(dayPart).toLowerCase().replace(/\./g, "").trim();
  const out = new Set();

  // "Lun - Mer" ou "Monday-Friday" : gamme de jours
  const rangeMatch = lower.match(/^([a-z]+)\s*[-–]\s*([a-z]+)$/);
  if (rangeMatch) {
    const start = DAY_MAP[rangeMatch[1]];
    const end = DAY_MAP[rangeMatch[2]];
    if (start && end) {
      const si = WEEKDAYS.indexOf(start[0]);
      const ei = WEEKDAYS.indexOf(end[0]);
      for (let i = si; i <= ei; i++) out.add(WEEKDAYS[i]);
    }
  } else {
    const single = DAY_MAP[lower];
    if (single) single.forEach((d) => out.add(d));
  }

  return Array.from(out);
}

/**
 * Construit l'ensemble des schémas JSON-LD pour le site courant.
 * Retourne un tableau d'objets à sérialiser.
 */
export function buildSiteSchemas(site) {
  if (!site) return [];
  const geo = detectGeo(site.city);
  const baseUrl = `https://${site.subdomain}.medpage.site`;
  const schemas = [];

  const openingSpecs = parseOpeningHours(site.openingHours);

  // --- A. MedicalBusiness (priorité absolue, Google Local) ---
  const medicalBusiness = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${baseUrl}/#business`,
    name: site.cabinetName,
    url: baseUrl,
    description: site.bio || site.tagline || undefined,
    image: cloudinaryOptimized(site.profilePhotoUrl) || cloudinaryOptimized(site.coverPhotoUrl) || undefined,
    telephone: site.phone || undefined,
    priceRange: "$$",
    paymentAccepted: "Cash, Credit Card, Health Insurance",
  };

  if (site.specialty) medicalBusiness.medicalSpecialty = site.specialty;

  if (site.address || site.city) {
    medicalBusiness.address = {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressCountry: geo.addressCountry,
    };
    if (site.address) medicalBusiness.address.streetAddress = site.address;
  }

  // Horaires d'ouverture
  if (openingSpecs.length > 0) {
    medicalBusiness.openingHoursSpecification = openingSpecs;
  } else if (site.openingHours) {
    medicalBusiness.openingHours = site.openingHours;
  }

  // Offre de consultation (si renseignée)
  if (site.specialty) {
    medicalBusiness.makesOffer = {
      "@type": "Offer",
      itemOffered: {
        "@type": "MedicalProcedure",
        name: `Consultation ${site.specialty}`,
      },
    };
  }

  // AggregateRating conditionnel (uniquement si des témoignages avec notes existent)
  const rated = (site.testimonials || []).filter((t) => t && typeof t.rating === "number" && t.rating > 0);
  if (rated.length > 0) {
    const sum = rated.reduce((acc, t) => acc + t.rating, 0);
    medicalBusiness.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: (sum / rated.length).toFixed(1),
      reviewCount: rated.length,
      bestRating: "5",
      worstRating: "1",
    };
    // Reviews associées au MedicalBusiness
    medicalBusiness.review = rated.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.authorName || "Patient" },
      reviewBody: t.text || undefined,
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(t.rating),
        bestRating: "5",
        worstRating: "1",
      },
    }));
  }

  schemas.push(medicalBusiness);

  // --- B. Person (le praticien) ---
  if (site.doctorName) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.doctorName,
      jobTitle: site.specialty || undefined,
      worksFor: { "@id": `${baseUrl}/#business` },
      image: cloudinaryOptimized(site.profilePhotoUrl) || undefined,
      url: baseUrl,
    });
  }

  // --- C. WebSite ---
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: site.cabinetName,
    inLanguage: geo.hreflang,
  });

  // --- D. BreadcrumbList ---
  const specialtySlug = (site.specialty || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "MedPage",
        item: "https://medpage.site",
      },
      ...(specialtySlug
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: site.specialty,
              item: `https://medpage.site/${specialtySlug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: specialtySlug ? 3 : 2,
        name: `Dr. ${site.doctorName}`,
        item: baseUrl,
      },
    ],
  });

  // --- F+G sont fusionnés dans le MedicalBusiness ci-dessus ---

  // --- H. ReserveAction (prise de RDV) ---
  schemas.push({
    "@context": "https://schema.org",
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${baseUrl}/#contact`,
      actionAccessibilityRequirement: {
        "@type": "ActionAccessSpecification",
        availabilityStarts: "00:00",
        availabilityEnds: "23:59",
      },
    },
    result: {
      "@type": "Reservation",
      name: "Rendez-vous médical",
    },
  });

  return schemas;
}

export default function SiteSchemaOrg({ site }) {
  const schemas = buildSiteSchemas(site);
  if (schemas.length === 0) return null;

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
