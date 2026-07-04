// lib/stripe.js
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Merci de définir STRIPE_SECRET_KEY dans .env.local");
}

// Instance unique de Stripe réutilisée dans toute l'app
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});
