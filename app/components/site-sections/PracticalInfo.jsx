// app/components/site-sections/PracticalInfo.jsx
import { MapPin, Clock, Phone, ExternalLink } from "lucide-react";

function InfoCard({ icon, title, value, href, children, accent }) {
  const body = (
    <div className="group bg-white rounded-[20px] p-8 border border-slate-100 h-full transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
      <span
        className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${accent}1A` }}
      >
        {icon}
      </span>
      <p className="font-dm text-xs uppercase tracking-wider font-semibold" style={{ color: accent }}>
        {title}
      </p>
      {children || <p className="mt-2 text-[16px] font-semibold text-slate-800 leading-relaxed">{value}</p>}
    </div>
  );

  return href ? (
    <a href={href} className="block h-full">
      {body}
    </a>
  ) : (
    <div className="h-full">{body}</div>
  );
}

export default function PracticalInfo({ site, accent }) {
  const phoneHref = `tel:${site.phone.replace(/\s+/g, "")}`;

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-20 md:py-[120px]">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoCard
          accent={accent}
          icon={<MapPin className="h-5 w-5" style={{ color: accent }} />}
          title="Adresse"
          value={site.address || site.city}
        />
        <InfoCard
          accent={accent}
          icon={<Clock className="h-5 w-5" style={{ color: accent }} />}
          title="Horaires"
          value={site.openingHours}
        />
        <InfoCard
          accent={accent}
          icon={<Phone className="h-5 w-5" style={{ color: accent }} />}
          title="Téléphone"
          href={phoneHref}
        >
          <p className="mt-2 text-[16px] font-semibold text-slate-800 leading-relaxed">{site.phone}</p>
          <p className="mt-1 text-xs text-slate-400 inline-flex items-center gap-1">
            Appeler maintenant
            <ExternalLink className="h-3 w-3" />
          </p>
        </InfoCard>
      </div>
    </section>
  );
}
