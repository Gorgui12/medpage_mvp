// models/Subscription.js
import mongoose from "mongoose";

/**
 * Miroir d'un abonnement Paddle (entité `sub_...`).
 *
 * Adaptation MongoDB/Mongoose du schéma Postgres recommandé par Paddle :
 *   subscriptions ( subscription_id TEXT PRIMARY KEY, customer_id TEXT NOT NULL,
 *                   status TEXT NOT NULL, price_id ..., product_id ...,
 *                   scheduled_change_action ..., scheduled_change_at ... )
 *
 * `_id` = ID Paddle de l'abonnement (clé primaire naturelle), ce qui rend
 * les upserts idempotents du webhook triviaux.
 *
 * `scheduledChangeAction` / `scheduledChangeAt` ne servent QU'À
 * l'information : ils ne révoquent jamais l'accès par eux-mêmes (voir
 * lib/paddleAccess.js). Seul le vrai `status` compte pour l'accès.
 */
const SubscriptionSchema = new mongoose.Schema(
  {
    // ID Paddle de l'abonnement (sub_...) = clé primaire.
    _id: {
      type: String,
      required: true,
    },

    // Référence optique vers Customer._id (pas de FK réelle en Mongo).
    customerId: {
      type: String,
      ref: "Customer",
      required: true,
      index: true,
    },

    // Statut Paddle brut : active | trialing | past_due | paused | canceled
    status: {
      type: String,
      enum: ["active", "trialing", "past_due", "paused", "canceled"],
      required: true,
    },

    priceId: {
      type: String,
      default: null,
    },

    productId: {
      type: String,
      default: null,
    },

    // Changement programmé (cancel/pause/resume + date d'effet).
    // N'affecte PAS `status` ni la politique d'accès : seul le statut réel.
    scheduledChangeAction: {
      type: String,
      enum: ["cancel", "pause", "resume"],
      default: null,
    },

    scheduledChangeAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);