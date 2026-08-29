// app/components/site-sections/Services.jsx
import { Stethoscope } from "lucide-react";

const GENERIC_SERVICES = [
  { title: "Consultation", description: "Examen médical complet et personnalisé dans un cadre accueillant." },
  { title: "Suivi médical", description: "Accompagnement régulier et prévention adaptée à vos besoins." },
  { title: "Certificats médicaux", description: "Rédaction de certificats et documents médicaux requis." },
];

const SPECIALTY_SERVICES = {
  dentiste: [
    { title: "Détartrage", description: "Nettoyage professionnel et prévention des caries." },
    { title: "Blanchiment", description: "Éclaircissement dentaire personnalisé, résultat visible immédiat." },
    { title: "Implantologie", description: "Pose d'implants dentaires par chirurgie assistée." },
  ],
  ophtalmologue: [
    { title: "Examen de la vue", description: "Bilan visuel complet et dépistage des pathologies oculaires." },
    { title: "Chirurgie de la cataracte", description: "Prise en charge moderne de la cataracte." },
    { title: "Dépistage glaucome", description: "Contrôle de la pression oculaire et suivi personnalisé." },
  ],
  dermatologue: [
    { title: "Dépistage du mélanome", description: "Examen de la peau et surveillance des grains de beauté." },
    { title: "Traitement de l'acné", description: "Protocole thérapeutique adapté à chaque type de peau." },
    { title: "Esthétique médicale", description: "Injections, lasers et médecine esthétique non invasive." },
  ],
  generaliste: GENERIC_SERVICES,
};

function detectServices(site) {
  if (site.services && site.services.length > 0) return site.services;
  const specialty = site.specialty?.toLowerCase() || "";
  for (const [key, list] of Object.entries(SPECIALTY_SERVICES)) {
    if (specialty.includes(key)) return list;
  }
  return GENERIC_SERVICES;
}

export default function Services({ site, accent }) {
  const services = detectServices(site);
  const hasCustom = site.services && site.services.length > 0;

  // Pas de section vide : on affiche toujours une grille (générique si besoin)
  return (
    <section id="services" className="max-w-[1200px] mx-auto px-6 py-20 md:py-[120px]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span
          className="font-dm inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          Nos services
        </span>
        <h2 className="font-playfair text-3xl md:text-[40px] leading-tight font-bold text-slate-900">
          Ce que nous proposons
        </h2>
        {hasCustom ? (
          <p className="mt-4 text-slate-500 text-[15px]">
            Des soins complets, pensés pour votre santé et votre confort.
          </p>
        ) : (
          <p className="mt-4 text-slate-500 text-[15px]">
            Une prise en charge complète pour votre santé et votre bien-être au quotidien.
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="service-card group relative bg-white rounded-2xl p-7 min-h-[220px] overflow-hidden border border-slate-100 transition-all duration-200 ease-out hover:-translate-y-2 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]"
          >
            {/* Numéro en grand en arrière-plan */}
            <span
              className="absolute -top-3 right-4 font-playfair text-[80px] leading-none font-bold pointer-events-none select-none"
              style={{ color: `${accent}14` }}
            >
              0{index + 1}
            </span>

            {/* Icône */}
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-200 group-hover:opacity-90"
              style={{ backgroundColor: `${accent}26` }}
            >
              <Stethoscope className="h-7 w-7" style={{ color: accent }} />
            </div>

            <h3 className="font-playfair text-xl font-semibold text-slate-900 mb-2">
              {service.title}
            </h3>
            {service.description && (
              <p className="text-[15px] text-slate-500 leading-[1.7]">
                {service.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
