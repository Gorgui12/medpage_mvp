// app/components/form-fields.jsx
"use client";

export function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 transition"
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className="w-full px-4 py-3 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300 transition resize-none"
    />
  );
}
