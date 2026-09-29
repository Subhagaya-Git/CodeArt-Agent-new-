export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-600 animate-spin"></div>
      </div>
      {label && <p className="text-sm text-slate-400 mt-3">{label}</p>}
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton w-3/4" />
        <div className="h-3 skeleton w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 skeleton w-16" />
          <div className="h-5 skeleton w-12" />
        </div>
      </div>
    </div>
  );
}
