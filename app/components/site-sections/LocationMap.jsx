// app/components/site-sections/LocationMap.jsx
import { MapPin, Clock, Navigation, ExternalLink } from "lucide-react";

/**
 * Transforme un lien Google Maps "classique" (partage, ou lien de fiche
 * établissement) en URL embarquable en iframe, quand c'est possible.
 */
function buildEmbedUrl(rawUrl) {
  if (!rawUrl) return null;
  try {
    if (rawUrl.includes("output=embed") || rawUrl.includes("/maps/embed") || rawUrl.includes("/maps/embed/v1/")) {
      return rawUrl;
    }
    if (rawUrl.includes("maps.app.goo.gl")) {
      return null;
    }
    const url = new URL(rawUrl);
    if (url.hostname.includes("google.com") || url.hostname.includes("maps.google.com")) {
      const placeMatch = rawUrl.match(/\/place\/([^\/]+)/);
      if (placeMatch) {
        const place = placeMatch[1];
        if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(place)}`;
        }
      }
      url.searchParams.set("output", "embed");
      return url.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export default function LocationMap({ site, accent }) {
  if (!site.mapUrl) return null;
  const embedUrl = buildEmbedUrl(site.mapUrl);

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-20 md:py-[120px]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span
          className="font-dm inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          Comment nous trouver
        </span>
        <h2 className="font-playfair text-3xl md:text-[40px] leading-tight font-bold text-slate-900">
          Notre localisation
        </h2>
        <p className="mt-4 text-slate-500 text-[15px]">
          Facilement accessible, en plein cœur de {site.city}.
        </p>
      </div>

      {/* Carte + bande info */}
      <div className="rounded-3xl overflow-hidden shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-slate-100 bg-white">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            width="100%"
            height="400"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Localisation de ${site.cabinetName}`}
          />
        ) : (
          <a
            href={site.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-[400px] bg-slate-50 text-slate-600 hover:bg-slate-100 transition flex-col"
          >
            <MapPin className="h-8 w-8" style={{ color: accent }} />
            <span className="font-medium">Voir sur Google Maps</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

        {/* Bande d'infos */}
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="flex items-center gap-3 p-6">
            <span
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accent}1A` }}
            >
              <MapPin className="h-5 w-5" style={{ color: accent }} />
            </span>
            <div>
              <p className="font-dm text-[11px] uppercase tracking-wider text-slate-500">Adresse</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{site.address || site.city}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-6">
            <span
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accent}1A` }}
            >
              <Clock className="h-5 w-5" style={{ color: accent }} />
            </span>
            <div>
              <p className="font-dm text-[11px] uppercase tracking-wider text-slate-500">Horaires</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{site.openingHours}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-6">
            <span
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accent}1A` }}
            >
              <Navigation className="h-5 w-5" style={{ color: accent }} />
            </span>
            <div>
              <p className="font-dm text-[11px] uppercase tracking-wider text-slate-500">Itinéraire</p>
              <a
                href={site.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold mt-0.5 inline-flex items-center gap-1"
                style={{ color: accent }}
              >
                Obtenir l'itinéraire
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
