// lib/paddle.js

/**
 * Client minimal pour l'API Paddle Billing.
 *
 * - Auth : Bearer PADDLE_API_KEY (clé côté serveur uniquement).
 * - Environnement : sandbox par défaut (NEXT_PUBLIC_PADDLE_ENVIRONMENT
 *   = "production" pour basculer sur l'API de production).
 * - Toutes les réponses Paddle ont l'enveloppe { data, meta?, error? } :
 *   on renvoie `data` en cas de succès, on throw avec le message d'erreur
 *   Paddle sinon.
 *
 * La validation des credentials est volontairement paresseuse (au moment
 * de l'appel) pour ne pas faire planter le build/dev quand les clés ne
 * sont pas encore configurées — contrairement à l'ancien lib/stripe.js
 * qui jetait à l'import.
 */

const BASE_URLS = {
  sandbox: "https://sandbox-api.paddle.com",
  production: "https://api.paddle.com",
};

function getBaseUrl() {
  const env =
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
      ? "production"
      : "sandbox";
  return BASE_URLS[env];
}

export async function paddleRequest(path, options = {}) {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "PADDLE_API_KEY manquant. Ajoute-la dans .env.local (clé serveur Paddle Billing)."
    );
  }

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // Le body peut être vide sur certaines réponses : on tolère un JSON absent.
  let json = null;
  try {
    json = await res.json();
  } catch {
    // réponse non-JSON -> traitée comme erreur ci-dessous si !res.ok
  }

  if (!res.ok || (json && json.error)) {
    const detail =
      json?.error?.detail ||
      json?.error?.message ||
      `Erreur API Paddle (HTTP ${res.status})`;
    const code = json?.error?.code ? ` [${json.error.code}]` : "";
    throw new Error(`${detail}${code}`);
  }

  return json?.data;
}
