// app/components/site-sections/Gallery.jsx
export default function Gallery({ site, accent }) {
  if (!site.galleryPhotos || site.galleryPhotos.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-100">
      <h2
        className="text-xs font-semibold uppercase tracking-wider mb-3 text-center"
        style={{ color: accent }}
      >
        Galerie
      </h2>
      <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">
        Découvrez notre cabinet
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {site.galleryPhotos.map((url, index) => (
          // Lightbox 100% CSS : chaque vignette est un <a> vers une ancre
          // qui affiche l'image en plein écran, sans JS ni librairie externe.
          <a key={url} href={`#photo-${index}`} className="block aspect-square rounded-xl overflow-hidden group">
            <img
              src={url}
              alt={`Photo du cabinet ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          </a>
        ))}
      </div>

      {/* Overlays plein écran, ciblés via :target (CSS pur, pas de JS) */}
      {site.galleryPhotos.map((url, index) => (
        <a
          key={`overlay-${url}`}
          href="#"
          id={`photo-${index}`}
          className="fixed inset-0 z-50 bg-black/90 items-center justify-center p-6 hidden target:flex"
        >
          <img
            src={url}
            alt={`Photo du cabinet ${index + 1} en grand`}
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        </a>
      ))}
    </section>
  );
}
