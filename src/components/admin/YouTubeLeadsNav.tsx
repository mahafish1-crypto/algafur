"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileSpreadsheet,
  Sliders,
  Settings,
  ExternalLink,
  Youtube,
} from "lucide-react";

const TABS = [
  {
    name: "Overview",
    href: "/admin/youtube-leads",
    icon: BarChart3,
    exact: true,
  },
  {
    name: "Lead Form Builder",
    href: "/admin/youtube-leads/forms",
    icon: Sliders,
    exact: false,
  },
  {
    name: "Lead Responses",
    href: "/admin/youtube-leads/responses",
    icon: FileSpreadsheet,
    exact: false,
  },
  {
    name: "Form Settings",
    href: "/admin/youtube-leads/settings",
    icon: Settings,
    exact: false,
  },
];

export default function YouTubeLeadsNav({
  title,
  subtitle,
  rightAction,
}: {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}) {
  const pathname = usePathname() || "";

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Youtube className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                YouTube Leads Module
              </span>
              <span className="text-xs text-slate-400">
                Separate from website booking enquiries
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {rightAction}
          <Link
            href="/youtube-lead"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold shadow-xs transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
            Public YouTube Form
          </Link>
        </div>
      </div>

      {/* Sub-navigation bar */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? "text-amber-400" : "text-slate-400"
                }`}
              />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

