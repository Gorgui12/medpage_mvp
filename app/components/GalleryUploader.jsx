// app/components/GalleryUploader.jsx
"use client";

import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X } from "lucide-react";

const MAX_PHOTOS = 8;

/**
 * Gère une galerie de plusieurs photos (jusqu'à MAX_PHOTOS).
 * value    : tableau d'URLs actuelles
 * onChange : callback(newArray) appelé à chaque ajout/suppression
 */
export default function GalleryUploader({ value = [], onChange }) {
  const remainingSlots = MAX_PHOTOS - value.length;

  function removePhoto(index) {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        Galerie photos du cabinet
      </label>
      <p className="text-xs text-slate-400 mb-3">
        {value.length} / {MAX_PHOTOS} photos
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {value.map((url, index) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
            <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
              aria-label="Retirer cette photo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {remainingSlots > 0 && (
          <CldUploadWidget
            signatureEndpoint="/api/upload-signature"
            options={{
              maxFiles: remainingSlots,
              sources: ["local", "camera"],
              multiple: true,
              maxFileSize: 5_000_000,
              clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
            }}
            onSuccess={(result) => {
              const url = result?.info?.secure_url;
              if (url) onChange([...value, url]);
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[11px] font-medium">Ajouter</span>
              </button>
            )}
          </CldUploadWidget>
        )}
      </div>
    </div>
  );
}
