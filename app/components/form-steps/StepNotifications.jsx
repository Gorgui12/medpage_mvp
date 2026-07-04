// app/components/form-steps/StepNotifications.jsx
"use client";

import { Mail, MessageCircle, CheckCircle2 } from "lucide-react";
import { Field, Input } from "../form-fields";

export default function StepNotifications({ form, onChange }) {
  const prefs = form.notificationPreferences;

  function toggleChannel(channel) {
    onChange("notificationPreferences", {
      ...prefs,
      [channel]: !prefs[channel],
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Toutes les demandes de rendez-vous sont automatiquement enregistrées et
        consultables depuis votre tableau de bord. Vous pouvez en plus choisir
        d'être notifié immédiatement par email et/ou WhatsApp.
      </p>

      <div className="space-y-3">
        {/* --- Canal Email --- */}
        <ChannelToggle
          icon={<Mail className="h-5 w-5" />}
          label="Email"
          description="Recevez un email à chaque nouvelle demande"
          checked={prefs.email}
          onToggle={() => toggleChannel("email")}
          accent={form.themeColor}
        >
          {prefs.email && (
            <Field label="Adresse email de notification">
              <Input
                type="email"
                value={form.notificationEmail}
                onChange={(e) => onChange("notificationEmail", e.target.value)}
                placeholder="docteur@exemple.com"
              />
            </Field>
          )}
        </ChannelToggle>

        {/* --- Canal WhatsApp --- */}
        <ChannelToggle
          icon={<MessageCircle className="h-5 w-5" />}
          label="WhatsApp"
          description="Recevez une notification WhatsApp à chaque nouvelle demande"
          checked={prefs.whatsapp}
          onToggle={() => toggleChannel("whatsapp")}
          accent={form.themeColor}
        >
          {prefs.whatsapp && (
            <Field label="Numéro WhatsApp" hint="Format international, ex: +221771234567">
              <Input
                type="tel"
                value={form.notificationWhatsapp}
                onChange={(e) => onChange("notificationWhatsapp", e.target.value)}
                placeholder="+221771234567"
              />
            </Field>
          )}
        </ChannelToggle>
      </div>

      <div className="flex items-start gap-2 text-sm text-slate-500 bg-teal-50 border border-teal-100 rounded-lg px-4 py-3">
        <CheckCircle2 className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
        <p>
          Même sans notification activée, retrouvez toutes vos demandes à tout
          moment dans votre tableau de bord.
        </p>
      </div>
    </div>
  );
}

function ChannelToggle({ icon, label, description, checked, onToggle, accent, children }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 text-left"
      >
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
          style={{
            backgroundColor: checked ? `${accent}1A` : "#F1F5F9",
            color: checked ? accent : "#94A3B8",
          }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-medium text-slate-800 text-sm">{label}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
        <div
          className={`h-6 w-11 rounded-full relative transition shrink-0 ${
            checked ? "" : "bg-slate-200"
          }`}
          style={checked ? { backgroundColor: accent } : {}}
        >
          <div
            className={`h-5 w-5 rounded-full bg-white absolute top-0.5 transition ${
              checked ? "left-5" : "left-0.5"
            }`}
          />
        </div>
      </button>

      {children && <div className="mt-4 pl-13">{children}</div>}
    </div>
  );
}
