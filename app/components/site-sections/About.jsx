// app/components/site-sections/About.jsx
export default function About({ site, accent }) {
  if (!site.bio && !site.profilePhotoUrl) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-100">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
        {site.profilePhotoUrl && (
          <img
            src={site.profilePhotoUrl}
            alt={`Dr. ${site.doctorName}`}
            className="h-32 w-32 sm:h-40 sm:w-40 rounded-2xl object-cover shrink-0 border border-slate-100"
          />
        )}

        <div className="text-center sm:text-left">
          <h2
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: accent }}
          >
            À propos
          </h2>
          {site.bio ? (
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {site.bio}
            </p>
          ) : (
            <p className="text-slate-400 italic">
              Dr. {site.doctorName}, {site.specialty} à {site.city}.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
