// app/components/ActivateButton.jsx
"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";

/**
 * Lance le paiement via /api/paddle/checkout : la route crée la
 * transaction côté serveur et renvoie l'URL du checkout hébergé Paddle.
 * (Les codes promo se saisissent directement sur la page de checkout
 * Paddle, qui les gère nativement.)
 */
export default function ActivateButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleActivate() {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/paddle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        setIsLoading(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError("Impossible de contacter le serveur.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleActivate}
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold bg-slate-900 hover:bg-slate-800 transition disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        {isLoading ? "Redirection vers le paiement..." : "Activer mon site"}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
