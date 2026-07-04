// app/components/form-steps/StepReview.jsx
"use client";

import { CheckCircle2 } from "lucide-react";

const THEME_PRESETS = [
  { label: "Bleu clinique", value: "#2563EB" },
  { label: "Vert santé", value: "#0EA5A8" },
  { label: "Violet doux", value: "#7C3AED" },
  { label: "Anthracite", value: "#334155" },
];

export default function StepReview({ form, onChange }) {
  const summaryItems = [
    { label: "Site", value: `${form.subdomain || "—"}.medpage.com` },
    { label: "Cabinet", value: form.cabinetName || "—" },
    { label: "Praticien", value: form.doctorName || "—" },
    { label: "Spécialité", value: form.specialty || "—" },
    { label: "Ville", value: form.city || "—" },
    { label: "Carte Google Maps", value: form.mapUrl ? "Configurée" : "Non configurée" },
    { label: "Services", value: `${form.services.length} ajouté(s)` },
    { label: "Témoignages", value: `${form.testimonials.length} ajouté(s)` },
    { label: "Photos galerie", value: `${form.galleryPhotos.length} photo(s)` },
    {
      label: "Notifications",
      value: [
        form.notificationPreferences.email && "Email",
        form.notificationPreferences.whatsapp && "WhatsApp",
      ]
        .filter(Boolean)
        .join(" + ") || "Aucune",
    },
  ];

  return (
    <div className="space-y-8">
      {/* --- Couleur du thème --- */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Couleur principale du site
        </label>
        <div className="flex items-center gap-3">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              title={preset.label}
              onClick={() => onChange("themeColor", preset.value)}
              className={`h-9 w-9 rounded-full border-2 transition ${
                form.themeColor === preset.value ? "border-slate-900 scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: preset.value }}
            />
          ))}
          <input
            type="color"
            value={form.themeColor}
            onChange={(e) => onChange("themeColor", e.target.value)}
            className="h-9 w-9 rounded-full border border-slate-200 cursor-pointer"
            title="Couleur personnalisée"
          />
        </div>
      </div>

      {/* --- Récapitulatif --- */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Récapitulatif</h3>
        <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500">{item.label}</span>
              <span className="text-sm font-medium text-slate-800 truncate max-w-[60%]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 text-sm text-slate-500 bg-teal-50 border border-teal-100 rounded-lg px-4 py-3">
        <CheckCircle2 className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
        <p>
          Votre site sera généré en mode brouillon. Vous pourrez le prévisualiser
          avant de l'activer définitivement.
        </p>
      </div>
    </div>
  );
}
