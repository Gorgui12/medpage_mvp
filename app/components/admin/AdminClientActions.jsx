// app/components/admin/AdminClientActions.jsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function AdminClientActions({ siteId, subdomain, isPublished, trialRevoked, status }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function callAction(action) {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/site-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, action }),
      });
      const data = await res.json();
      setMessage(res.ok ? "✓" : data.error || "Erreur");
      if (res.ok) setTimeout(() => window.location.reload(), 800);
    } catch {
      setMessage("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin text-slate-400" />;

  return (
    <div className="flex items-center gap-2">
      {/* Prolonger le trial de 7 jours */}
      {(status === "trial" || status === "expired") && (
        <button
          onClick={() => callAction("extend_trial")}
          className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition"
        >
          +7j
        </button>
      )}

      {/* Activer manuellement (sans paiement) */}
      {!isPublished && (
        <button
          onClick={() => callAction("activate")}
          className="text-xs px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition"
        >
          Activer
        </button>
      )}

      {/* Désactiver */}
      {isPublished && (
        <button
          onClick={() => callAction("deactivate")}
          className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
        >
          Désactiver
        </button>
      )}

      {/* Révoquer le trial */}
      {!trialRevoked && status === "trial" && (
        <button
          onClick={() => callAction("revoke_trial")}
          className="text-xs px-2.5 py-1 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 transition"
        >
          Révoquer
        </button>
      )}

      {message && <span className="text-xs text-slate-400">{message}</span>}
    </div>
  );
}
