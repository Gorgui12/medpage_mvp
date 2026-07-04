// app/components/site-sections/Testimonials.jsx
import { Star } from "lucide-react";

export default function Testimonials({ site, accent }) {
  if (!site.testimonials || site.testimonials.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-100">
      <h2
        className="text-xs font-semibold uppercase tracking-wider mb-3 text-center"
        style={{ color: accent }}
      >
        Témoignages
      </h2>
      <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">
        Ce que disent nos patients
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {site.testimonials.map((t, index) => (
          <div key={index} className="rounded-2xl border border-slate-100 p-6 bg-slate-50/50">
            <div className="flex items-center gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= t.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">"{t.text}"</p>
            <p className="text-sm font-semibold text-slate-800">{t.authorName}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
