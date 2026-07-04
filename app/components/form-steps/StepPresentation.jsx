// app/components/form-steps/StepPresentation.jsx
"use client";

import { Field, Input, Textarea } from "../form-fields";
import ImageUploader from "../ImageUploader";
import GalleryUploader from "../GalleryUploader";

export default function StepPresentation({ form, onChange }) {
  return (
    <div className="space-y-6">
      <Field label="Phrase d'accroche" hint="Affichée en grand sous votre nom, ex: 20 ans d'expérience à votre service">
        <Input
          value={form.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
          placeholder="Votre santé, notre priorité depuis 2005"
          maxLength={160}
        />
      </Field>

      <Field label="Présentation" hint="Quelques phrases sur vous, votre parcours, votre approche">
        <Textarea
          value={form.bio}
          onChange={(e) => onChange("bio", e.target.value)}
          placeholder="Diplômé de la Faculté de Médecine de Dakar en 2005, j'accompagne mes patients..."
          rows={5}
          maxLength={2000}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-6">
        <ImageUploader
          label="Photo de profil"
          value={form.profilePhotoUrl}
          onChange={(url) => onChange("profilePhotoUrl", url)}
          aspect="square"
        />
        <ImageUploader
          label="Photo de couverture"
          value={form.coverPhotoUrl}
          onChange={(url) => onChange("coverPhotoUrl", url)}
          aspect="wide"
        />
      </div>

      <GalleryUploader
        value={form.galleryPhotos}
        onChange={(photos) => onChange("galleryPhotos", photos)}
      />
    </div>
  );
}
