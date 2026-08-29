// app/components/site-sections/About.jsx
import { Check } from "lucide-react";
import { cloudinaryOptimized } from "@/lib/cloudinaryImage";

export default function About({ site, accent, geo }) {
  if (!site.bio && !site.profilePhotoUrl) return null;
  const isEnglish = geo?.lang === "en";
  const profileSrc = cloudinaryOptimized(site.profilePhotoUrl);
  const hasPhoto = Boolean(profileSrc);

  const highlights = isEnglish
    ? ["State-certified", "Personalized approach", "Attentive listening", "Modern facilities"]
    : ["Diplômé d'État", "Approche personnalisée", "Écoute attentive", "Plateau technique moderne"];

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-20 md:py-[120px]">
      <div className="grid md:grid-cols-[45%_55%] gap-12 md:gap-20 items-center">
        {/* --- Côté photo --- */}
        {hasPhoto && (
          <div className="relative max-w-md mx-auto md:mx-0 w-full">
            {/* Rectangle décoratif décalé */}
            <div
              className="absolute -inset-4 rounded-[32px] -translate-x-2 translate-y-2"
              style={{ backgroundColor: `${accent}26` }}
            />
            {/* Dots pattern */}
            <div
              className="absolute -top-6 -right-6 h-20 w-20 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle, ${accent} 2px, transparent 2px)`,
                backgroundSize: "12px 12px",
              }}
            />
            <div className="relative rounded-[32px] overflow-hidden shadow-xl">
              <img
                src={profileSrc}
                alt={`Dr. ${site.doctorName} - ${site.specialty} à ${site.city}`}
                loading="lazy"
                className="w-full h-auto object-cover aspect-[4/5]"
              />
            </div>
            {/* Badge flottant glassmorphism */}
            <div className="absolute left-4 bottom-4 right-4 sm:-bottom-6 sm:left-6 sm:right-auto px-5 py-4 rounded-2xl bg-white/85 backdrop-blur-xl shadow-xl border border-white/60">
              <p className="font-playfair font-bold text-slate-900">Dr. {site.doctorName}</p>
              <p className="text-sm text-slate-500" style={{ color: accent }}>
                {site.specialty}
              </p>
            </div>
          </div>
        )}

        {/* --- Côté texte --- */}
        <div className="text-center md:text-left">
          <span
            className="font-dm inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: `${accent}1A`, color: accent }}
          >
            {isEnglish ? "About" : "À propos"}
          </span>

          <h2 className="font-playfair text-3xl md:text-[40px] leading-tight font-bold text-slate-900">
            {isEnglish ? (
              <>
                Your health,
                <br />
                <span className="gradient-text">our priority</span>
              </>
            ) : (
              <>
                Votre santé,
                <br />
                <span className="gradient-text">notre priorité</span>
              </>
            )}
          </h2>

          {site.bio ? (
            <p className="mt-6 text-[17px] leading-[1.8] text-slate-600 whitespace-pre-line">
              {site.bio}
            </p>
          ) : (
            <p className="mt-6 text-[17px] leading-[1.8] text-slate-500">
              {isEnglish
                ? `Dr. ${site.doctorName}, ${site.specialty.toLowerCase()} in ${site.city}, places you at the heart of every decision. Experience, listening and a personalized approach.`
                : `Dr. ${site.doctorName}, ${site.specialty.toLowerCase()} à ${site.city}, place le patient au cœur de chaque décision. Expérience, écoute et approche personnalisée.`}
            </p>
          )}

          {/* Points forts */}
          <ul className="mt-8 grid sm:grid-cols-2 gap-3 text-left">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[15px] text-slate-700">
                <span
                  className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${accent}1A` }}
                >
                  <Check className="h-3.5 w-3.5" style={{ color: accent }} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
