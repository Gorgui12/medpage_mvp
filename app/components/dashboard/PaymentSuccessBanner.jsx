// app/components/dashboard/PaymentSuccessBanner.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

export default function PaymentSuccessBanner() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  // Auto-fermeture après 6 secondes + nettoyage du paramètre URL
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      router.replace("/dashboard");
    }, 6000);
    return () => clearTimeout(timer);
  }, [router]);

  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 mb-6">
      <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-teal-800 text-sm">
          Paiement confirmé — votre site est maintenant en ligne !
        </p>
        <p className="text-xs text-teal-600 mt-0.5">
          Partagez votre lien à vos patients dès maintenant.
        </p>
      </div>
      <button
        onClick={() => { setVisible(false); router.replace("/dashboard"); }}
        className="text-teal-400 hover:text-teal-700 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
