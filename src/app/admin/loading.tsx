export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-800 rounded"></div>
          <div className="h-8 w-64 bg-slate-800 rounded-lg"></div>
          <div className="h-3 w-80 bg-slate-850 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-28 bg-slate-800 rounded-xl"></div>
          <div className="h-10 w-36 bg-slate-800 rounded-xl"></div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-800 rounded"></div>
              <div className="h-5 w-5 bg-slate-800 rounded-full"></div>
            </div>
            <div className="h-8 w-28 bg-slate-800 rounded-lg"></div>
            <div className="h-2.5 w-36 bg-slate-850 rounded"></div>
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-950 p-6 rounded-3xl border border-slate-850 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-850">
            <div className="h-5 w-40 bg-slate-800 rounded"></div>
            <div className="h-3 w-20 bg-slate-850 rounded"></div>
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 w-full bg-slate-900/60 rounded-xl border border-slate-850/50"
              ></div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-950 p-6 rounded-3xl border border-slate-850 space-y-4">
          <div className="h-5 w-32 bg-slate-800 rounded"></div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 w-full bg-slate-900 rounded-2xl border border-slate-850"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

