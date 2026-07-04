// models/Site.js
import mongoose from "mongoose";

/**
 * Schéma représentant un mini-site vitrine généré pour un professionnel de santé.
 * Chaque document = un client MedPage = un sous-domaine.
 */
const SiteSchema = new mongoose.Schema(
  {
    // Propriétaire authentifié du site (nouveau système de compte).
    // Reste optionnel pour ne pas casser d'éventuels sites créés avant
    // la mise en place de l'authentification (migration progressive).
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // Identifiant unique utilisé dans l'URL : dr-durand.medpage.com
    subdomain: {
      type: String,
      required: [true, "Le sous-domaine est obligatoire."],
      unique: true,
      lowercase: true,
      trim: true,
      // On autorise uniquement lettres minuscules, chiffres et tirets (slug-safe)
      match: [
        /^[a-z0-9-]+$/,
        "Le sous-domaine ne peut contenir que des lettres minuscules, chiffres et tirets.",
      ],
      minlength: 3,
      maxlength: 63, // limite technique des labels DNS
    },

    cabinetName: {
      type: String,
      required: [true, "Le nom du cabinet est obligatoire."],
      trim: true,
      maxlength: 120,
    },

    doctorName: {
      type: String,
      required: [true, "Le nom du praticien est obligatoire."],
      trim: true,
      maxlength: 120,
    },

    specialty: {
      type: String,
      required: [true, "La spécialité est obligatoire."],
      trim: true,
      maxlength: 80,
    },

    city: {
      type: String,
      required: [true, "La ville est obligatoire."],
      trim: true,
      maxlength: 80,
    },

    // On ajoute l'adresse complète + horaires : utiles pour la landing page (SEO local)
    address: {
      type: String,
      trim: true,
      default: "",
    },

    openingHours: {
      type: String,
      trim: true,
      default: "Lun - Ven : 9h00 - 18h00",
    },

    phone: {
      type: String,
      required: [true, "Le numéro de téléphone est obligatoire."],
      trim: true,
    },

    // Lien externe de prise de RDV (Doctolib, Zocdoc, etc.) — optionnel,
    // car MedPage propose maintenant un vrai formulaire de RDV natif.
    bookingUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // Lien Google Maps collé par le médecin (ex: "Partager" -> "Intégrer une carte"
    // ou simplement l'URL de la fiche établissement). Affiché en <iframe> sur le site.
    mapUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // --- Préférences de notification pour les demandes de RDV natives ---
    notificationPreferences: {
      // Canaux activés : le médecin peut cocher l'un, l'autre, ou les deux
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
    },
    notificationEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    notificationWhatsapp: {
      type: String,
      trim: true,
      default: "", // numéro au format international, ex: +221771234567
    },

    // --- Présentation enrichie (one-pager) ---

    // Courte phrase d'accroche affichée juste sous le nom dans le hero
    // ex: "20 ans d'expérience au service de votre sourire"
    tagline: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },

    // Présentation longue du praticien/cabinet (section "À propos")
    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    // Photo de profil du praticien (URL Cloudinary)
    profilePhotoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // Grande image de fond du hero (URL Cloudinary)
    coverPhotoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // Galerie de photos du cabinet (jusqu'à 8 images, URLs Cloudinary)
    galleryPhotos: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 8,
        message: "Maximum 8 photos dans la galerie.",
      },
    },

    // Services proposés par le cabinet, affichés en grille
    services: {
      type: [
        {
          title: { type: String, trim: true, maxlength: 80 },
          description: { type: String, trim: true, maxlength: 300 },
        },
      ],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 12,
        message: "Maximum 12 services.",
      },
    },

    // Témoignages de patients
    testimonials: {
      type: [
        {
          authorName: { type: String, trim: true, maxlength: 80 },
          text: { type: String, trim: true, maxlength: 500 },
          rating: { type: Number, min: 1, max: 5, default: 5 },
        },
      ],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "Maximum 10 témoignages.",
      },
    },

    // Questions fréquentes (FAQ), utile pour le SEO (rich snippets possibles)
    faq: {
      type: [
        {
          question: { type: String, trim: true, maxlength: 200 },
          answer: { type: String, trim: true, maxlength: 600 },
        },
      ],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "Maximum 10 questions FAQ.",
      },
    },

    // Réseaux sociaux (tous optionnels)
    socialLinks: {
      facebook: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
      whatsapp: { type: String, trim: true, default: "" }, // numéro ou lien wa.me
      linkedin: { type: String, trim: true, default: "" },
    },

    // Couleur principale du thème, ex: "#0EA5A8"
    themeColor: {
      type: String,
      default: "#0EA5A8",
      match: [/^#([0-9A-Fa-f]{3}){1,2}$/, "Couleur hexadécimale invalide."],
    },

    // Le site n'est visible publiquement qu'après paiement / validation
    isPublished: {
      type: Boolean,
      default: false,
    },

    // --- Essai gratuit ---
    // Date de fin du trial : définie à la création (now + 14 jours).
    // Tant que now < trialEndsAt ET que l'abonnement n'est pas encore actif,
    // le site est quand même servi publiquement (logique dans le middleware).
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },

    // Vrai si le trial a été explicitement révoqué (ex: abus, fraude).
    trialRevoked: {
      type: Boolean,
      default: false,
    },

    // Token secret généré à la création, renvoyé une seule fois au médecin.
    // Sert à prouver qu'il est propriétaire du site pour pouvoir le modifier/payer.
    editToken: {
      type: String,
      required: true,
      select: false, // n'est jamais renvoyé par défaut dans les requêtes .find()
    },

    // --- Références Stripe (remplies après paiement) ---
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    stripeSubscriptionStatus: {
      type: String,
      enum: ["none", "active", "past_due", "canceled", "incomplete"],
      default: "none",
    },
  },
  {
    timestamps: true, // createdAt / updatedAt automatiques
  }
);

// Note : l'option `unique: true` sur le champ subdomain crée déjà
// automatiquement un index. Pas besoin d'en redéclarer un manuellement.

// Pattern standard Next.js : éviter la recompilation du modèle en dev (hot-reload)
export default mongoose.models.Site || mongoose.model("Site", SiteSchema);
