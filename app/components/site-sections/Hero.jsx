// app/components/site-sections/Hero.jsx
import Image from "next/image";
import dynamic from "next/dynamic";
import { Phone, CalendarCheck } from "lucide-react";
import { cloudinaryOptimized } from "@/lib/cloudinaryImage";

const AnimatedCounter = dynamic(() => import("./AnimatedCounter"), {
  ssr: true,
});

const STATS = [
  { value: 15, suffix: "+", label: "ans d'expérience" },
  { value: 2000, suffix: "+", label: "patients suivis" },
  { value: 4.9, suffix: "/5", label: "satisfaction", decimal: true },
];

export default function Hero({ site, accent, geo }) {
  const phoneHref = `tel:${site.phone.replace(/\s+/g, "")}`;
  const isEnglish = geo?.lang === "en";
  const hasCover = Boolean(site.coverPhotoUrl);
  const hasProfile = Boolean(site.profilePhotoUrl);

  const bookingCta = isEnglish ? "Book appointment" : "Prendre rendez-vous";
  const callCta = isEnglish ? "Call the office" : "Appeler le cabinet";

  // Couper "Prénom Nom" sur deux lignes
  const nameParts = (site.doctorName || "").split(" ").filter(Boolean);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const coverSrc = cloudinaryOptimized(site.coverPhotoUrl);
  const profileSrc = cloudinaryOptimized(site.profilePhotoUrl);

  return (
    <section id="top" className="relative overflow-hidden">
      {/* --- Background décoratif --- */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 85% 8%, ${accent}10 0%, transparent 55%)`,
        }}
      />
      {/* Grid pattern léger */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Blur circles décoratifs */}
      <div
        className="absolute top-0 right-0 rounded-full pointer-events-none"
        style={{ width: 600, height: 600, backgroundColor: `${accent}0D`, filter: "blur(40px)" }}
      />
      <div
        className="absolute bottom-[-120px] left-[-120px] rounded-full pointer-events-none"
        style={{ width: 400, height: 400, backgroundColor: "#e2e8f0", opacity: 0.5, filter: "blur(60px)" }}
      />

      {/* — Image de couverture en arrière-plan si présente — */}
      {hasCover && (
        <div className="absolute inset-0">
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

      <div className="relative max-w-[1200px] mx-auto px-6 pt-14 pb-20 md:py-[120px] grid md:grid-cols-[55%_45%] gap-12 items-center">
        {/* --- Colonne gauche : texte --- */}
        <div className="text-center md:text-left">
          {/* Badge disponible */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200 shadow-sm mb-6">
            <span
              className="pulse-dot h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#16a34a" }}
            />
            <span className="text-xs font-semibold text-slate-700">
              {isEnglish ? "Available for consultations" : "Disponible pour consultations"}
            </span>
          </div>

          {/* Spécialité label */}
          <p
            className="font-dm text-[13px] font-semibold uppercase tracking-widest mb-4"
            style={{ color: accent }}
          >
            {site.specialty}
          </p>

          {/* H1 */}
          <h1 className="font-playfair text-[40px] leading-[1.1] md:text-[64px] font-bold tracking-tight md:leading-[1.05]">
            <span className="gradient-text block">Dr. {firstName}</span>
            {lastName && <span className="gradient-text block">{lastName}</span>}
          </h1>

          {/* Tagline */}
          {site.tagline ? (
            <p className="mt-6 text-lg md:text-xl text-slate-600 leading-[1.7] italic max-w-[480px] mx-auto md:mx-0">
              {site.tagline}
            </p>
          ) : (
            <p className="mt-6 text-lg text-slate-500 max-w-[480px] mx-auto md:mx-0">
              {isEnglish
                ? `${site.specialty} in ${site.city}. Book your appointment online today.`
                : `${site.specialty} à ${site.city}. Prenez rendez-vous en quelques clics.`}
            </p>
          )}

          {/* Stats row */}
          <div className="mt-10 flex items-stretch justify-center md:justify-start gap-0">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="flex items-stretch">
                {i > 0 && (
                  <div className="w-px bg-slate-200 mx-5 sm:mx-8 self-stretch" />
                )}
                <div className="text-center md:text-left">
                  <p className="font-playfair text-2xl md:text-3xl font-bold text-slate-900">
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      decimal={stat.decimal}
                    />
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={site.bookingUrl || "#contact"}
              target={site.bookingUrl ? "_blank" : undefined}
              rel={site.bookingUrl ? "noopener noreferrer" : undefined}
              className="cta-primary inline-flex items-center justify-center gap-2 px-8 h-14 rounded-xl text-white font-semibold text-base"
              style={{ boxShadow: `0 20px 25px -5px ${accent}66` }}
            >
              <CalendarCheck className="h-5 w-5" />
              {bookingCta}
            </a>
            <a
              href={phoneHref}
              className="inline-flex items-center justify-center gap-2 px-8 h-14 rounded-xl border font-semibold text-base text-slate-700 bg-white/60 transition-all duration-200 ease-out hover:bg-white hover:border-slate-300 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ borderColor: accent, color: accent }}
            >
              <Phone className="h-5 w-5" />
              {callCta}
            </a>
          </div>
        </div>

        {/* --- Colonne droite : visuel --- */}
        <div className="hidden md:flex items-center justify-center">
          {hasProfile && (
            <HeroVisual site={site} profileSrc={profileSrc} accent={accent} />
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Visuel hero : cercle photo avec anneau rotatif + cartes flottantes.
 * Toute l'interactivité / les animations sont en CSS pur.
 */
function HeroVisual({ site, profileSrc, accent }) {
  return (
    <div className="relative w-[420px] h-[420px]">
      {/* Blob en arrière-plan */}
      <div
        className="absolute inset-8 rounded-full"
        style={{ backgroundColor: `${accent}1A`, filter: "blur(8px)" }}
      />
      {/* Anneau rotatif */}
      <div
        className="ring-spin absolute -inset-2 rounded-full"
        style={{ border: `2px dashed ${accent}40` }}
      />
      {/* Photo */}
      <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-white shadow-2xl">
        <Image
          src={profileSrc}
          alt={`Dr. ${site.doctorName} - ${site.specialty} à ${site.city}`}
          fill
          priority
          sizes="420px"
          className="object-cover"
        />
      </div>

      {/* Cartes flottantes */}
      <div className="floating-card absolute top-6 -left-10 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur shadow-lg">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#16a34a" }} />
        <span className="text-sm font-semibold text-slate-800">RDV confirmé</span>
      </div>
      <div className="floating-card absolute bottom-10 -right-8 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur shadow-lg">
        <div className="flex items-center gap-1 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.077 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ))}
        </div>
        <span className="text-xs font-semibold text-slate-700 mt-1 block">4.9 ★ 127 avis</span>
      </div>
    </div>
  );
}
