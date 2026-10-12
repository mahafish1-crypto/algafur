"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import YouTubeLeadsNav from "@/components/admin/YouTubeLeadsNav";
import { YOUTUBE_LEAD_STATUSES } from "@/lib/youtube-leads";
import { buildCanonicalUrl } from "@/lib/site-url";
import {
  Users,
  Sparkles,
  CalendarClock,
  CheckCircle2,
  TrendingUp,
  Copy,
  Check,
  ExternalLink,
  Sliders,
  ArrowRight,
  Video,
  FileSpreadsheet,
  Phone,
  Link2,
} from "lucide-react";

interface OverviewFormItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  isActive: boolean;
  campaignName: string | null;
  packageName: string | null;
  submissionsCount: number;
  updatedAt: string;
}

interface OverviewSubmissionItem {
  id: string;
  submissionCode: string;
  formId: string;
  formTitle: string;
  formSlug: string;
  fullName: string;
  phone: string;
  city: string;
  interestedIn: string;
  campaignName: string;
  utmSource: string;
  leadSource: string;
  videoId: string;
  status: string;
  assignedToName: string | null;
  followUpDate: string | null;
  createdAt: string;
}

type DateRangePreset = "ALL" | "TODAY" | "7D" | "30D" | "CUSTOM";

export default function YouTubeLeadsOverviewClient({
  forms,
  submissions,
}: {
  forms: OverviewFormItem[];
  submissions: OverviewSubmissionItem[];
}) {
  const [datePreset, setDatePreset] = useState<DateRangePreset>("ALL");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Quick Tracking Link Generator state
  const [selectedFormSlug, setSelectedFormSlug] = useState(
    forms[0]?.slug || "youtube-lead"
  );
  const [utmCampaign, setUtmCampaign] = useState("ramadan_umrah_2026");
  const [videoInput, setVideoInput] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredSubmissions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    return submissions.filter((sub) => {
      const created = new Date(sub.createdAt);
      if (datePreset === "TODAY") {
        return created >= startOfToday;
      }
      if (datePreset === "7D") {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        return created >= d;
      }
      if (datePreset === "30D") {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        return created >= d;
      }
      if (datePreset === "CUSTOM") {
        if (customStart && created < new Date(customStart)) return false;
        if (customEnd) {
          const end = new Date(customEnd);
          end.setHours(23, 59, 59, 999);
          if (created > end) return false;
        }
        return true;
      }
      return true;
    });
  }, [submissions, datePreset, customStart, customEnd]);

  // Metrics from real database submissions
  const metrics = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const total = filteredSubmissions.length;
    const newLeads = filteredSubmissions.filter(
      (s) => s.status === "NEW"
    ).length;
    const submittedToday = submissions.filter(
      (s) => new Date(s.createdAt) >= startOfToday
    ).length;
    const followUpsPending = filteredSubmissions.filter(
      (s) =>
        s.status === "FOLLOW_UP" ||
        (s.followUpDate &&
          s.status !== "CONVERTED" &&
          s.status !== "CLOSED")
    ).length;
    const converted = filteredSubmissions.filter(
      (s) => s.status === "CONVERTED"
    ).length;
    const closed = filteredSubmissions.filter(
      (s) => s.status === "CLOSED"
    ).length;

    return {
      total,
      newLeads,
      submittedToday,
      followUpsPending,
      converted,
      closed,
    };
  }, [filteredSubmissions, submissions]);

  // Breakdown by Campaign
  const byCampaign = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filteredSubmissions) {
      const key = s.campaignName || "Direct / Unspecified";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredSubmissions]);

  // Breakdown by Form
  const byForm = useMemo(() => {
    const map = new Map<
      string,
      { id: string; title: string; slug: string; count: number }
    >();
    for (const f of forms) {
      map.set(f.id, { id: f.id, title: f.title, slug: f.slug, count: 0 });
    }
    for (const s of filteredSubmissions) {
      const existing = map.get(s.formId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(s.formId, {
          id: s.formId,
          title: s.formTitle,
          slug: s.formSlug,
          count: 1,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [forms, filteredSubmissions]);

  const generatedTrackingUrl = useMemo(() => {
    const basePath =
      selectedFormSlug === "youtube-lead"
        ? "/youtube-lead"
        : `/lead/${selectedFormSlug}`;
    const params = new URLSearchParams();
    params.set("utm_source", "youtube");
    params.set("utm_medium", "video_description");
    if (utmCampaign.trim()) {
      params.set("utm_campaign", utmCampaign.trim());
    }
    if (videoInput.trim()) {
      params.set("video", videoInput.trim());
    }
    return buildCanonicalUrl(basePath, params);
  }, [selectedFormSlug, utmCampaign, videoInput]);

  const handleCopyTrackingUrl = () => {
    navigator.clipboard.writeText(generatedTrackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getStatusBadge = (status: string) => {
    const found = YOUTUBE_LEAD_STATUSES.find((st) => st.value === status);
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
          found?.color || "bg-slate-100 text-slate-700 border-slate-200"
        }`}
      >
        {found?.label || status}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <YouTubeLeadsNav
        title="YouTube Leads Overview"
        subtitle="Real-time analytics, campaign attribution, and recent pilgrim submissions from your YouTube lead forms."
        rightAction={
          <Link
            href="/admin/youtube-leads/forms"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            Manage Lead Forms
          </Link>
        }
      />

      {/* Date Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Date Filter:
          </span>
          {(
            [
              { id: "ALL", label: "All Time" },
              { id: "TODAY", label: "Today" },
              { id: "7D", label: "Last 7 Days" },
              { id: "30D", label: "Last 30 Days" },
              { id: "CUSTOM", label: "Custom Range" },
            ] as { id: DateRangePreset; label: string }[]
          ).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setDatePreset(preset.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                datePreset === preset.id
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {datePreset === "CUSTOM" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
            />
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Submissions
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            {metrics.total}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {metrics.submittedToday} submitted today
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              New Leads
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-700 mt-3">
            {metrics.newLeads}
          </p>
          <p className="text-xs text-slate-500 mt-1">Awaiting first contact</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Submitted Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-700 mt-3">
            {metrics.submittedToday}
          </p>
          <p className="text-xs text-slate-500 mt-1">Since midnight today</p>
        </div>

        <div className="bg-white rounded-2xl border border-purple-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Follow-Ups Pending
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-700 mt-3">
            {metrics.followUpsPending}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Scheduled or Follow-Up status
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Converted / Closed
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-3">
            {metrics.converted}{" "}
            <span className="text-base font-semibold text-slate-400">
              / {metrics.closed} closed
            </span>
          </p>
          <p className="text-xs text-slate-500 mt-1">Confirmed bookings</p>
        </div>
      </div>

      {/* Quick YouTube Tracking Link Builder */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-200 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Video className="w-3.5 h-3.5" />
              YouTube Video Description Link Generator
            </div>
            <h2 className="text-lg font-bold">
              Generate a Trackable YouTube Lead Form Link
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Paste this link into your YouTube video description, pinned
              comment, or QR code to automatically capture campaign & video ID
              attribution.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Target Lead Form
            </label>
            <select
              value={selectedFormSlug}
              onChange={(e) => setSelectedFormSlug(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
            >
              {forms.map((f) => (
                <option key={f.id} value={f.slug} className="text-slate-900">
                  {f.title} (
                  {f.slug === "youtube-lead"
                    ? "/youtube-lead"
                    : `/lead/${f.slug}`}
                  )
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Campaign Name (utm_campaign)
            </label>
            <input
              type="text"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="e.g. ramadan_umrah_2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              YouTube Video URL or ID (optional)
            </label>
            <input
              type="text"
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              placeholder="e.g. https://youtu.be/dQw4w9WgXcQ"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 flex-1 min-w-0 px-2">
            <Link2 className="w-4 h-4 text-amber-400 shrink-0" />
            <code className="text-xs text-amber-200 truncate">
              {generatedTrackingUrl}
            </code>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyTrackingUrl}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied Link!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Campaign Link
                </>
              )}
            </button>
            <a
              href={generatedTrackingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Test
            </a>
          </div>
        </div>
      </div>

      {/* Leads by Campaign & Leads by Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Campaign */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Leads by Campaign
              </h3>
              <p className="text-xs text-slate-500">
                Breakdown by campaign name or UTM campaign parameter
              </p>
            </div>
            <Link
              href="/admin/youtube-leads/responses"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {byCampaign.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No YouTube campaign submissions recorded in this period yet.
            </div>
          ) : (
            <div className="space-y-3">
              {byCampaign.map((item) => {
                const pct =
                  metrics.total > 0
                    ? Math.round((item.count / metrics.total) * 100)
                    : 0;
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[260px]">
                        {item.name}
                      </span>
                      <span className="font-bold text-slate-700">
                        {item.count} leads ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leads by Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Leads by Form
              </h3>
              <p className="text-xs text-slate-500">
                Active & draft lead forms configured in Form Builder
              </p>
            </div>
            <Link
              href="/admin/youtube-leads/forms"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
            >
              Open Builder <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {byForm.map((form) => {
              const formMeta = forms.find((f) => f.id === form.id);
              const isPublished =
                formMeta?.status === "PUBLISHED" && formMeta?.isActive;
              const publicPath =
                form.slug === "youtube-lead"
                  ? "/youtube-lead"
                  : `/lead/${form.slug}`;

              return (
                <div
                  key={form.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {form.title}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPublished
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {isPublished ? "Published" : "Draft / Closed"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      {publicPath}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-base font-extrabold text-slate-900">
                        {form.count}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        Responses
                      </p>
                    </div>
                    <Link
                      href={`/admin/youtube-leads/forms?formId=${form.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent YouTube Lead Submissions
            </h3>
            <p className="text-xs text-slate-500">
              Click any submission to view full question/answer snapshots and
              campaign attribution
            </p>
          </div>
          <Link
            href="/admin/youtube-leads/responses"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            All Responses ({submissions.length})
          </Link>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No YouTube form responses yet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Share your `/youtube-lead` link in your YouTube video descriptions
              to start receiving pilgrim leads.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Pilgrim Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Form</th>
                  <th className="py-3 px-4">Campaign / Source</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSubmissions.slice(0, 12).map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {sub.submissionCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{sub.fullName}</p>
                      {sub.city && (
                        <p className="text-[11px] text-slate-500">{sub.city}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.phone ? (
                        <a
                          href={`tel:${sub.phone}`}
                          className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          {sub.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {sub.formTitle}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">
                        {sub.campaignName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {sub.leadSource}
                        {sub.videoId ? ` • Video: ${sub.videoId}` : ""}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(sub.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(sub.status)}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {sub.assignedToName || (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/youtube-leads/responses/${sub.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold transition-all"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

