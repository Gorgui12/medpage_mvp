// models/Appointment.js
import mongoose from "mongoose";

/**
 * Représente une demande de RDV soumise par un patient depuis le site
 * public d'un cabinet. Chaque document est rattaché à un Site via siteId.
 */
const AppointmentSchema = new mongoose.Schema(
  {
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true, // on filtre très souvent par siteId (dashboard du médecin)
    },

    // On duplique le subdomain ici : évite un join Mongoose juste pour
    // afficher "Nouvelle demande pour dr-durand" dans des logs/notifs.
    subdomain: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    patientName: {
      type: String,
      required: [true, "Le nom du patient est obligatoire."],
      trim: true,
      maxlength: 120,
    },

    patientPhone: {
      type: String,
      required: [true, "Le téléphone du patient est obligatoire."],
      trim: true,
    },

    patientEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    // Date/créneau souhaité par le patient (texte libre pour rester simple :
    // pas de système de calendrier avec créneaux réels pour ce MVP)
    preferredDate: {
      type: String,
      trim: true,
      default: "",
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Cycle de vie de la demande, géré depuis le dashboard médecin
    status: {
      type: String,
      enum: ["new", "contacted", "confirmed", "cancelled"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Appointment ||
  mongoose.model("Appointment", AppointmentSchema);
