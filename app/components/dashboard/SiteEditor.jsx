// app/components/dashboard/SiteEditor.jsx
"use client";

import { useState } from "react";
import { Loader2, Save, CheckCircle2 } from "lucide-react";

import StepBasics from "../form-steps/StepBasics";
import StepLocation from "../form-steps/StepLocation";
import StepPresentation from "../form-steps/StepPresentation";
import StepServices from "../form-steps/StepServices";
import StepTestimonials from "../form-steps/StepTestimonials";
import StepNotifications from "../form-steps/StepNotifications";

const SECTIONS = [
  { id: "basics", label: "Informations", component: StepBasics },
  { id: "location", label: "Localisation", component: StepLocation },
  { id: "presentation", label: "Présentation", component: StepPresentation },
  { id: "services", label: "Services", component: StepServices },
  { id: "testimonials", label: "Avis & FAQ", component: StepTestimonials },
  { id: "notifications", label: "Notifications", component: StepNotifications },
];

/**
 * Réutilise les mêmes composants d'étape que le formulaire de création
 * (StepBasics, StepPresentation, etc.), mais ici présentés en onglets
 * plutôt qu'en wizard séquentiel : le médecin édite directement la
 * section qui l'intéresse, sans repasser par tout le parcours.
 */
export default function SiteEditor({ initialSite }) {
  // On retire les champs non éditables (_id, userId, isPublished, Stripe...)
  // pour ne garder que ce que les composants d'étape attendent.
  const [form, setForm] = useState(() => ({
    subdomain: initialSite.subdomain,
    cabinetName: initialSite.cabinetName,
    doctorName: initialSite.doctorName,
    specialty: initialSite.specialty,
    city: initialSite.city,
    address: initialSite.address || "",
    openingHours: initialSite.openingHours || "",
    phone: initialSite.phone,
    bookingUrl: initialSite.bookingUrl || "",
    mapUrl: initialSite.mapUrl || "",
    tagline: initialSite.tagline || "",
    bio: initialSite.bio || "",
    profilePhotoUrl: initialSite.profilePhotoUrl || "",
    coverPhotoUrl: initialSite.coverPhotoUrl || "",
    galleryPhotos: initialSite.galleryPhotos || [],
    services: initialSite.services || [],
    testimonials: initialSite.testimonials || [],
    faq: initialSite.faq || [],
    socialLinks: initialSite.socialLinks || { facebook: "", instagram: "", whatsapp: "", linkedin: "" },
    notificationPreferences: initialSite.notificationPreferences || { email: true, whatsapp: false },
    notificationEmail: initialSite.notificationEmail || "",
    notificationWhatsapp: initialSite.notificationWhatsapp || "",
    themeColor: initialSite.themeColor || "#0EA5A8",
  }));

  const [activeSection, setActiveSection] = useState("basics");
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | success | error
  const [error, setError] = useState(null);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveState("idle");
    setError(null);

    try {
      // On retire subdomain : non modifiable, l'API l'ignore de toute façon
      const { subdomain, ...updates } = form;

      const res = await fetch("/api/sites/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        setSaveState("error");
        return;
      }

      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (err) {
      setError("Impossible de contacter le serveur.");
      setSaveState("error");
    } finally {
      setIsSaving(false);
    }
  }

  const ActiveComponent = SECTIONS.find((s) => s.id === activeSection).component;

  return (
    <div>
      {/* --- Onglets de section --- */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              activeSection === section.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8">
        <ActiveComponent form={form} onChange={updateField} />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mt-4">
          {error}
        </p>
      )}

      {/* --- Bouton de sauvegarde, flottant en bas --- */}
      <div className="sticky bottom-4 mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: form.themeColor }}
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {!isSaving && saveState === "success" && <CheckCircle2 className="h-4 w-4" />}
          {!isSaving && saveState !== "success" && <Save className="h-4 w-4" />}
          {isSaving ? "Enregistrement..." : saveState === "success" ? "Enregistré !" : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}
