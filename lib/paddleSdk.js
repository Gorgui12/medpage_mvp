// lib/paddleSdk.js

import { Paddle, Environment } from "@paddle/paddle-node-sdk";

/**
 * Client Paddle partagé (Node SDK officiel).
 *
 * - Auth : Bearer PADDLE_API_KEY (clé côté serveur uniquement).
 * - Environnement : sandbox par défaut (NEXT_PUBLIC_PADDLE_ENVIRONMENT
 *   = "production" pour basculer sur l'API de production).
 *
 * La validation des credentials est volontairement paresseuse : le client
 * n'est construit qu'à l'appel, pour ne pas faire planter le build/dev
 * quand les clés ne sont pas encore configurées (même philosophie que
 * lib/paddle.js). Une erreur de clé est levée par le SDK lui-même à
 * l'exécution.
 */
export function getPaddle() {
  const apiKey = process.env.PADDLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "PADDLE_API_KEY manquant. Ajoute-la dans .env.local (clé serveur Paddle Billing)."
    );
  }

  const environment =
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
      ? Environment.production
      : Environment.sandbox;

  return new Paddle(apiKey, { environment });
}