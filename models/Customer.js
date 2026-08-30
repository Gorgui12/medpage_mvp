// models/Customer.js
import mongoose from "mongoose";

/**
 * Miroir d'un customer Paddle (entité `ctm_...`).
 *
 * Adaptation MongoDB/Mongoose du schéma Postgres recommandé par Paddle :
 *   customers ( customer_id TEXT PRIMARY KEY, email TEXT NOT NULL, ... )
 *
 * Le champ `_id` porte directement l'ID Paddle du customer : c'est la clé
 * primaire naturelle, et les upserts idempotents du webhook s'écrivent
 * facilement sur `{ _id }`.
 *
 * Les events `customer.created` / `customer.updated` alimentent cette
 * collection (mise à jour = upsert, jamais d'insertion aveugle, pour
 * supporter les livraisons au moins-une-fois et hors ordre de Paddle).
 */
const CustomerSchema = new mongoose.Schema(
  {
    // ID Paddle du customer (ctm_...) = clé primaire.
    _id: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt / updatedAt (convention du projet)
  }
);

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);