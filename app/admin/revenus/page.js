// app/admin/revenus/page.js
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";
import { getSiteStatus } from "@/lib/siteAccess";
import { serializeMongoose } from "@/lib/serialize";

const PRICE_EUR = 29; // prix mensuel en euros

async function getRevenueStats() {
  await dbConnect();

  const sites = await Site.find()
    .select("isPublished stripeSubscriptionStatus trialEndsAt trialRevoked createdAt")
    .lean();

  // Sérialiser les sites pour éviter les erreurs de sérialisation
  const serializedSites = sites.map(serializeMongoose);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  let activePaying = 0;
  let newThisMonth = 0;
  let churned = 0;

  const conversionByMonth = {};

  for (const site of serializedSites) {
    const status = getSiteStatus(site);

    if (status === "active") {
      activePaying++;
      const created = new Date(site.createdAt);
      if (created >= startOfMonth) newThisMonth++;

      // Regrouper les activations par mois pour le graphique
      const monthKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
      conversionByMonth[monthKey] = (conversionByMonth[monthKey] || 0) + 1;
    }

    if (status === "expired" || site.stripeSubscriptionStatus === "canceled") {
      churned++;
    }
  }

  const mrr = activePaying * PRICE_EUR;
  const arr = mrr * 12;

  // Taux de conversion : payants / total inscrits
  const conversionRate = serializedSites.length > 0
    ? ((activePaying / serializedSites.length) * 100).toFixed(1)
    : 0;

  // Taux de churn : annulés / total
  const churnRate = serializedSites.length > 0
    ? ((churned / serializedSites.length) * 100).toFixed(1)
    : 0;

  return {
    mrr,
    arr,
    activePaying,
    newThisMonth,
    churned,
    conversionRate,
    churnRate,
    conversionByMonth,
  };
}

export default async function AdminRevenuePage() {
  const stats = await getRevenueStats();

  const metrics = [
    { label: "MRR", value: `${stats.mrr} €`, sub: "revenu mensuel récurrent", highlight: true },
    { label: "ARR", value: `${stats.arr} €`, sub: "revenu annuel projeté", highlight: true },
    { label: "Clients payants", value: stats.activePaying, sub: "abonnements actifs" },
    { label: "Nouveaux ce mois", value: stats.newThisMonth, sub: "conversions récentes" },
    { label: "Taux de conversion", value: `${stats.conversionRate}%`, sub: "inscrits → payants" },
    { label: "Churn", value: `${stats.churnRate}%`, sub: "annulations cumulées" },
  ];

  const monthKeys = Object.keys(stats.conversionByMonth).sort().slice(-6);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Revenus</h1>
      <p className="text-sm text-slate-500 mb-8">
        Basé sur {PRICE_EUR}€/mois × abonnements actifs
      </p>

      {/* --- KPIs --- */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`rounded-2xl p-5 ${
              m.highlight
                ? "bg-teal-500/10 border border-teal-500/20"
                : "bg-slate-800/60 border border-slate-700/50"
            }`}
          >
            <p className="text-xs font-medium text-slate-500 mb-1">{m.label}</p>
            <p className={`text-3xl font-bold ${m.highlight ? "text-teal-400" : "text-slate-100"}`}>
              {m.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* --- Conversions par mois --- */}
      {monthKeys.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-6">
            Nouvelles conversions (6 derniers mois)
          </h2>
          <div className="flex items-end gap-3 h-40">
            {monthKeys.map((key) => {
              const count = stats.conversionByMonth[key] || 0;
              const max = Math.max(...monthKeys.map((k) => stats.conversionByMonth[k] || 0), 1);
              const heightPct = Math.max((count / max) * 100, 4);

              return (
                <div key={key} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-teal-400">{count}</span>
                  <div
                    className="w-full rounded-t-lg bg-teal-500/40 border border-teal-500/20 transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {key.split("-")[1]}/{key.split("-")[0].slice(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Note sur l'intégration Stripe --- */}
      <p className="text-xs text-slate-600 mt-6">
        Pour des données de facturation précises (remboursements, taxes, disputes),
        consultez directement le{" "}
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-slate-200 underline"
        >
          Dashboard Stripe
        </a>.
      </p>
    </div>
  );
}
