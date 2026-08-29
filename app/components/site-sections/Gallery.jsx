// app/components/site-sections/Gallery.jsx
import Image from "next/image";
import { cloudinaryOptimized } from "@/lib/cloudinaryImage";

export default function Gallery({ site, accent }) {
  if (!site.galleryPhotos || site.galleryPhotos.length === 0) return null;

  const photos = site.galleryPhotos.map((url) => cloudinaryOptimized(url));

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
        {photos.map((url, index) => (
          // Lightbox 100% CSS : chaque vignette est un <a> vers une ancre
          // qui affiche l'image en plein écran, sans JS ni librairie externe.
          <a
            key={url}
            href={`#photo-${index}`}
            className="relative block aspect-square rounded-xl overflow-hidden group"
          >
            <Image
              src={url}
              alt={`Dr. ${site.doctorName} - ${site.specialty} à ${site.city} : photo ${index + 1} du cabinet`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw"
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          </a>
        ))}
      </div>

      {/* Overlays plein écran, ciblés via :target (CSS pur, pas de JS) */}
      {photos.map((url, index) => (
        <a
          key={`overlay-${url}`}
          href="#"
          id={`photo-${index}`}
          className="fixed inset-0 z-50 bg-black/90 items-center justify-center p-6 hidden target:flex"
        >
          <Image
            src={url}
            alt={`Dr. ${site.doctorName} - ${site.specialty} à ${site.city} : photo ${index + 1} en grand`}
            width={1000}
            height={750}
            sizes="(max-width: 1000px) 100vw, 1000px"
            className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
          />
        </a>
      ))}
    </section>
  );
}
