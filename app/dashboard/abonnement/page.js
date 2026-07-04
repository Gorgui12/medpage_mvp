// app/dashboard/abonnement/page.js
import { getOwnedSite } from "@/lib/getOwnedSite";
import { redirect } from "next/navigation";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import ActivateButton from "@/app/components/ActivateButton";

const STATUS_INFO = {
  none: {
    icon: AlertCircle,
    color: "text-amber-600 bg-amber-50 border-amber-100",
    label: "Aucun abonnement actif",
  },
  active: {
    icon: CheckCircle2,
    color: "text-teal-600 bg-teal-50 border-teal-100",
    label: "Abonnement actif",
  },
  past_due: {
    icon: AlertCircle,
    color: "text-orange-600 bg-orange-50 border-orange-100",
    label: "Paiement en retard",
  },
  canceled: {
    icon: XCircle,
    color: "text-red-600 bg-red-50 border-red-100",
    label: "Abonnement annulé",
  },
  incomplete: {
    icon: AlertCircle,
    color: "text-amber-600 bg-amber-50 border-amber-100",
    label: "Abonnement incomplet",
  },
};

export default async function SubscriptionPage() {
  const { site } = await getOwnedSite();

  if (!site) {
    redirect("/");
  }

  const status = STATUS_INFO[site.stripeSubscriptionStatus] || STATUS_INFO.none;
  const StatusIcon = status.icon;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Abonnement</h1>
      <p className="text-sm text-slate-500 mb-8">
        Gérez l'activation de votre site et votre abonnement MedPage.
      </p>

      <div className={`rounded-2xl border p-5 flex items-center gap-3 mb-6 ${status.color}`}>
        <StatusIcon className="h-5 w-5 shrink-0" />
        <p className="text-sm font-semibold">{status.label}</p>
      </div>

      {!site.isPublished ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-2">Activer mon site</h2>
          <p className="text-sm text-slate-500 mb-5">
            Votre site est créé mais pas encore visible publiquement. Activez
            votre abonnement pour le mettre en ligne immédiatement.
          </p>
          <ActivateButton />
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-2">Votre site est actif</h2>
          <p className="text-sm text-slate-500">
            Pour toute question concernant votre facturation ou pour annuler
            votre abonnement, contactez le support MedPage.
          </p>
        </div>
      )}
    </div>
  );
}
