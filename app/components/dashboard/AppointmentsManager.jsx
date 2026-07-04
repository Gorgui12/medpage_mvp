// app/components/dashboard/AppointmentsManager.jsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, Phone, Mail, Calendar, MessageSquare } from "lucide-react";

const STATUS_LABELS = {
  new: "Nouvelle",
  contacted: "Contacté",
  confirmed: "Confirmé",
  cancelled: "Annulé",
};

const STATUS_COLORS = {
  new: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  confirmed: "bg-teal-100 text-teal-700",
  cancelled: "bg-slate-100 text-slate-500",
};

const FILTERS = [
  { id: "all", label: "Toutes" },
  { id: "new", label: "Nouvelles" },
  { id: "contacted", label: "Contactées" },
  { id: "confirmed", label: "Confirmées" },
  { id: "cancelled", label: "Annulées" },
];

export default function AppointmentsManager() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/appointments/list");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Erreur chargement RDV :", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(appointmentId, status) {
    setUpdatingId(appointmentId);
    try {
      const res = await fetch("/api/appointments/update-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === appointmentId ? { ...a, status } : a))
        );
      }
    } catch (err) {
      console.error("Erreur mise à jour statut :", err);
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      {/* --- Filtres --- */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === f.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-16">
          Aucune demande de rendez-vous {filter !== "all" && `dans cette catégorie`} pour l'instant.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <div key={appt._id} className="bg-white border border-slate-100 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-slate-800">{appt.patientName}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {appt.patientPhone}
                    </span>
                    {appt.patientEmail && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {appt.patientEmail}
                      </span>
                    )}
                    {appt.preferredDate && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {appt.preferredDate}
                      </span>
                    )}
                  </div>
                  {appt.reason && (
                    <p className="text-sm text-slate-600 mt-2 inline-flex items-start gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
                      {appt.reason}
                    </p>
                  )}
                </div>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[appt.status]}`}
                >
                  {STATUS_LABELS[appt.status]}
                </span>
              </div>

              {/* --- Actions de changement de statut --- */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => updateStatus(appt._id, key)}
                    disabled={updatingId === appt._id || appt.status === key}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition disabled:opacity-40 ${
                      appt.status === key
                        ? "border-slate-300 bg-slate-50 text-slate-400"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
