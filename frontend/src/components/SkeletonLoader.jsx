import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-slate-800 animate-shimmer" />
            <div className="w-20 h-5 rounded-full bg-slate-800 animate-shimmer" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-slate-800 rounded animate-shimmer" />
            <div className="h-4 w-1/2 bg-slate-800/60 rounded animate-shimmer" />
          </div>
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <div className="h-4 w-24 bg-slate-800/60 rounded animate-shimmer" />
            <div className="h-8 w-20 bg-slate-800 rounded-lg animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkspaceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-slate-800 rounded animate-shimmer" />
            <div className="h-4 w-40 bg-slate-800/60 rounded animate-shimmer" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-slate-800 rounded-xl animate-shimmer" />
            <div className="h-10 w-28 bg-slate-800 rounded-xl animate-shimmer" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/60">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-16 bg-slate-800/60 rounded animate-shimmer" />
              <div className="h-5 w-24 bg-slate-800 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 animate-shimmer" />
            <div className="space-y-1 flex-1">
              <div className="h-3 w-16 bg-slate-800/60 rounded animate-shimmer" />
              <div className="h-6 w-12 bg-slate-800 rounded animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div className="h-6 w-48 bg-slate-800 rounded animate-shimmer" />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 flex items-center justify-between"
          >
            <div className="h-4 w-3/4 bg-slate-800 rounded animate-shimmer" />
            <div className="h-6 w-20 bg-slate-800 rounded-full animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
