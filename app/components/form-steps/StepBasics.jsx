// app/components/form-steps/StepBasics.jsx
"use client";

import { Field, Input } from "../form-fields";

export default function StepBasics({ form, onChange }) {
  function handleSubdomainChange(e) {
    // Le sous-domaine doit rester "slug-safe" : on nettoie la saisie en direct
    const cleaned = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // retire les accents
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");
    onChange("subdomain", cleaned);
  }

  return (
    <div className="space-y-6">
      <Field label="Adresse de votre site" required hint="Visible publiquement, ex: dr-durand">
        <div className="flex items-stretch rounded-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-slate-300">
          <input
            type="text"
            value={form.subdomain}
            onChange={handleSubdomainChange}
            required
            minLength={3}
            placeholder="dr-durand"
            className="flex-1 px-4 py-3 text-sm outline-none"
          />
          <span className="flex items-center px-4 text-sm text-slate-400 bg-slate-50 border-l border-slate-200">
            .medpage.com
          </span>
        </div>
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nom du cabinet" required>
          <Input
            value={form.cabinetName}
            onChange={(e) => onChange("cabinetName", e.target.value)}
            placeholder="Cabinet Médical Durand"
            required
          />
        </Field>
        <Field label="Nom du praticien" required>
          <Input
            value={form.doctorName}
            onChange={(e) => onChange("doctorName", e.target.value)}
            placeholder="Durand"
            required
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Spécialité" required>
          <Input
            value={form.specialty}
            onChange={(e) => onChange("specialty", e.target.value)}
            placeholder="Kinésithérapeute"
            required
          />
        </Field>
        <Field label="Ville" required>
          <Input
            value={form.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="Dakar"
            required
          />
        </Field>
      </div>

      <Field label="Adresse complète">
        <Input
          value={form.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="12 Avenue Cheikh Anta Diop, Dakar"
        />
      </Field>

      <Field label="Horaires d'ouverture">
        <Input
          value={form.openingHours}
          onChange={(e) => onChange("openingHours", e.target.value)}
          placeholder="Lun - Sam : 8h00 - 19h00"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Téléphone" required>
          <Input
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+221 77 123 45 67"
            required
          />
        </Field>
        <Field label="Lien de prise de RDV" required hint="Doctolib, Zocdoc, WhatsApp...">
          <Input
            type="url"
            value={form.bookingUrl}
            onChange={(e) => onChange("bookingUrl", e.target.value)}
            placeholder="https://www.doctolib.fr/..."
            required
          />
        </Field>
      </div>
    </div>
  );
}
