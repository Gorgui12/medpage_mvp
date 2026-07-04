// app/components/form-steps/StepTestimonials.jsx
"use client";

import { Plus, Trash2, Star } from "lucide-react";
import { Field, Input, Textarea } from "../form-fields";

const MAX_TESTIMONIALS = 10;
const MAX_FAQ = 10;

export default function StepTestimonials({ form, onChange }) {
  const testimonials = form.testimonials;
  const faq = form.faq;

  function addTestimonial() {
    if (testimonials.length >= MAX_TESTIMONIALS) return;
    onChange("testimonials", [
      ...testimonials,
      { authorName: "", text: "", rating: 5 },
    ]);
  }

  function updateTestimonial(index, field, value) {
    const next = [...testimonials];
    next[index] = { ...next[index], [field]: value };
    onChange("testimonials", next);
  }

  function removeTestimonial(index) {
    const next = [...testimonials];
    next.splice(index, 1);
    onChange("testimonials", next);
  }

  function addFaqItem() {
    if (faq.length >= MAX_FAQ) return;
    onChange("faq", [...faq, { question: "", answer: "" }]);
  }

  function updateFaqItem(index, field, value) {
    const next = [...faq];
    next[index] = { ...next[index], [field]: value };
    onChange("faq", next);
  }

  function removeFaqItem(index) {
    const next = [...faq];
    next.splice(index, 1);
    onChange("faq", next);
  }

  return (
    <div className="space-y-10">
      {/* --- Témoignages --- */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">Témoignages de patients</h3>

        {testimonials.map((t, index) => (
          <div key={index} className="border border-slate-200 rounded-xl p-4 space-y-3 relative">
            <button
              type="button"
              onClick={() => removeTestimonial(index)}
              className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition"
              aria-label="Supprimer ce témoignage"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <Input
              value={t.authorName}
              onChange={(e) => updateTestimonial(index, "authorName", e.target.value)}
              placeholder="Nom du patient (ex: Awa S.)"
              maxLength={80}
              className="pr-8"
            />
            <Textarea
              value={t.text}
              onChange={(e) => updateTestimonial(index, "text", e.target.value)}
              placeholder="Le témoignage du patient..."
              rows={2}
              maxLength={500}
            />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => updateTestimonial(index, "rating", star)}
                  aria-label={`${star} étoiles`}
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= t.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}

        {testimonials.length < MAX_TESTIMONIALS && (
          <button
            type="button"
            onClick={addTestimonial}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition"
          >
            <Plus className="h-4 w-4" />
            Ajouter un témoignage
          </button>
        )}
      </div>

      {/* --- FAQ --- */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">Questions fréquentes</h3>

        {faq.map((item, index) => (
          <div key={index} className="border border-slate-200 rounded-xl p-4 space-y-3 relative">
            <button
              type="button"
              onClick={() => removeFaqItem(index)}
              className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition"
              aria-label="Supprimer cette question"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <Input
              value={item.question}
              onChange={(e) => updateFaqItem(index, "question", e.target.value)}
              placeholder="Ex: Acceptez-vous les nouveaux patients ?"
              maxLength={200}
              className="pr-8"
            />
            <Textarea
              value={item.answer}
              onChange={(e) => updateFaqItem(index, "answer", e.target.value)}
              placeholder="Votre réponse..."
              rows={2}
              maxLength={600}
            />
          </div>
        ))}

        {faq.length < MAX_FAQ && (
          <button
            type="button"
            onClick={addFaqItem}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition"
          >
            <Plus className="h-4 w-4" />
            Ajouter une question
          </button>
        )}
      </div>

      {/* --- Réseaux sociaux --- */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">Réseaux sociaux (optionnel)</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Facebook">
            <Input
              value={form.socialLinks.facebook}
              onChange={(e) =>
                onChange("socialLinks", { ...form.socialLinks, facebook: e.target.value })
              }
              placeholder="https://facebook.com/..."
            />
          </Field>
          <Field label="Instagram">
            <Input
              value={form.socialLinks.instagram}
              onChange={(e) =>
                onChange("socialLinks", { ...form.socialLinks, instagram: e.target.value })
              }
              placeholder="https://instagram.com/..."
            />
          </Field>
          <Field label="WhatsApp">
            <Input
              value={form.socialLinks.whatsapp}
              onChange={(e) =>
                onChange("socialLinks", { ...form.socialLinks, whatsapp: e.target.value })
              }
              placeholder="+221 77 123 45 67"
            />
          </Field>
          <Field label="LinkedIn">
            <Input
              value={form.socialLinks.linkedin}
              onChange={(e) =>
                onChange("socialLinks", { ...form.socialLinks, linkedin: e.target.value })
              }
              placeholder="https://linkedin.com/..."
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
