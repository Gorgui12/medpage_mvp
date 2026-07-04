// app/components/dashboard/TrialBanner.jsx
"use client";

import Link from "next/link";
import { Clock, AlertTriangle } from "lucide-react";

/**
 * Bandeau affiché en haut du dashboard pendant le trial.
 * Reçoit daysRemaining depuis le Server Component (calculé avec trialDaysRemaining).
 */
export default function TrialBanner({ daysRemaining }) {
  if (daysRemaining <= 0) {
    return (
      <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Votre essai gratuit a expiré. Votre site n'est plus visible.
        </div>
        <Link
          href="/dashboard/abonnement"
          className="text-xs font-semibold bg-white text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition shrink-0"
        >
          Activer maintenant
        </Link>
      </div>
    );
  }

  const isUrgent = daysRemaining <= 3;

  return (
    <div
      className={`px-6 py-3 flex items-center justify-between gap-4 flex-wrap ${
        isUrgent ? "bg-amber-500 text-white" : "bg-teal-600 text-white"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock className="h-4 w-4 shrink-0" />
        {isUrgent
          ? `Plus que ${daysRemaining} jour${daysRemaining > 1 ? "s" : ""} d'essai — activez votre site avant l'expiration.`
          : `Essai gratuit en cours — ${daysRemaining} jours restants.`}
      </div>
      <Link
        href="/dashboard/abonnement"
        className="text-xs font-semibold bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition shrink-0"
        style={{ color: isUrgent ? "#D97706" : "#0D9488" }}
      >
        Activer mon site
      </Link>
    </div>
  );
}
