// app/components/dashboard/ManageSubscriptionButton.jsx
"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

/**
 * Ouvre le portail client Paddle (moyen de paiement, annulation, factures).
 *
 * POST /api/paddle/portal : le serveur vérifie l'authentification, résout
 * l'ID customer Paddle depuis la session et redirige en 303 vers l'URL
 * authentifiée du portail. Le client se contente de suivre la redirection.
 */
export default function ManageSubscriptionButton({ className = "" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleOpen() {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/paddle/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      // Le serveur répond par une redirection 303 vers le portail : on la suit.
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error || "Une erreur est survenue.");
      setIsLoading(false);
    } catch (err) {
      setError("Impossible de contacter le serveur.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleOpen}
        disabled={isLoading}
        className={`inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold transition disabled:opacity-60 ${className}`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ExternalLink className="h-4 w-4" />
        )}
        {isLoading ? "Ouverture du portail..." : "Gérer mon abonnement et mes factures"}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}