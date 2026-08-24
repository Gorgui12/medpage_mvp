// app/components/site-sections/LocationMap.jsx
import { MapPin, ExternalLink } from "lucide-react";

/**
 * Transforme un lien Google Maps "classique" (partage, ou lien de fiche
 * établissement) en URL embarquable en iframe, quand c'est possible.
 *
 * Deux cas gérés :
 * 1. Le médecin a collé un lien d'intégration officiel (contient déjà
 *    "output=embed" ou "/maps/embed") -> on l'utilise directement.
 * 2. Le médecin a collé un lien de partage classique (maps.app.goo.gl,
 *    google.com/maps/place/...) -> on le transforme en ajoutant
 *    "&output=embed", qui fonctionne dans la plupart des cas avec le
 *    point de terminaison public historique de Google Maps.
 *
 * Si la transformation échoue ou semble invalide, on retombe sur un simple
 * lien "Voir sur Google Maps" plutôt que d'afficher un iframe cassé.
 */
function buildEmbedUrl(rawUrl) {
  if (!rawUrl) return null;

  try {
    // Cas 1 : déjà un lien d'intégration
    if (rawUrl.includes("output=embed") || rawUrl.includes("/maps/embed") || rawUrl.includes("/maps/embed/v1/")) {
      return rawUrl;
    }

    // Cas 2 : lien court Google (maps.app.goo.gl) -> on ne peut pas transformer, on utilise le fallback
    if (rawUrl.includes("maps.app.goo.gl")) {
      return null;
    }

    // Cas 3 : lien classique -> on tente d'ajouter output=embed
    const url = new URL(rawUrl);
    
    // Pour les liens Google Maps classiques, on utilise le format d'embed API
    if (url.hostname.includes("google.com") || url.hostname.includes("maps.google.com")) {
      // Extraire le lieu de l'URL et le convertir en format embed
      const placeMatch = rawUrl.match(/\/place\/([^\/]+)/);
      if (placeMatch) {
        const place = placeMatch[1];
        return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(place)}`;
      }
      
      // Alternative : utiliser le mode embed direct
      url.searchParams.set("output", "embed");
      return url.toString();
    }
    
    return null; // Format non supporté
  } catch {
    return null; // URL malformée, on ne tente pas l'iframe
  }
}

export default function LocationMap({ site, accent }) {
  if (!site.mapUrl) return null;

  const embedUrl = buildEmbedUrl(site.mapUrl);

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-100">
      <h2
        className="text-xs font-semibold uppercase tracking-wider mb-3 text-center"
        style={{ color: accent }}
      >
        Comment nous trouver
      </h2>
      <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">
        Notre localisation
      </h3>

      {embedUrl ? (
        <div className="rounded-2xl overflow-hidden border border-slate-100">
          <iframe
            src={embedUrl}
            width="100%"
            height="350"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Localisation de ${site.cabinetName}`}
          />
        </div>
      ) : (
        // Fallback si jamais l'URL fournie ne peut pas être intégrée
        <a
          href={site.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-10 rounded-2xl border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
        >
          <MapPin className="h-5 w-5" style={{ color: accent }} />
          Voir sur Google Maps
          <ExternalLink className="h-4 w-4" />
        </a>
      )}

      <div className="text-center mt-4">
        <a
          href={site.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          Obtenir l'itinéraire
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
