// app/dashboard/compte/page.js
import { getOwnedSite } from "@/lib/getOwnedSite";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Subscription from "@/models/Subscription";
import { subscriptionGrantsAccess } from "@/lib/paddleAccess";
import { CheckCircle2, Globe, Mail, ShieldAlert } from "lucide-react";
import ManageSubscriptionButton from "@/app/components/dashboard/ManageSubscriptionButton";

/**
 * Écran Compte : self-service (portail Paddle) pour l'utilisateur connecté.
 *
 * Affiche le customer Paddle résolu côté serveur + son abonnement, puis un
 * bouton qui intègre le portail client Paddle (paiement, annulation,
 * factures) via /api/paddle/portal.
 */
export default async function AccountPage() {
  const session = await auth();
  const { site } = await getOwnedSite();

  if (!session?.user) redirect("/login");
  if (!site) redirect("/");

  await dbConnect();

  // Résolution serveur du customer (jamais fourni par le client).
  const email = String(session.user.email).toLowerCase();
  let customer = await Customer.findOne({ email }).lean();
  if (!customer && site.paddleCustomerId) {
    customer = await Customer.findById(site.paddleCustomerId).lean();
  }

  const subscription = customer
    ? await Subscription.findOne({ customerId: customer._id }).sort({ createdAt: -1 }).lean()
    : null;

  const hasAccess = subscription
    ? subscriptionGrantsAccess(subscription)
    : false;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Compte</h1>
      <p className="text-sm text-slate-500 mb-8">
        Gérez vos coordonnées, votre abonnement et vos factures.
      </p>

      {/* --- Coordonnées --- */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-6">
        <p className="text-sm font-semibold text-slate-800 mb-4">
          Coordonnées du compte
        </p>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2.5 text-slate-600">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            {session.user.email}{" "}
            {customer && (
              <span className="text-xs text-slate-400">{customer._id}</span>
            )}
          </div>
          {site && (
            <div className="flex items-center gap-2.5 text-slate-600">
              <Globe className="h-4 w-4 text-slate-400 shrink-0" />
              {site.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || "medpage.com"}
            </div>
          )}
        </div>
      </div>

      {/* --- Abonnement + accès --- */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-800">Abonnement</p>
          {hasAccess ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accès actif
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              Pas d'accès payant
            </span>
          )}
        </div>

        {subscription ? (
          <div className="text-sm text-slate-600 space-y-2">
            <p>
              Statut :{" "}
              <span className="font-medium text-slate-800">{subscription.status}</span>
            </p>
            {subscription.scheduledChangeAction && (
              <p className="text-xs text-amber-700">
                Changement programmé : {subscription.scheduledChangeAction}
                {subscription.scheduledChangeAt
                  ? ` le ${new Date(subscription.scheduledChangeAt).toLocaleDateString("fr-FR")}`
                  : ""}
              </p>
            )}
            {subscription.priceId && (
              <p className="text-xs text-slate-400">Plan : {subscription.priceId}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Aucun abonnement Paddle encore associé à ce compte.
          </p>
        )}
      </div>

      {/* --- Portail client Paddle --- */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6">
        <p className="text-sm font-semibold text-slate-800 mb-1">
          Portail client MedPage
        </p>
        <p className="text-xs text-slate-500 mb-5">
          Mettez à jour votre moyen de paiement, consultez vos factures ou
          gérez votre abonnement — le tout sur une page hébergée par Paddle.
        </p>
        {customer ? (
          <ManageSubscriptionButton className="bg-slate-900 text-white hover:bg-slate-800" />
        ) : (
          <p className="text-sm text-slate-500">
            Le portail s'ouvrira dès que vous aurez validé un paiement Paddle.
          </p>
        )}
      </div>
    </div>
  );
}