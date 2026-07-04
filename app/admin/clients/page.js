// app/admin/clients/page.js
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";
import User from "@/models/User";
import { getSiteStatus, trialDaysRemaining } from "@/lib/siteAccess";
import { serializeMongoose } from "@/lib/serialize";
import AdminClientActions from "@/app/components/admin/AdminClientActions";

const STATUS_LABELS = {
  active: { label: "Payant", color: "text-teal-400 bg-teal-400/10" },
  trial: { label: "Trial", color: "text-amber-400 bg-amber-400/10" },
  expired: { label: "Expiré", color: "text-red-400 bg-red-400/10" },
  revoked: { label: "Révoqué", color: "text-slate-500 bg-slate-500/10" },
  inactive: { label: "Inactif", color: "text-slate-500 bg-slate-500/10" },
};

export default async function AdminClientsPage() {
  await dbConnect();

  const sites = await Site.find()
    .sort({ createdAt: -1 })
    .populate("userId", "email fullName")
    .lean();

  // Sérialiser pour éviter les erreurs de sérialisation Mongoose
  const serializedSites = sites.map(serializeMongoose);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Clients</h1>
      <p className="text-sm text-slate-500 mb-8">{serializedSites.length} sites créés</p>

      <div className="overflow-x-auto rounded-2xl border border-slate-700/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50 text-left">
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Médecin</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Site</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Trial</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Inscrit le</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {serializedSites.map((site) => {
              const status = getSiteStatus(site);
              const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.inactive;
              const daysLeft = trialDaysRemaining(site);
              const user = site.userId;

              return (
                <tr key={site._id} className="hover:bg-slate-800/30 transition">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-200">Dr. {site.doctorName}</p>
                    <p className="text-xs text-slate-500">{user?.email || "—"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-slate-300 font-mono text-xs">{site.subdomain}</p>
                    <p className="text-xs text-slate-500">{site.specialty} · {site.city}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {status === "trial" ? `J-${daysLeft}` : status === "expired" ? "Expiré" : "—"}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(site.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-4">
                    <AdminClientActions
                      siteId={site._id}
                      subdomain={site.subdomain}
                      isPublished={site.isPublished}
                      trialRevoked={site.trialRevoked}
                      status={status}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
