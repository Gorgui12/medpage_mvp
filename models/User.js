// models/User.js
import mongoose from "mongoose";

/**
 * Compte d'un médecin/professionnel de santé. Un User possède au plus
 * un Site pour l'instant (relation 1-to-1 dans ce MVP), via le champ
 * Site.userId qui référence ce document.
 */
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "L'email est obligatoire."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Adresse email invalide."],
    },

    // Hash bcrypt, jamais le mot de passe en clair. select: false pour
    // qu'il ne soit jamais renvoyé par défaut dans les requêtes .find().
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    fullName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    // Flag admin : donne accès au dashboard propriétaire (/admin).
    // À positionner manuellement en base pour le premier admin (toi).
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
