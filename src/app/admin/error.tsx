"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-950 border border-red-900/40 rounded-3xl p-8 text-center shadow-xl space-y-5">
        <div className="w-14 h-14 bg-red-950/60 border border-red-800 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-serif font-bold text-white">
            Administrative Action Error
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {error?.message ||
              "An unexpected error occurred while loading this section of the management console."}
          </p>
        </div>

        {error?.digest && (
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-500 font-mono">
            Digest: {error.digest}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-gold-500 text-forest-950 font-bold text-xs rounded-xl shadow-gold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

