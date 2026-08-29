// app/components/site-sections/Hero.jsx
import Image from "next/image";
import { Phone, CalendarCheck } from "lucide-react";
import { cloudinaryOptimized } from "@/lib/cloudinaryImage";

export default function Hero({ site, accent, geo }) {
  const phoneHref = `tel:${site.phone.replace(/\s+/g, "")}`;
  const hasCover = Boolean(site.coverPhotoUrl);
  const isEnglish = geo?.lang === "en";

  // Texte CTA localisé selon le pays détecté
  const bookingCta = isEnglish ? "Book appointment" : "Prendre rendez-vous";
  const callCta = isEnglish ? "Call the office" : "Appeler le cabinet";
  const fallbackLine = isEnglish
    ? `${site.specialty} in ${site.city}. Book your appointment online today.`
    : `${site.specialty} à ${site.city}. Prenez rendez-vous en quelques clics.`;

  const coverSrc = cloudinaryOptimized(site.coverPhotoUrl);

  return (
    <section className="relative">
      {hasCover && (
        <div className="absolute inset-0 h-full">
          <Image
            src={coverSrc}
            alt={`Cabinet ${site.cabinetName} - ${site.specialty} à ${site.city}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/85" />
        </div>
      )}

      <div className="relative max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center">
        <p
          className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-5"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          {site.specialty}
        </p>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-3">
          Dr. {site.doctorName}
        </h1>

        {site.tagline ? (
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 font-medium">
            {site.tagline}
          </p>
        ) : (
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto mb-10">
            {fallbackLine}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={site.bookingUrl || "#contact"}
            target={site.bookingUrl ? "_blank" : undefined}
            rel={site.bookingUrl ? "noopener noreferrer" : undefined}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl text-white font-semibold text-base shadow-lg shadow-slate-200 transition hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: accent }}
          >
            <CalendarCheck className="h-5 w-5" />
            {bookingCta}
          </a>

          <a
            href={phoneHref}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-base transition hover:bg-slate-50"
          >
            <Phone className="h-5 w-5" />
            {callCta}
          </a>
        </div>
      </div>
    </section>
  );
}
