// app/admin/page.js
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import { getSiteStatus } from "@/lib/siteAccess";
import { serializeMongoose } from "@/lib/serialize";

async function getAdminStats() {
  await dbConnect();

  const [totalUsers, totalSites, totalAppointments, allSites] = await Promise.all([
    User.countDocuments(),
    Site.countDocuments(),
    Appointment.countDocuments(),
    Site.find().select("isPublished stripeSubscriptionStatus trialEndsAt trialRevoked stripeCustomerId").lean(),
  ]);

  // Sérialiser les sites pour éviter les erreurs de sérialisation
  const serializedSites = allSites.map(serializeMongoose);

  let activePaying = 0;
  let inTrial = 0;
  let expired = 0;

  for (const site of serializedSites) {
    const status = getSiteStatus(site);
    if (status === "active") activePaying++;
    else if (status === "trial") inTrial++;
    else if (status === "expired") expired++;
  }

  // MRR estimé (29€/mois × abonnements actifs)
  const PRICE_EUR = 29;
  const mrr = activePaying * PRICE_EUR;

  return { totalUsers, totalSites, totalAppointments, activePaying, inTrial, expired, mrr };
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const kpis = [
    { label: "Comptes créés", value: stats.totalUsers, sub: "médecins inscrits" },
    { label: "Sites générés", value: stats.totalSites, sub: "total" },
    { label: "Abonnements actifs", value: stats.activePaying, sub: "clients payants", highlight: true },
    { label: "MRR estimé", value: `${stats.mrr} €`, sub: "revenu mensuel récurrent", highlight: true },
    { label: "En essai gratuit", value: stats.inTrial, sub: "en cours de trial" },
    { label: "Trials expirés", value: stats.expired, sub: "non convertis" },
    { label: "Total RDV reçus", value: stats.totalAppointments, sub: "via les sites clients" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Vue d'ensemble</h1>
      <p className="text-sm text-slate-500 mb-8">Tableau de bord propriétaire MedPage</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-2xl p-5 ${
              kpi.highlight
                ? "bg-teal-500/10 border border-teal-500/20"
                : "bg-slate-800/60 border border-slate-700/50"
            }`}
          >
            <p className="text-xs font-medium text-slate-400 mb-1">{kpi.label}</p>
            <p className={`text-3xl font-bold ${kpi.highlight ? "text-teal-400" : "text-slate-100"}`}>
              {kpi.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
