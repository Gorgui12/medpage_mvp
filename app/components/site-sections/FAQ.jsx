// app/components/site-sections/FAQ.jsx
export default function FAQ({ site, accent }) {
  if (!site.faq || site.faq.length === 0) return null;

  // Données structurées Schema.org : permet à Google d'afficher la FAQ
  // directement dans les résultats de recherche (rich snippets).
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: site.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-16 border-t border-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2
        className="text-xs font-semibold uppercase tracking-wider mb-3 text-center"
        style={{ color: accent }}
      >
        Questions fréquentes
      </h2>
      <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">
        Vous vous demandez peut-être...
      </h3>

      <div className="space-y-3">
        {site.faq.map((item, index) => (
          // <details>/<summary> natif HTML : accordéon accessible sans JS
          <details
            key={index}
            className="group rounded-xl border border-slate-100 px-5 py-4 open:border-slate-200"
          >
            <summary className="flex items-center justify-between cursor-pointer font-medium text-slate-800 list-none">
              {item.question}
              <span className="text-slate-400 group-open:rotate-45 transition shrink-0 ml-3">+</span>
            </summary>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
