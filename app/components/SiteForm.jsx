// app/components/SiteForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";

import StepAccount from "./form-steps/StepAccount";
import StepBasics from "./form-steps/StepBasics";
import StepLocation from "./form-steps/StepLocation";
import StepPresentation from "./form-steps/StepPresentation";
import StepServices from "./form-steps/StepServices";
import StepTestimonials from "./form-steps/StepTestimonials";
import StepNotifications from "./form-steps/StepNotifications";
import StepReview from "./form-steps/StepReview";

const STEPS = [
  { id: "account", label: "Votre compte", component: StepAccount },
  { id: "basics", label: "Informations", component: StepBasics },
  { id: "location", label: "Localisation", component: StepLocation },
  { id: "presentation", label: "Présentation", component: StepPresentation },
  { id: "services", label: "Services", component: StepServices },
  { id: "testimonials", label: "Avis & FAQ", component: StepTestimonials },
  { id: "notifications", label: "Notifications", component: StepNotifications },
  { id: "review", label: "Finalisation", component: StepReview },
];

const INITIAL_STATE = {
  fullName: "",
  accountEmail: "",
  accountPassword: "",
  subdomain: "",
  cabinetName: "",
  doctorName: "",
  specialty: "",
  city: "",
  address: "",
  openingHours: "",
  phone: "",
  bookingUrl: "",
  mapUrl: "",
  tagline: "",
  bio: "",
  profilePhotoUrl: "",
  coverPhotoUrl: "",
  galleryPhotos: [],
  services: [],
  testimonials: [],
  faq: [],
  socialLinks: { facebook: "", instagram: "", whatsapp: "", linkedin: "" },
  notificationPreferences: { email: true, whatsapp: false },
  notificationEmail: "",
  notificationWhatsapp: "",
  themeColor: "#0EA5A8",
};

/**
 * Validation par étape : chaque entrée retourne un message d'erreur (string)
 * ou null si l'étape est valide. Centralisé ici plutôt que dans chaque
 * composant d'étape, pour garder toute la logique de blocage au même endroit.
 */
const STEP_VALIDATORS = {
  account(form) {
    if (!form.fullName.trim() || !form.accountEmail.trim() || !form.accountPassword.trim()) {
      return "Merci de remplir tous les champs pour créer votre compte.";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.accountEmail)) {
      return "Adresse email invalide.";
    }
    if (form.accountPassword.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }
    return null;
  },

  basics(form) {
    const required = ["subdomain", "cabinetName", "doctorName", "specialty", "city", "phone"];
    const missing = required.filter((field) => !form[field]?.trim());
    if (missing.length > 0) {
      return "Merci de remplir tous les champs obligatoires avant de continuer.";
    }
    if (form.subdomain.length < 3) {
      return "L'adresse du site doit contenir au moins 3 caractères.";
    }
    return null;
  },

  notifications(form) {
    const { notificationPreferences, notificationEmail, notificationWhatsapp } = form;
    if (notificationPreferences.email && !notificationEmail.trim()) {
      return "Merci d'indiquer une adresse email pour les notifications, ou désactivez ce canal.";
    }
    if (notificationPreferences.whatsapp && !notificationWhatsapp.trim()) {
      return "Merci d'indiquer un numéro WhatsApp pour les notifications, ou désactivez ce canal.";
    }
    return null;
  },
};

export default function SiteForm() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingLabel, setSubmittingLabel] = useState("Génération en cours...");
  const [error, setError] = useState(null);

  const currentStep = STEPS[stepIndex];
  const StepComponent = currentStep.component;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STEPS.length - 1;

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateCurrentStep() {
    const validator = STEP_VALIDATORS[currentStep.id];
    if (!validator) return true; // étapes sans champs obligatoires (services, galerie...)

    const message = validator(form);
    if (message) {
      setError(message);
      return false;
    }
    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setError(null);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  // Permet de cliquer directement sur une étape déjà visitée pour y revenir,
  // sans pouvoir sauter en avant (on ne valide que la navigation arrière).
  function goToStep(index) {
    if (index < stepIndex) {
      setError(null);
      setStepIndex(index);
    }
  }

  async function handleGenerate() {
    if (!validateCurrentStep()) return;
    setError(null);
    setIsSubmitting(true);

    try {
      // --- 1. Création du compte ---
      setSubmittingLabel("Création de votre compte...");
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.accountEmail,
          password: form.accountPassword,
          fullName: form.fullName,
        }),
      });
      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        const errorMsg = registerData.error || "Impossible de créer votre compte.";
        setError(errorMsg.includes("existe déjà") 
          ? "Cette adresse email est déjà utilisée. Connectez-vous ou utilisez une autre adresse." 
          : errorMsg);
        setIsSubmitting(false);
        return;
      }

      // --- 2. Connexion automatique avec les identifiants qu'on vient de créer ---
      setSubmittingLabel("Connexion...");
      const signInResult = await signIn("credentials", {
        email: form.accountEmail,
        password: form.accountPassword,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Compte créé avec succès, mais la connexion automatique a échoué. Veuillez vous connecter manuellement.");
        setIsSubmitting(false);
        router.push("/login");
        return;
      }

      // --- 3. Création du site, maintenant que la session existe ---
      setSubmittingLabel("Génération de votre site...");
      const siteRes = await fetch("/api/create-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const siteData = await siteRes.json();

      if (!siteRes.ok) {
        const errorMsg = siteData.error || "Une erreur est survenue lors de la création du site.";
        setError(errorMsg.includes("déjà pris") 
          ? "Ce sous-domaine est déjà utilisé. Choisissez-en un autre." 
          : errorMsg.includes("possède déjà")
          ? "Votre compte possède déjà un site MedPage."
          : errorMsg);
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("Erreur de connexion au serveur. Vérifiez votre connexion internet et réessayez.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
      {/* --- Indicateur de progression (texte + barre, compact sur mobile) --- */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">
            Étape {stepIndex + 1} / {STEPS.length}
          </span>
          <span className="text-xs font-semibold" style={{ color: form.themeColor }}>
            {currentStep.label}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
              backgroundColor: form.themeColor,
            }}
          />
        </div>

        {/* Pastilles cliquables, visibles uniquement sur desktop pour ne pas
            surcharger l'écran mobile (la barre ci-dessus suffit en mobile) */}
        <div className="hidden sm:flex items-center justify-between mt-3">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => goToStep(index)}
              disabled={index >= stepIndex}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition ${
                  index < stepIndex
                    ? "text-white cursor-pointer"
                    : index === stepIndex
                    ? "text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
                style={index <= stepIndex ? { backgroundColor: form.themeColor } : {}}
              >
                {index < stepIndex ? <Check className="h-3 w-3" /> : index + 1}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* --- Contenu de l'étape courante --- */}
      <div key={currentStep.id} className="min-h-[320px] animate-[fadeIn_0.25s_ease-out]">
        <StepComponent form={form} onChange={updateField} />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mt-6">
          {error}
        </p>
      )}

      {/* --- Navigation --- */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={goBack}
          disabled={isFirstStep}
          className="inline-flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 disabled:opacity-0 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: form.themeColor }}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? submittingLabel : "Générer mon site"}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-1 px-6 py-3 rounded-xl text-white font-semibold transition hover:opacity-90"
            style={{ backgroundColor: form.themeColor }}
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
