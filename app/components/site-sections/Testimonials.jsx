// app/components/site-sections/Testimonials.jsx
import { Quote } from "lucide-react";

function Stars({ rating, size = 18 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          className={star <= Math.round(rating) ? "fill-amber-500" : "fill-slate-200"}
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.077 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export default function Testimonials({ site, accent }) {
  if (!site.testimonials || site.testimonials.length === 0) return null;

  const t = site.testimonials;
  const total = t.length;
  const avg = (t.reduce((sum, item) => sum + (item.rating || 5), 0) / total).toFixed(1);
  // La note moyenne (le mieux noté / premier) est "featured"
  const featuredIndex = t.findIndex((item) => (item.rating || 0) >= 5);
  const featured = (featuredIndex >= 0 ? featuredIndex : 0);
  const featuredIsGolden = t[featured].rating >= 5;

  return (
    <section id="testimonials" className="max-w-[1200px] mx-auto px-6 py-20 md:py-[120px]">
      {/* Header + note globale */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <span
          className="font-dm inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          Témoignages
        </span>
        <h2 className="font-playfair text-3xl md:text-[40px] leading-tight font-bold text-slate-900">
          Ce que disent nos patients
        </h2>
      </div>

      {/* Note globale */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
        <span className="font-playfair text-5xl font-bold text-slate-900">{avg}</span>
        <div className="flex flex-col items-center sm:items-start gap-1">
          <Stars rating={avg} size={20} />
          <span className="text-sm text-slate-500">
            basé sur {total} avis {total > 1 ? "patients" : "patient"}
          </span>
        </div>
      </div>

      {/* Grille desktop / scroll-snap mobile */}
      <div className="grid md:grid-cols-3 gap-6 snap-scroll md:snap-none overflow-x-auto md:overflow-visible -mx-6 px-6 md:mx-0 md:px-0">
        {t.map((item, index) => {
          const isFeatured = featuredIsGolden && index === featured;
          return (
            <article
              key={index}
              className={`relative snap-center shrink-0 w-[80vw] sm:w-[60vw] md:w-auto md:shrink flex-1 flex flex-col bg-white rounded-3xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] transition-shadow duration-200 ease-out hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] ${
                isFeatured ? "ring-2" : "border border-slate-100"
              }`}
              style={isFeatured ? { boxShadow: `0 20px 40px -10px ${accent}40` } : undefined}
            >
              {isFeatured && (
                <span
                  className="absolute -top-3 right-6 text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: accent }}
                >
                  Avis mis en avant
                </span>
              )}

              {/* Guillemets géants */}
              <Quote
                className="absolute top-6 right-6 h-20 w-20 pointer-events-none"
                style={{ color: `${accent}1A` }}
              />

              <Stars rating={item.rating || 5} />
              <p className="font-playfair italic text-[17px] leading-[1.8] text-slate-700 mt-4 flex-1 line-clamp-4">
                « {item.text} »
              </p>

              {/* Auteur */}
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3">
                <span
                  className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ backgroundColor: accent }}
                >
                  {initials(item.authorName)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.authorName}</p>
                  <p className="text-xs text-slate-500">Patient vérifié ✓</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
