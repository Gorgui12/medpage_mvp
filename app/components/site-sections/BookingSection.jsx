// app/components/site-sections/BookingSection.jsx
"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Phone, ExternalLink } from "lucide-react";

export default function BookingSection({ site, accent }) {
  const [form, setForm] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    preferredDate: "",
    reason: "",
  });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState(null);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain: site.subdomain, ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch (err) {
      setError("Impossible d'envoyer votre demande. Réessayez ou appelez-nous directement.");
      setStatus("error");
    }
  }

  const phoneHref = `tel:${site.phone.replace(/\s+/g, "")}`;

  return (
    <section id="contact" className="max-w-3xl mx-auto px-6 py-16 border-t border-slate-100">
      <h2
        className="text-xs font-semibold uppercase tracking-wider mb-3 text-center"
        style={{ color: accent }}
      >
        Rendez-vous
      </h2>
      <h3 className="text-2xl font-bold text-slate-900 text-center mb-3">
        Prendre rendez-vous
      </h3>
      <p className="text-sm text-slate-500 text-center mb-10">
        Remplissez ce formulaire, nous vous recontactons rapidement pour confirmer.
      </p>

      {status === "success" ? (
        <div className="flex flex-col items-center gap-3 py-10 px-6 rounded-2xl bg-teal-50 border border-teal-100 text-center">
          <CheckCircle2 className="h-10 w-10 text-teal-600" />
          <p className="font-semibold text-slate-800">Demande envoyée !</p>
          <p className="text-sm text-slate-500 max-w-sm">
            Nous avons bien reçu votre demande de rendez-vous. Le cabinet vous
            recontactera très prochainement pour la confirmer.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Votre nom complet *"
              value={form.patientName}
              onChange={(e) => updateField("patientName", e.target.value)}
              className="px-4 py-3 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 bg-white"
            />
            <input
              type="tel"
              required
              placeholder="Votre téléphone *"
              value={form.patientPhone}
              onChange={(e) => updateField("patientPhone", e.target.value)}
              className="px-4 py-3 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 bg-white"
            />
          </div>

          <input
            type="email"
            placeholder="Votre email (optionnel)"
            value={form.patientEmail}
            onChange={(e) => updateField("patientEmail", e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 bg-white"
          />

          <input
            type="text"
            placeholder="Date ou créneau souhaité (ex: Lundi matin, dès que possible...)"
            value={form.preferredDate}
            onChange={(e) => updateField("preferredDate", e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 bg-white"
          />

          <textarea
            placeholder="Motif de la consultation (optionnel)"
            rows={3}
            value={form.reason}
            onChange={(e) => updateField("reason", e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 bg-white resize-none"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl text-white font-semibold transition hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: accent }}
          >
            {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "submitting" ? "Envoi en cours..." : "Envoyer ma demande"}
          </button>

          {/* --- Alternatives : appel direct + lien externe optionnel --- */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 text-sm">
            <a href={phoneHref} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800">
              <Phone className="h-4 w-4" />
              Ou appelez le {site.phone}
            </a>
            {site.bookingUrl && (
              <a
                href={site.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800"
              >
                <ExternalLink className="h-4 w-4" />
                Réserver via Doctolib
              </a>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
