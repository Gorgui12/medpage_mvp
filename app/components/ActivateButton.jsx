// app/components/ActivateButton.jsx
"use client";

import { useState } from "react";
import { Loader2, CreditCard, Tag } from "lucide-react";

export default function ActivateButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const [error, setError] = useState(null);

  async function handleActivate() {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: promoCode.trim() || null }),
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
      {/* --- Champ code promo optionnel --- */}
      {showPromo ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Code promo (ex: MEDPAGE50)"
            className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPromo(true)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition"
        >
          <Tag className="h-3.5 w-3.5" />
          J'ai un code promo
        </button>
      )}

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

