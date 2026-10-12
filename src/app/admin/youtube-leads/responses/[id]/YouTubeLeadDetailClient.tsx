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
        {/* Left 7 Cols: Question & Answer Snapshot + Attribution */}
        <div className="lg:col-span-7 space-y-6">
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
