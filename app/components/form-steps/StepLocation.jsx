// app/components/form-steps/StepLocation.jsx
"use client";

import { Field, Input } from "../form-fields";
import { MapPin, ExternalLink } from "lucide-react";

export default function StepLocation({ form, onChange }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Field
          label="Lien Google Maps de votre cabinet"
          hint="Sur Google Maps : cliquez sur 'Partager' sur votre établissement, puis collez le lien ici"
        >
          <Input
            type="url"
            value={form.mapUrl}
            onChange={(e) => onChange("mapUrl", e.target.value)}
            placeholder="https://maps.app.goo.gl/..."
          />
        </Field>

        {form.mapUrl && (
          <a
            href={form.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Vérifier ce lien
          </a>
        )}

        <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Pas obligatoire, mais fortement recommandé : une carte intégrée
            rassure les patients et améliore votre visibilité locale sur Google.
          </p>
        </div>
      </div>

      <Field
        label="Lien externe de prise de RDV (optionnel)"
        hint="Doctolib, Zocdoc... En plus du formulaire de RDV intégré à votre site"
      >
        <Input
          type="url"
          value={form.bookingUrl}
          onChange={(e) => onChange("bookingUrl", e.target.value)}
          placeholder="https://www.doctolib.fr/..."
        />
      </Field>
    </div>
  );
}
