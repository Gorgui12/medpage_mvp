// app/components/site-sections/FAQ.jsx
import { ChevronDown } from "lucide-react";

export default function FAQ({ site, accent }) {
  if (!site.faq || site.faq.length === 0) return null;

  // Données structurées Schema.org : Google affiche la FAQ dans les résultats
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: site.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-20 md:py-[120px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span
          className="font-dm inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          Questions fréquentes
        </span>
        <h2 className="font-playfair text-3xl md:text-[40px] leading-tight font-bold text-slate-900">
          Vous vous demandez peut-être...
        </h2>
        <p className="mt-4 text-slate-500 text-[15px]">
          Les réponses aux questions que l'on nous pose le plus souvent.
        </p>
      </div>

      <div>
        {site.faq.map((item, index) => (
          <details
            key={index}
            className="group border-b border-slate-200 first:border-t"
            open={index === 0}
          >
            <summary className="list-none flex items-center justify-between gap-4 cursor-pointer py-6 pr-2">
              <span className="faq-question text-[17px] font-semibold text-slate-800">
                {item.question}
              </span>
              <span
                className="faq-chevron h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
                style={{ color: accent }}
              >
                <ChevronDown className="h-5 w-5" />
              </span>
            </summary>
            <p className="text-[16px] text-slate-600 leading-[1.8] pb-6 max-w-2xl">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
