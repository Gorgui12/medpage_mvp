// app/components/site-sections/Services.jsx
import { Stethoscope } from "lucide-react";

export default function Services({ site, accent }) {
  if (!site.services || site.services.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-100">
      <h2
        className="text-xs font-semibold uppercase tracking-wider mb-3 text-center"
        style={{ color: accent }}
      >
        Nos services
      </h2>
      <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">
        Ce que nous proposons
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {site.services.map((service, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-100 p-6 hover:border-slate-200 transition"
          >
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${accent}1A` }}
            >
              <Stethoscope className="h-5 w-5" style={{ color: accent }} />
            </div>
            <h4 className="font-semibold text-slate-900 mb-1.5">{service.title}</h4>
            {service.description && (
              <p className="text-sm text-slate-500 leading-relaxed">
                {service.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
