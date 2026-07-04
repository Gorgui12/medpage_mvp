// app/components/ImageUploader.jsx
"use client";

import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useState } from "react";

/**
 * Composant d'upload réutilisable pour une SEULE image (photo de profil,
 * photo de couverture). Affiche un aperçu une fois l'image envoyée,
 * avec un bouton pour la retirer.
 *
 * value    : URL actuelle de l'image (ou "")
 * onChange : callback(url) appelé avec la nouvelle URL après upload, ou ""
 *            quand l'utilisateur retire l'image.
 */
export default function ImageUploader({ value, onChange, label, aspect = "square" }) {
  const [isUploading, setIsUploading] = useState(false);

  const aspectClass = aspect === "wide" ? "aspect-[16/9]" : "aspect-square";

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      {value ? (
        // --- Aperçu de l'image déjà uploadée ---
        <div className={`relative ${aspectClass} w-full max-w-xs rounded-xl overflow-hidden border border-slate-200`}>
          <img src={value} alt={label || "Image"} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
            aria-label="Retirer l'image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        // --- Zone d'upload (pas encore d'image) ---
        <CldUploadWidget
          signatureEndpoint="/api/upload-signature"
          options={{
            maxFiles: 1,
            sources: ["local", "camera"],
            multiple: false,
            // On limite côté widget pour une expérience plus rapide ;
            // la limite de taille réelle est aussi imposée côté Cloudinary.
            maxFileSize: 5_000_000, // 5 Mo
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          }}
          onOpen={() => setIsUploading(true)}
          onClose={() => setIsUploading(false)}
          onSuccess={(result) => {
            const url = result?.info?.secure_url;
            if (url) onChange(url);
            setIsUploading(false);
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className={`${aspectClass} w-full max-w-xs rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition`}
            >
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <ImagePlus className="h-6 w-6" />
              )}
              <span className="text-xs font-medium">
                {isUploading ? "Envoi en cours..." : "Ajouter une photo"}
              </span>
            </button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}
