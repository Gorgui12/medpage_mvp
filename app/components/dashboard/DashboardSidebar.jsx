// app/components/dashboard/DashboardSidebar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarCheck,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/dashboard/rendez-vous", label: "Rendez-vous", icon: CalendarCheck },
  { href: "/dashboard/site", label: "Mon site", icon: Settings },
  { href: "/dashboard/abonnement", label: "Abonnement", icon: CreditCard },
];

export default function DashboardSidebar({ userEmail }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const content = (
    <>
      <div className="px-5 py-6">
        <p className="text-lg font-bold text-slate-900">MedPage</p>
        <p className="text-xs text-slate-400 truncate mt-0.5">{userEmail}</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition w-full"
        >
          <LogOut className="h-4.5 w-4.5" />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* --- Sidebar desktop --- */}
      <aside className="hidden md:flex flex-col w-60 border-r border-slate-100 bg-white shrink-0">
        {content}
      </aside>

      {/* --- Header mobile avec menu déroulant --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 flex items-center justify-between px-4 py-3">
        <p className="font-bold text-slate-900">MedPage</p>
        <button onClick={() => setIsMobileOpen((open) => !open)} className="p-2">
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-16 flex flex-col">
          {content}
        </div>
      )}
      {/* Espaceur pour compenser le header mobile fixed */}
      <div className="md:hidden h-14 shrink-0" />
    </>
  );
}
