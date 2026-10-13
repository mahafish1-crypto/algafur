"use client";

import React, { useState } from "react";
import Link from "next/link";
import YouTubeLeadsNav from "@/components/admin/YouTubeLeadsNav";
import {
  YOUTUBE_LEAD_STATUSES,
  SubmittedAnswerSnapshot,
} from "@/lib/youtube-leads";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  FileText,
  Video,
  UserCheck,
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  Sun,
  Snowflake,
  MapPin,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface DetailSubmission {
  id: string;
  submissionCode: string;
  formId: string;
  formTitle: string;
  formSlug: string;
  formVersion: number;
  packageName: string | null;
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  interestedIn: string;
  travelMonth: string;
  travellersCount: number | null;
  message: string;
  consent: boolean;
  answers: SubmittedAnswerSnapshot[];
  leadSource: string;
  campaignName: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  videoId: string;
  videoUrl: string;
  landingPage: string;
  referrer: string;
  status: string;
  assignedToId: string;
  assignedToName: string | null;
  followUpDate: string;
  internalNotes: string;
  leadScore: number;
  priority: string;
  scoreExplanation?: string;
  priorityOverride?: string | null;
  priorityOverrideReason?: string | null;
  travelTimeline?: string;
  address?: string;
  state?: string;
  district?: string;
  postalCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationSource?: string;
  approxDepartureDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface StaffOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ActivityLogItem {
  id: string;
  action: string;
  createdAt: string;
  userName: string;
  userRole: string;
}

export default function YouTubeLeadDetailClient({
  initialSubmission,
  staffUsers,
  initialLogs,
}: {
  initialSubmission: DetailSubmission;
  staffUsers: StaffOption[];
  initialLogs: ActivityLogItem[];
}) {
  const [submission, setSubmission] =
    useState<DetailSubmission>(initialSubmission);
  const [status, setStatus] = useState(initialSubmission.status);
  const [assignedToId, setAssignedToId] = useState(
    initialSubmission.assignedToId
  );
  const [followUpDate, setFollowUpDate] = useState(
    initialSubmission.followUpDate
      ? initialSubmission.followUpDate.slice(0, 10)
      : ""
  );
  const [internalNotes, setInternalNotes] = useState(
    initialSubmission.internalNotes
  );
  const [priorityOverride, setPriorityOverride] = useState(
    initialSubmission.priorityOverride || ""
  );
  const [priorityOverrideReason, setPriorityOverrideReason] = useState(
    initialSubmission.priorityOverrideReason || ""
  );
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [logs, setLogs] = useState<ActivityLogItem[]>(initialLogs);

  const cleanPhoneForWhatsApp = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedToast(false);

    try {
      const res = await fetch(
        `/api/youtube-leads/submissions/${submission.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            assignedToId: assignedToId || null,
            followUpDate: followUpDate || null,
            internalNotes,
            priorityOverride: priorityOverride || null,
            priorityOverrideReason: priorityOverrideReason || null,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const updated = data.submission;
        const staff = staffUsers.find((u) => u.id === updated.assignedToId);
        setSubmission((prev) => ({
          ...prev,
          status: updated.status,
          assignedToId: updated.assignedToId || "",
          assignedToName: staff?.name || null,
          followUpDate: updated.followUpDate || "",
          internalNotes: updated.internalNotes || "",
          priority: updated.priority || prev.priority,
          priorityOverride: updated.priorityOverride || null,
          priorityOverrideReason: updated.priorityOverrideReason || null,
          updatedAt: updated.updatedAt,
        }));
        setSavedToast(true);
        setLogs((prev) => [
          {
            id: `log_${Date.now()}`,
            action: "UPDATE_YOUTUBE_LEAD",
            createdAt: new Date().toISOString(),
            userName: "Admin",
            userRole: "",
          },
          ...prev,
        ]);
      }
    } finally {
      setSaving(false);
    }
  };

  const statusMeta = YOUTUBE_LEAD_STATUSES.find(
    (s) => s.value === submission.status
  );
  const primaryPhone = submission.phone || submission.whatsapp;
  const waPhone = cleanPhoneForWhatsApp(
    submission.whatsapp || submission.phone
  );

  return (
    <div className="space-y-6 pb-16">
      <YouTubeLeadsNav
        title={`Lead Response: ${submission.submissionCode}`}
        subtitle={`Submitted by ${submission.fullName} on ${new Date(
          submission.createdAt
        ).toLocaleString("en-IN")}`}
        rightAction={
          <Link
            href="/admin/youtube-leads/responses"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Responses
          </Link>
        }
      />

      {/* Pilgrim Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-full bg-slate-900 text-amber-400">
              {submission.submissionCode}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                statusMeta?.color || "bg-slate-100 text-slate-700"
              }`}
            >
              {statusMeta?.label || submission.status}
            </span>
            {submission.priority === "HOT" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                <Flame className="w-3.5 h-3.5 text-rose-600" /> Hot Lead (1st Priority)
              </span>
            ) : submission.priority === "COLD" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-sky-50 text-sky-700 border border-sky-200">
                <Snowflake className="w-3.5 h-3.5 text-sky-600" /> Cold Lead (3rd Priority)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                <Sun className="w-3.5 h-3.5 text-amber-600" /> Warm Lead (2nd Priority)
              </span>
            )}
            <span className="font-mono text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Score: {submission.leadScore ?? 50}/100
            </span>
            {submission.travelTimeline && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                Urgency: {submission.travelTimeline}
              </span>
            )}
            <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              {submission.leadSource}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {submission.fullName}
          </h2>
          <p className="text-xs text-slate-500">
            Form: <strong>{submission.formTitle}</strong> (v
            {submission.formVersion}) • URL:{" "}
            <code>
              {submission.formSlug === "youtube-lead"
                ? "/youtube-lead"
                : `/lead/${submission.formSlug}`}
            </code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {primaryPhone && (
            <a
              href={`tel:${primaryPhone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              Call {primaryPhone}
            </a>
          )}
          {waPhone && (
            <a
              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                `Assalamu Alaikum ${submission.fullName}, JazakAllah Khair for submitting our Al-Gafur YouTube inquiry form (${submission.submissionCode}).`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Pilgrim
            </a>
          )}
          {submission.email && (
            <a
              href={`mailto:${submission.email}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              <Mail className="w-4 h-4" />
              {submission.email}
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Lead Quality Card + Location Card + Question & Answer Snapshot + Attribution */}
        <div className="lg:col-span-7 space-y-6">
          {/* Lead Quality & Priority Scoring Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Lead Quality & Priority Scoring Engine
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                Score: {submission.leadScore ?? 50}/100
              </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Calculated Quality Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {submission.leadScore ?? 50}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">/ 100</span>
                  </div>
                  <div className="w-48 h-2.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        (submission.leadScore ?? 50) >= 70
                          ? "bg-rose-500"
                          : (submission.leadScore ?? 50) >= 40
                          ? "bg-amber-500"
                          : "bg-sky-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(5, submission.leadScore ?? 50)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Assigned Priority Tier
                  </span>
                  {submission.priority === "HOT" ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-xs">
                      <Flame className="w-4 h-4 text-rose-600" /> Hot Lead — 1st Priority
                    </span>
                  ) : submission.priority === "COLD" ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 font-extrabold text-xs">
                      <Snowflake className="w-4 h-4 text-sky-600" /> Cold Lead — 3rd Priority
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-xs">
                      <Sun className="w-4 h-4 text-amber-600" /> Warm Lead — 2nd Priority
                    </span>
                  )}
                </div>
              </div>

              {submission.scoreExplanation && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
                  <span className="font-bold text-emerald-900 block mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    Scoring Factors & Explanation
                  </span>
                  <p className="text-emerald-950 font-medium leading-relaxed">
                    {submission.scoreExplanation}
                  </p>
                </div>
              )}

              {submission.priorityOverride && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs">
                  <span className="font-bold text-purple-900 block">
                    Manual Priority Override Active: {submission.priorityOverride}
                  </span>
                  {submission.priorityOverrideReason && (
                    <p className="text-purple-800 text-[11px] mt-0.5">
                      Reason: {submission.priorityOverrideReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pilgrim Location & GPS Coordinates Card */}
          {(submission.address ||
            submission.latitude ||
            submission.district ||
            submission.state ||
            submission.city) && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Pilgrim Location & GPS Coordinates
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    submission.locationSource === "GPS"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {submission.locationSource === "GPS"
                    ? "📍 GPS Geocoded"
                    : "✏️ Manual Address Entry"}
                </span>
              </div>
              <div className="p-6 space-y-4 text-xs">
                {submission.address && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Full Address
                    </span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {submission.address}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      City / District
                    </span>
                    <span className="font-bold text-slate-800">
                      {submission.district || submission.city || "—"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      State
                    </span>
                    <span className="font-bold text-slate-800">
                      {submission.state || "—"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Postal Code
                    </span>
                    <span className="font-bold text-slate-800">
                      {submission.postalCode || "—"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Country
                    </span>
                    <span className="font-bold text-slate-800">India</span>
                  </div>
                </div>

                {submission.latitude && submission.longitude && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">
                        GPS Coordinates
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {submission.latitude.toFixed(6)},{" "}
                        {submission.longitude.toFixed(6)}
                      </span>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${submission.latitude},${submission.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open in Google
                      Maps
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Every Question & Submitted Answer
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Historical Form Snapshot (v{submission.formVersion})
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {submission.answers.map((ans, index) => {
                const formatted = Array.isArray(ans.value)
                  ? ans.value.join(", ")
                  : typeof ans.value === "boolean"
                    ? ans.value
                      ? "Yes (Consented)"
                      : "No"
                    : ans.value !== null && ans.value !== ""
                      ? String(ans.value)
                      : "— Not provided —";

                return (
                  <div key={`${ans.questionId}_${index}`} className="p-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700">
                        {index + 1}. {ans.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {ans.type}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-sm font-semibold text-slate-900 whitespace-pre-wrap">
                      {formatted}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campaign / UTM / Video Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <Video className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-slate-900">
                YouTube Campaign & UTM Attribution
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">
                  Campaign Name
                </span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {submission.campaignName || submission.utmCampaign || "—"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">
                  Lead Source
                </span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {submission.leadSource}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">
                  UTM Source / Medium
                </span>
                <p className="font-mono text-slate-800 mt-0.5">
                  {submission.utmSource || "—"} / {submission.utmMedium || "—"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">
                  UTM Campaign / Content
                </span>
                <p className="font-mono text-slate-800 mt-0.5">
                  {submission.utmCampaign || "—"} /{" "}
                  {submission.utmContent || "—"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">
                  YouTube Video ID / URL
                </span>
                <p className="font-mono text-slate-800 mt-0.5 break-all">
                  {submission.videoId ||
                    submission.videoUrl ||
                    "Not provided in URL"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">
                  Landing Page & Referrer
                </span>
                <p className="font-mono text-slate-700 mt-0.5 break-all">
                  {submission.landingPage || "—"}
                  {submission.referrer ? ` (${submission.referrer})` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Follow-Up & Activity History */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Update Status & Follow-Up
                </h3>
              </div>
              {savedToast && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved!
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lead Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
              >
                {YOUTUBE_LEAD_STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Staff Member
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white"
              >
                <option value="">— Unassigned —</option>
                {staffUsers.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Follow-Up Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Manual Priority Override */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Manual Priority Override (Optional)
                </span>
                <span className="text-[10px] text-slate-400">
                  Overrides automatic score
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Override Priority Level
                  </label>
                  <select
                    value={priorityOverride}
                    onChange={(e) => setPriorityOverride(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value="">— No Override (Use Calculated) —</option>
                    <option value="HOT">🔥 HOT (First Priority)</option>
                    <option value="WARM">☀️ WARM (Second Priority)</option>
                    <option value="COLD">❄️ COLD (Lower Priority)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Reason for Manual Override
                  </label>
                  <input
                    type="text"
                    value={priorityOverrideReason}
                    onChange={(e) => setPriorityOverrideReason(e.target.value)}
                    placeholder="e.g. VIP client referral, ready to pay token today..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Internal Notes
              </label>
              <textarea
                rows={4}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Record call notes, package quote shared, or pilgrim questions..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold shadow-xs transition-all"
            >
              {saving ? "Saving Changes..." : "Save Follow-Up Update"}
            </button>
          </form>

          {/* Activity History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Activity History
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">
                    Lead Submitted via Public Form ({submission.formTitle})
                  </p>
                  <p className="text-slate-500">
                    {new Date(submission.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">
                      Updated by {log.userName}
                    </p>
                    <p className="text-slate-500">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
