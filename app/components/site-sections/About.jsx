// app/components/site-sections/About.jsx
import Image from "next/image";
import { cloudinaryOptimized } from "@/lib/cloudinaryImage";

export default function About({ site, accent, geo }) {
  if (!site.bio && !site.profilePhotoUrl) return null;
  const isEnglish = geo?.lang === "en";
  const profileSrc = cloudinaryOptimized(site.profilePhotoUrl);

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-100">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
        {site.profilePhotoUrl && (
          <div className="relative h-32 w-32 sm:h-40 sm:w-40 shrink-0">
            <Image
              src={profileSrc}
              alt={`Dr. ${site.doctorName} - ${site.specialty} à ${site.city}`}
              fill
              sizes="(max-width: 640px) 128px, 160px"
              className="rounded-2xl object-cover border border-slate-100"
            />
          </div>
        )}

        <div className="text-center sm:text-left">
          <h2
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: accent }}
          >
            {isEnglish ? "About" : "À propos"}
          </h2>
          {site.bio ? (
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {site.bio}
            </p>
          ) : (
            <p className="text-slate-400 italic">
              {isEnglish
                ? `Dr. ${site.doctorName}, ${site.specialty} in ${site.city}.`
                : `Dr. ${site.doctorName}, ${site.specialty} à ${site.city}.`}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
