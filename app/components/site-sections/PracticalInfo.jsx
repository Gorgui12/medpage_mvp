// app/components/site-sections/PracticalInfo.jsx
import { MapPin, Clock, Phone } from "lucide-react";

export default function PracticalInfo({ site, accent }) {
  const phoneHref = `tel:${site.phone.replace(/\s+/g, "")}`;

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-100">
      <div className="grid sm:grid-cols-3 gap-4">
        <InfoCard
          icon={<MapPin className="h-5 w-5" style={{ color: accent }} />}
          title="Adresse"
          value={site.address || site.city}
        />
        <InfoCard
          icon={<Clock className="h-5 w-5" style={{ color: accent }} />}
          title="Horaires"
          value={site.openingHours}
        />
        <InfoCard
          icon={<Phone className="h-5 w-5" style={{ color: accent }} />}
          title="Téléphone"
          value={site.phone}
          href={phoneHref}
        />
      </div>
    </section>
  );
}

function InfoCard({ icon, title, value, href }) {
  const content = (
    <div className="rounded-2xl border border-slate-100 p-5 h-full hover:border-slate-200 transition bg-slate-50/50">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );

  return href ? <a href={href}>{content}</a> : content;
}
