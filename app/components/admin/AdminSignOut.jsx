// app/components/admin/AdminSignOut.jsx
"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function AdminSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-800 hover:text-slate-100 transition w-full"
    >
      <LogOut className="h-4 w-4" />
      Déconnexion
    </button>
  );
}
