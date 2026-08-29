// lib/geoDetect.js
//
// Détection automatique du pays et de la langue à partir de la ville du site
// client. Utilisé à la fois par generateMetadata() (hreflang, geo tags,
// locale Open Graph) et par les schémas schema.org (adresse, langue).
//
// Retourne un objet avec :
//   country        : "US" | "CA" | "FR"
//   lang           : "en" | "fr"
//   hreflang       : "en-US" | "en-CA" | "fr-CA" | "fr-FR"
//   locale         : locale BCP-47 pour Open Graph (en_US, fr_FR, ...)
//   addressCountry : code pays pour schema.org PostalAddress
//   currencyCode   : devise (USD, CAD, EUR)
//   dateFormat     : format de date lisible par la région
//   primaryLocale  : langue principale ("fr" ou "en")

// Villes connues des USA. La détection se fait sur une normalisation
// (minuscules, suppression des accents) dans detectGeo().
const US_CITIES = [
  "new york", "los angeles", "chicago", "houston", "phoenix", "philadelphia",
  "san antonio", "san diego", "dallas", "austin", "san jose", "jacksonville",
  "fort worth", "columbus", "charlotte", "indianapolis", "san francisco",
  "seattle", "denver", "washington", "boston", "nashville", "detroit",
  "portland", "las vegas", "miami", "atlanta", "orlando", "baltimore",
  "milwaukee", "minneapolis", "memphis", "new orleans", "cleveland",
  "sacramento", "kansas city", "tampa", "pittsburgh", "cincinnati",
  "st. louis", "st louis", "salt lake city", "san juan", "san bernardino",
  "brooklyn", "queens", "bronx", "staten island", "manhattan", "bronxville",
];

// Villes connues du Canada, avec leur langue principale.
// Montréal et Québec -> français ; le reste -> anglais.
const CA_CITIES_FR = ["montréal", "montreal", "quebec", "québec", "laval", "gatineau"];
const CA_CITIES_EN = [
  "toronto", "vancouver", "calgary", "edmonton", "ottawa", "winnipeg",
  "hamilton", "mississauga", "brampton", "surrey", "halifax", "victoria",
  "saskatoon", "regina", "london", "kitchener", "windsor", "oakville",
  "burlington", "richmond", "burnaby", "coquitlam", "saskatoon",
];

// Normalise une string pour la comparaison : minuscules + suppression accents.
function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 .'-]/g, "")
    .trim();
}

/**
 * Détecte le pays / la langue / les préférences locales à partir de la ville.
 * Se replie par défaut sur la France (marché principal de MedPage).
 */
export function detectGeo(city) {
  const norm = normalize(city);

  // 1. USA
  if (US_CITIES.some((c) => norm.includes(c))) {
    return {
      country: "US",
      lang: "en",
      hreflang: "en-US",
      locale: "en_US",
      addressCountry: "US",
      currencyCode: "USD",
      dateFormat: "MM/DD/YYYY",
      primaryLocale: "en",
    };
  }

  // 2. Canada
  if (CA_CITIES_FR.some((c) => norm.includes(c))) {
    return {
      country: "CA",
      lang: "fr",
      hreflang: "fr-CA",
      locale: "fr_CA",
      addressCountry: "CA",
      currencyCode: "CAD",
      dateFormat: "YYYY-MM-DD",
      primaryLocale: "fr",
    };
  }
  if (CA_CITIES_EN.some((c) => norm.includes(c))) {
    return {
      country: "CA",
      lang: "en",
      hreflang: "en-CA",
      locale: "en_CA",
      addressCountry: "CA",
      currencyCode: "CAD",
      dateFormat: "YYYY-MM-DD",
      primaryLocale: "en",
    };
  }

  // 3. Par défaut : France
  return {
    country: "FR",
    lang: "fr",
    hreflang: "fr-FR",
    locale: "fr_FR",
    addressCountry: "FR",
    currencyCode: "EUR",
    dateFormat: "DD/MM/YYYY",
    primaryLocale: "fr",
  };
}
