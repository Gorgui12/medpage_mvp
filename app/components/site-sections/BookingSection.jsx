// app/components/site-sections/BookingSection.jsx
"use client";

import { useState } from "react";
import {
  Loader2,
  CheckCircle2,
  Phone,
  ExternalLink,
  Send,
  MessageCircle,
} from "lucide-react";

const CONFETTI_COLORS = ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#0ea5a8"];

export default function BookingSection({ site, accent, geo }) {
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
  const isEnglish = geo?.lang === "en";
  const whatsappHref = site.socialLinks?.whatsapp
    ? `https://wa.me/${site.socialLinks.whatsapp.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <section id="contact" className="relative py-20 md:py-[120px] overflow-hidden">
      {/* Gradient de fond subtil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, var(--bg-base) 0%, ${accent}08 100%)`,
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <span
            className="font-dm inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
            style={{ backgroundColor: `${accent}1A`, color: accent }}
          >
            {isEnglish ? "Response within 24h" : "Réponse sous 24h"}
          </span>
          <h2 className="font-playfair text-3xl md:text-[40px] leading-tight font-bold text-slate-900">
            {isEnglish ? "Book an appointment" : "Prendre rendez-vous"}
          </h2>
          <p className="mt-4 text-slate-500 text-[15px]">
            {isEnglish
              ? `With Dr. ${site.doctorName}, ${site.specialty.toLowerCase()} in ${site.city} — fill out the form and we will get back to you shortly.`
              : `Chez Dr. ${site.doctorName}, ${site.specialty} à ${site.city} — remplissez le formulaire et nous revenons vers vous rapidement.`}
          </p>
        </div>

        {status === "success" ? (
          <SuccessState accent={accent} />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-[32px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] p-8 md:p-12 border border-slate-100"
          >
            {/* Row 1 : Prénom/Nom + Téléphone */}
            <div className="grid sm:grid-cols-2 gap-5">
              <Field
                type="text"
                label={isEnglish ? "Full name *" : "Nom complet *"}
                value={form.patientName}
                onChange={(e) => updateField("patientName", e.target.value)}
                required
                autoComplete="name"
              />
              <Field
                type="tel"
                label={isEnglish ? "Phone *" : "Téléphone *"}
                value={form.patientPhone}
                onChange={(e) => updateField("patientPhone", e.target.value)}
                required
                autoComplete="tel"
              />
            </div>

            {/* Row 2 : Email + Date souhaitée */}
            <div className="grid sm:grid-cols-2 gap-5 mt-5">
              <Field
                type="email"
                label={isEnglish ? "Email (optional)" : "Email (optionnel)"}
                value={form.patientEmail}
                onChange={(e) => updateField("patientEmail", e.target.value)}
                autoComplete="email"
              />
              <Field
                type="text"
                label={isEnglish ? "Preferred date" : "Date ou créneau souhaité"}
                value={form.preferredDate}
                onChange={(e) => updateField("preferredDate", e.target.value)}
              />
            </div>

            {/* Row 3 : Motif, pleine largeur */}
            <div className="mt-5">
              <div className="floating-label-group floating-textarea-group">
                <textarea
                  className="floating-input"
                  placeholder=" "
                  rows={4}
                  value={form.reason}
                  onChange={(e) => updateField("reason", e.target.value)}
                />
                <label className="floating-label">
                  {isEnglish ? "Reason for visit (optional)" : "Motif de la consultation (optionnel)"}
                </label>
              </div>
            </div>

            {error && (
              <p className="mt-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* Row 4 : Submit */}
            <button
              type="submit"
              disabled={status === "submitting"}
              className="cta-primary mt-8 w-full h-[60px] inline-flex items-center justify-center gap-2 rounded-xl text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isEnglish ? "Sending..." : "Envoi en cours..."}
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  {isEnglish ? "Send my request" : "Envoyer ma demande"}
                </>
              )}
            </button>

            {/* Alternatives contact */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={phoneHref}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                <Phone className="h-4 w-4" style={{ color: accent }} />
                {isEnglish ? "Call directly" : "Appel direct"}
              </a>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-200 text-sm font-medium text-slate-600 transition"
                  style={{ color: accent, borderColor: `${accent}40`, backgroundColor: `${accent}0D` }}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              {site.bookingUrl && (
                <a
                  href={site.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  <ExternalLink className="h-4 w-4" />
                  {isEnglish ? "Book via online platform" : "Réserver en ligne"}
                </a>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

/* --- Champ avec floating label --- */
function Field({ label, ...props }) {
  return (
    <div className="floating-label-group">
      <input className="floating-input" placeholder=" " {...props} />
      <label className="floating-label">{label}</label>
    </div>
  );
}

/* --- État succès avec confettis CSS --- */
function SuccessState({ accent }) {
  const pieces = Array.from({ length: 28 });
  return (
    <div className="bg-white rounded-[32px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] p-12 relative overflow-hidden text-center">
      {pieces.map((_, i) => {
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const left = (i * 37) % 100;
        const delay = (i % 10) * 0.08;
        return (
          <span
            key={i}
            className="confetti"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}

      <div className="flex items-center justify-center mb-5">
        <span
          className="relative flex items-center justify-center h-20 w-20 rounded-full"
          style={{ backgroundColor: `${accent}1A` }}
        >
          <CheckCircle2 className="h-10 w-10" style={{ color: accent }} />
        </span>
      </div>
      <h3 className="font-playfair text-2xl font-bold text-slate-900 mb-3">Demande envoyée !</h3>
      <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
        Nous avons bien reçu votre demande de rendez-vous. Le cabinet vous
        recontactera très prochainement pour la confirmer.
      </p>
    </div>
  );
}
