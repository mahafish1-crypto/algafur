"use client";

import React, { useState } from "react";
import Link from "next/link";
import YouTubeLeadsNav from "@/components/admin/YouTubeLeadsNav";
import { buildCanonicalUrl } from "@/lib/site-url";
import {
  Globe,
  Lock,
  ExternalLink,
  Sliders,
  ShieldCheck,
  Bell,
  Copy,
  Check,
  Layers,
  Trash2,
} from "lucide-react";

interface SettingsFormItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  campaignName: string;
  packageName: string | null;
  status: string;
  isActive: boolean;
  isDefault: boolean;
  successTitle: string;
  successMessage: string;
  submitButtonText: string;
  showLogo: boolean;
  version: number;
  submissionsCount: number;
  updatedAt: string;
}

export default function FormSettingsClient({
  initialForms,
}: {
  initialForms: SettingsFormItem[];
}) {
  const [forms, setForms] = useState<SettingsFormItem[]>(initialForms);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleFormLive = async (form: SettingsFormItem) => {
    setUpdatingId(form.id);
    const currentlyLive = form.status === "PUBLISHED" && form.isActive;
    const nextLive = !currentlyLive;

    try {
      const res = await fetch(`/api/youtube-leads/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextLive ? "PUBLISHED" : "DRAFT",
          isActive: nextLive,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setForms((prev) =>
          prev.map((f) =>
            f.id === form.id
              ? {
                  ...f,
                  status: data.form.status,
                  isActive: data.form.isActive,
                  version: data.form.version,
                }
              : f
          )
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrArchiveForm = async (form: SettingsFormItem) => {
    if (form.isDefault) return;
    setUpdatingId(form.id);
    try {
      const res = await fetch(`/api/youtube-leads/forms/${form.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.archived) {
          setForms((prev) =>
            prev.map((f) =>
              f.id === form.id
                ? { ...f, status: "ARCHIVED", isActive: false }
                : f
            )
          );
        } else {
          setForms((prev) => prev.filter((f) => f.id !== form.id));
        }
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const getPublicPath = (slug: string) =>
    slug === "youtube-lead" ? "/youtube-lead" : `/lead/${slug}`;

  const copyPublicUrl = (form: SettingsFormItem) => {
    navigator.clipboard.writeText(buildCanonicalUrl(getPublicPath(form.slug)));
    setCopiedId(form.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      <YouTubeLeadsNav
        title="YouTube Lead Form Settings & Governance"
        subtitle="Manage form publication status, spam protection, notification routing, and separation between YouTube campaign leads and website enquiries."
      />

      {/* All Forms Status & Publication Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Configured Lead Forms & Public Availability
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unpublishing or deactivating a form immediately blocks public
              submissions and displays a polite closed-form message.
            </p>
          </div>
          <Link
            href="/admin/youtube-leads/forms"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            Open Form Builder
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {forms.map((form) => {
            const isLive = form.status === "PUBLISHED" && form.isActive;
            const publicPath = getPublicPath(form.slug);

            return (
              <div
                key={form.id}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">
                      {form.title}
                    </h3>
                    {form.isDefault && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        Default YouTube Form
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isLive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {isLive
                        ? "Published & Accepting Responses"
                        : "Closed / Unpublished"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      v{form.version} • {form.submissionsCount} submissions
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Public URL:{" "}
                    <code className="font-mono text-emerald-700 font-semibold">
                      {publicPath}
                    </code>
                    {form.campaignName
                      ? ` • Campaign: ${form.campaignName}`
                      : ""}
                    {form.packageName ? ` • Package: ${form.packageName}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={updatingId === form.id}
                    onClick={() => toggleFormLive(form)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isLive
                        ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                        : "bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800"
                    }`}
                  >
                    {isLive ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Unpublish / Close Form
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5" />
                        Publish Form
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyPublicUrl(form)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    {copiedId === form.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Link
                      </>
                    )}
                  </button>

                  <Link
                    href={`/admin/youtube-leads/forms?formId=${form.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Edit Questions
                  </Link>

                  <a
                    href={publicPath}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Open Public Form"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {!form.isDefault && (
                    <button
                      type="button"
                      disabled={updatingId === form.id}
                      onClick={() => handleDeleteOrArchiveForm(form)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600"
                      title="Delete or Archive Form"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security, Notification & CRM Separation Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Separate from Website Enquiries
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            YouTube campaign submissions are stored in the dedicated{" "}
            <code>LeadFormSubmission</code> table so they never clutter website
            booking enquiries. You can also view all leads together in{" "}
            <Link
              href="/admin/crm/leads?view=all"
              className="text-emerald-700 font-bold underline"
            >
              Bookings & Enquiries (Combined View)
            </Link>{" "}
            whenever needed.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Instant Admin Notifications
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every valid public form submission creates a deduplicated{" "}
            <code>YOUTUBE_LEAD</code> notification in the Admin header bell and{" "}
            <Link
              href="/admin/notifications"
              className="text-blue-700 font-bold underline"
            >
              Notifications Center
            </Link>{" "}
            linking directly to the submitted response detail.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Anti-Spam & Historical Snapshots
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Public submissions are protected by honeypot fields, IP rate
            limiting, idempotency tokens, and server-side schema validation.
            Question labels and answers are snapshotted at submission time so
            editing a form never breaks older responses.
          </p>
        </div>
      </div>
    </div>
  );
}

