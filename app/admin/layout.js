// app/admin/layout.js
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, TrendingUp, LogOut } from "lucide-react";
import AdminSignOut from "@/app/components/admin/AdminSignOut";

const NAV = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/revenus", label: "Revenus", icon: TrendingUp },
];

export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* --- Sidebar --- */}
      <aside className="w-56 shrink-0 border-r border-slate-800 flex flex-col">
        <div className="px-5 py-6">
          <p className="font-bold text-slate-100">MedPage</p>
          <p className="text-xs text-slate-500 mt-0.5">Admin</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <AdminSignOut />
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
