// app/dashboard/rendez-vous/page.js
import AppointmentsManager from "@/app/components/dashboard/AppointmentsManager";

export default function AppointmentsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Rendez-vous</h1>
      <p className="text-sm text-slate-500 mb-8">
        Gérez les demandes de rendez-vous reçues depuis votre site.
      </p>
      <AppointmentsManager />
    </div>
  );
}
