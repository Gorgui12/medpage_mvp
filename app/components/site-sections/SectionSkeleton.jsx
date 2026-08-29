// app/components/site-sections/SectionSkeleton.jsx
export default function SectionSkeleton() {
  return (
    <section
      className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-100 animate-pulse"
      aria-hidden="true"
    >
      <div className="h-3 w-20 bg-slate-200 rounded-full mx-auto mb-4" />
      <div className="h-7 w-56 bg-slate-200 rounded-lg mx-auto mb-10" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-100 p-6">
            <div className="h-10 w-10 bg-slate-200 rounded-xl mb-4" />
            <div className="h-4 w-3/4 bg-slate-200 rounded mb-3" />
            <div className="h-3 w-full bg-slate-200 rounded mb-2" />
            <div className="h-3 w-2/3 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}
