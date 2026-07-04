// app/dashboard/page.js
import { getOwnedSite } from "@/lib/getOwnedSite";
import { redirect } from "next/navigation";
import Appointment from "@/models/Appointment";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ExternalLink,
  CalendarClock,
  CalendarCheck2,
  Globe,
  ArrowRight,
  CheckCircle2,
  Circle,
} from "lucide-react";

// Lazy loading de PaymentSuccessBanner
const PaymentSuccessBanner = dynamic(() => import("@/app/components/dashboard/PaymentSuccessBanner"));

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "medpage.com";

export default async function DashboardOverviewPage({ searchParams }) {
  const { site } = await getOwnedSite();

  if (!site) redirect("/");

  const siteId = site._id?.toString();
  const [newCount, totalCount] = await Promise.all([
    Appointment.countDocuments({ siteId, status: "new" }),
    Appointment.countDocuments({ siteId }),
  ]);

  const params = await searchParams;
  const paymentSuccess = params?.payment === "success";
  const liveUrl = `https://${site.subdomain}.${ROOT_DOMAIN}`;

  // Checklist d'onboarding : étapes clés avec leur état
  const checklist = [
    { label: "Site créé", done: true },
    { label: "Photo de profil ajoutée", done: Boolean(site.profilePhotoUrl) },
    { label: "Présentation rédigée", done: Boolean(site.bio?.trim()) },
    { label: "Services renseignés", done: (site.services?.length || 0) > 0 },
    { label: "Carte Google Maps configurée", done: Boolean(site.mapUrl?.trim()) },
    { label: "Abonnement activé", done: site.isPublished },
  ];

  const completedSteps = checklist.filter((c) => c.done).length;
  const progressPct = Math.round((completedSteps / checklist.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Bannière succès paiement (client component pour s'auto-retirer) */}
      {paymentSuccess && <PaymentSuccessBanner />}

      <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bonjour, Dr. {site.doctorName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Voici un aperçu de votre site et de votre activité.
          </p>
        </div>
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2 transition"
        >
          Voir mon site
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* --- Statut du site --- */}
      <div
        className={`rounded-2xl p-5 mb-6 flex items-center gap-3 ${
          site.isPublished
            ? "bg-teal-50 border border-teal-100"
            : "bg-amber-50 border border-amber-100"
        }`}
      >
        <Globe className={`h-5 w-5 ${site.isPublished ? "text-teal-600" : "text-amber-600"}`} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">
            {site.isPublished ? "Votre site est en ligne" : "Votre site n'est pas encore actif"}
          </p>
          <p className="text-xs text-slate-500">
            {site.isPublished
              ? `Visible sur ${site.subdomain}.${ROOT_DOMAIN}`
              : "Activez votre abonnement pour le rendre visible publiquement."}
          </p>
        </div>
        {!site.isPublished && (
          <Link
            href="/dashboard/abonnement"
            className="text-sm font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1 shrink-0"
          >
            Activer
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* --- Checklist d'onboarding --- */}
      {progressPct < 100 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">
              Complétez votre profil
            </h2>
            <span className="text-xs font-medium text-slate-500">
              {completedSteps}/{checklist.length}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <ul className="space-y-2.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5 text-sm">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                )}
                <span className={item.done ? "text-slate-400 line-through" : "text-slate-700"}>
                  {item.label}
                </span>
                {!item.done && (
                  <Link href="/dashboard/site" className="ml-auto text-xs text-teal-600 hover:underline">
                    Compléter →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- Stats RDV --- */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <StatCard
          icon={<CalendarClock className="h-5 w-5 text-amber-600" />}
          label="Nouvelles demandes"
          value={newCount}
          accent="bg-amber-50"
        />
        <StatCard
          icon={<CalendarCheck2 className="h-5 w-5 text-teal-600" />}
          label="Total des demandes"
          value={totalCount}
          accent="bg-teal-50"
        />
      </div>

      <Link
        href="/dashboard/rendez-vous"
        className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition"
      >
        <div>
          <p className="font-semibold text-slate-800 text-sm">Gérer mes rendez-vous</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Consultez et traitez les demandes de vos patients
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400" />
      </Link>
    </div>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
