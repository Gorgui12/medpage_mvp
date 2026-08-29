// app/components/site-sections/Gallery.jsx
import Image from "next/image";
import { ZoomIn, X } from "lucide-react";
import { cloudinaryOptimized } from "@/lib/cloudinaryImage";

export default function Gallery({ site, accent }) {
  if (!site.galleryPhotos || site.galleryPhotos.length < 3) return null;

  const photos = site.galleryPhotos.map((url) => cloudinaryOptimized(url));

  return (
    <section id="gallery" className="max-w-[1200px] mx-auto px-6 py-20 md:py-[120px]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span
          className="font-dm inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          Galerie
        </span>
        <h2 className="font-playfair text-3xl md:text-[40px] leading-tight font-bold text-slate-900">
          Découvrez notre cabinet
        </h2>
        <p className="mt-4 text-slate-500 text-[15px]">
          Un environnement moderne et chaleureux, pensé pour votre bien-être.
        </p>
      </div>

      {/* Masonry (column-count CSS pur) */}
      <div className="masonry">
        {photos.map((url, index) => (
          <a
            key={url}
            href={`#photo-${index}`}
            className="masonry-item group relative block rounded-2xl overflow-hidden cursor-zoom-in"
          >
            <Image
              src={url}
              alt={`Dr. ${site.doctorName} - ${site.specialty} à ${site.city} : photo ${index + 1} du cabinet`}
              width={800}
              height={600}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-auto object-cover transition-transform duration-[400ms] group-hover:scale-[1.03]"
            />
            {/* Overlay au hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
              <span
                className="inline-flex items-center gap-2 text-white text-sm font-medium"
              >
                <ZoomIn className="h-4 w-4" />
                Voir en grand
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* --- Lightbox CSS pur : overlay ciblé via :target --- */}
      {photos.map((url, index) => (
        <div
          key={`overlay-${url}`}
          id={`photo-${index}`}
          className="fixed inset-0 z-50 hidden target:flex items-center justify-center p-6 bg-black/95 backdrop-blur"
        >
          <a
            href="#gallery"
            className="absolute top-5 right-5 h-11 w-11 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center transition"
            aria-label="Fermer la photo"
          >
            <X className="h-5 w-5 text-white" />
          </a>
          <Image
            src={url}
            alt={`Dr. ${site.doctorName} - ${site.specialty} à ${site.city} : photo ${index + 1} en grand`}
            width={1200}
            height={900}
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="max-h-[90vh] max-w-full w-auto h-auto object-contain rounded-lg"
          />
        </div>
      ))}
    </section>
  );
}
