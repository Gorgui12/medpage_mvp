// app/components/form-steps/StepServices.jsx
"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea } from "../form-fields";

const MAX_SERVICES = 12;

export default function StepServices({ form, onChange }) {
  const services = form.services;

  function addService() {
    if (services.length >= MAX_SERVICES) return;
    onChange("services", [...services, { title: "", description: "" }]);
  }

  function updateService(index, field, value) {
    const next = [...services];
    next[index] = { ...next[index], [field]: value };
    onChange("services", next);
  }

  function removeService(index) {
    const next = [...services];
    next.splice(index, 1);
    onChange("services", next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Listez les principaux services ou actes que vous proposez.
        </p>
        <span className="text-xs text-slate-400">
          {services.length} / {MAX_SERVICES}
        </span>
      </div>

      {services.length === 0 && (
        <p className="text-sm text-slate-400 italic py-4 text-center border border-dashed border-slate-200 rounded-lg">
          Aucun service ajouté pour l'instant.
        </p>
      )}

      <div className="space-y-3">
        {services.map((service, index) => (
          <div
            key={index}
            className="border border-slate-200 rounded-xl p-4 space-y-3 relative"
          >
            <button
              type="button"
              onClick={() => removeService(index)}
              className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition"
              aria-label="Supprimer ce service"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <Input
              value={service.title}
              onChange={(e) => updateService(index, "title", e.target.value)}
              placeholder="Ex: Consultation générale"
              maxLength={80}
              className="pr-8"
            />
            <Textarea
              value={service.description}
              onChange={(e) => updateService(index, "description", e.target.value)}
              placeholder="Courte description du service (optionnel)"
              rows={2}
              maxLength={300}
            />
          </div>
        ))}
      </div>

      {services.length < MAX_SERVICES && (
        <button
          type="button"
          onClick={addService}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition"
        >
          <Plus className="h-4 w-4" />
          Ajouter un service
        </button>
      )}
    </div>
  );
}
