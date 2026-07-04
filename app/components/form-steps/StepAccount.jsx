// app/components/form-steps/StepAccount.jsx
"use client";

import { Field, Input } from "../form-fields";

export default function StepAccount({ form, onChange }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Créez votre compte pour accéder à votre tableau de bord et gérer
        votre site à tout moment.
      </p>

      <Field label="Votre nom complet" required>
        <Input
          value={form.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          placeholder="Dr. Amadou Durand"
          required
        />
      </Field>

      <Field label="Email" required hint="Utilisé pour vous connecter à votre tableau de bord">
        <Input
          type="email"
          value={form.accountEmail}
          onChange={(e) => onChange("accountEmail", e.target.value)}
          placeholder="docteur@exemple.com"
          required
        />
      </Field>

      <Field label="Mot de passe" required hint="8 caractères minimum">
        <Input
          type="password"
          value={form.accountPassword}
          onChange={(e) => onChange("accountPassword", e.target.value)}
          placeholder="••••••••"
          minLength={8}
          required
        />
      </Field>
    </div>
  );
}
