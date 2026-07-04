// app/dashboard/layout.js
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getOwnedSite } from "@/lib/getOwnedSite";
import { trialDaysRemaining, getSiteStatus } from "@/lib/siteAccess";
import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";
import TrialBanner from "@/app/components/dashboard/TrialBanner";

export default async function DashboardLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { site } = await getOwnedSite();
  const status = site ? getSiteStatus(site) : null;
  const daysRemaining = site ? trialDaysRemaining(site) : 0;

  // On affiche le bandeau si le site est en trial (actif ou expiré)
  // mais pas si l'abonnement payant est déjà actif.
  const showTrialBanner = status === "trial" || status === "expired";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {showTrialBanner && <TrialBanner daysRemaining={daysRemaining} />}
      <div className="flex flex-1">
        <DashboardSidebar userEmail={session.user.email} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
