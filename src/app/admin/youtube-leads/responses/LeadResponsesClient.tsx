"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import YouTubeLeadsNav from "@/components/admin/YouTubeLeadsNav";
import {
  YOUTUBE_LEAD_STATUSES,
  SubmittedAnswerSnapshot,
} from "@/lib/youtube-leads";
import {
  Search,
  Filter,
  Phone,
  MessageCircle,
  ExternalLink,
  X,
  Calendar,
  UserCheck,
  FileText,
  Clock,
  Video,
  CheckCircle2,
  Download,
  RotateCcw,
} from "lucide-react";

export interface SubmissionRecord {
  id: string;
  submissionCode: string;
  formId: string;
  formTitle: string;
  formSlug: string;
  formVersion: number;
  packageId: string | null;
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

interface FormOption {
  id: string;
  title: string;
  slug: string;
  campaignName: string | null;
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
  user?: { id: string; name: string; role: string } | null;
  newData?: Record<string, unknown> | null;
}

export default function LeadResponsesClient({
  initialSubmissions,
  forms,
  staffUsers,
}: {
  initialSubmissions: SubmissionRecord[];
  forms: FormOption[];
  staffUsers: StaffOption[];
}) {
  const [submissions, setSubmissions] =
    useState<SubmissionRecord[]>(initialSubmissions);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormId, setSelectedFormId] = useState("ALL");
  const [selectedCampaign, setSelectedCampaign] = useState("ALL");
  const [selectedSource, setSelectedSource] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedStaffId, setSelectedStaffId] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modal state for Lead Detail
  const [activeSubmission, setActiveSubmission] =
    useState<SubmissionRecord | null>(null);
  const [modalStatus, setModalStatus] = useState("NEW");
  const [modalAssignedId, setModalAssignedId] = useState("");
  const [modalFollowUpDate, setModalFollowUpDate] = useState("");
  const [modalNotes, setModalNotes] = useState("");
  const [modalSaving, setModalSaving] = useState(false);
  const [modalSavedToast, setModalSavedToast] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Distinct campaigns & sources for filter dropdowns
  const campaignOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of submissions) {
      const c = s.campaignName || s.utmCampaign;
      if (c) set.add(c);
    }
    return Array.from(set).sort();
  }, [submissions]);

  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of submissions) {
      if (s.leadSource) set.add(s.leadSource);
    }
    return Array.from(set).sort();
  }, [submissions]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return submissions.filter((sub) => {
      if (selectedFormId !== "ALL" && sub.formId !== selectedFormId) {
        return false;
      }
      if (selectedCampaign !== "ALL") {
        const camp = sub.campaignName || sub.utmCampaign || "";
        if (camp !== selectedCampaign) return false;
      }
      if (selectedSource !== "ALL" && sub.leadSource !== selectedSource) {
        return false;
      }
      if (selectedStatus !== "ALL" && sub.status !== selectedStatus) {
        return false;
      }
      if (selectedStaffId !== "ALL") {
        if (selectedStaffId === "UNASSIGNED") {
          if (sub.assignedToId) return false;
        } else if (sub.assignedToId !== selectedStaffId) {
          return false;
        }
      }
      if (dateFrom) {
        if (new Date(sub.createdAt) < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(sub.createdAt) > end) return false;
      }

      if (q) {
        const inAnswers = sub.answers.some(
          (a) =>
            a.label.toLowerCase().includes(q) ||
            String(a.value ?? "")
              .toLowerCase()
              .includes(q)
        );
        const matches =
          sub.submissionCode.toLowerCase().includes(q) ||
          sub.fullName.toLowerCase().includes(q) ||
          sub.phone.toLowerCase().includes(q) ||
          sub.whatsapp.toLowerCase().includes(q) ||
          sub.email.toLowerCase().includes(q) ||
          sub.city.toLowerCase().includes(q) ||
          sub.interestedIn.toLowerCase().includes(q) ||
          sub.campaignName.toLowerCase().includes(q) ||
          inAnswers;
        if (!matches) return false;
      }

      return true;
    });
  }, [
    submissions,
    searchQuery,
    selectedFormId,
    selectedCampaign,
    selectedSource,
    selectedStatus,
    selectedStaffId,
    dateFrom,
    dateTo,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedFormId("ALL");
    setSelectedCampaign("ALL");
    setSelectedSource("ALL");
    setSelectedStatus("ALL");
    setSelectedStaffId("ALL");
    setDateFrom("");
    setDateTo("");
  };

  const openDetailModal = async (sub: SubmissionRecord) => {
    setActiveSubmission(sub);
    setModalStatus(sub.status);
    setModalAssignedId(sub.assignedToId || "");
    setModalFollowUpDate(
      sub.followUpDate ? sub.followUpDate.slice(0, 10) : ""
    );
    setModalNotes(sub.internalNotes || "");
    setModalSavedToast(false);
    setLoadingActivity(true);

    try {
      const res = await fetch(`/api/youtube-leads/submissions/${sub.id}`);
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data.activityLogs || []);
      }
    } catch {
      setActivityLogs([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleSaveLeadUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;
    setModalSaving(true);
    setModalSavedToast(false);

    try {
      const res = await fetch(
        `/api/youtube-leads/submissions/${activeSubmission.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: modalStatus,
            assignedToId: modalAssignedId || null,
            followUpDate: modalFollowUpDate || null,
            internalNotes: modalNotes,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const updated = data.submission;
        const staffMember = staffUsers.find(
          (u) => u.id === updated.assignedToId
        );

        const nextRecord: SubmissionRecord = {
          ...activeSubmission,
          status: updated.status,
          assignedToId: updated.assignedToId || "",
          assignedToName: staffMember?.name || null,
          followUpDate: updated.followUpDate || "",
          internalNotes: updated.internalNotes || "",
          updatedAt: updated.updatedAt,
        };

        setSubmissions((prev) =>
          prev.map((item) => (item.id === nextRecord.id ? nextRecord : item))
        );
        setActiveSubmission(nextRecord);
        setModalSavedToast(true);

        // Refresh activity history
        const logRes = await fetch(
          `/api/youtube-leads/submissions/${activeSubmission.id}`
        );
        if (logRes.ok) {
          const logData = await logRes.json();
          setActivityLogs(logData.activityLogs || []);
        }
      }
    } finally {
      setModalSaving(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Lead ID",
      "Full Name",
      "Phone",
      "WhatsApp",
      "Email",
      "City",
      "Interested In",
      "Travel Month",
      "Travellers",
      "Form Name",
      "Campaign",
      "Lead Source",
      "UTM Source",
      "UTM Campaign",
      "Video ID",
      "Status",
      "Assigned Staff",
      "Submitted At",
    ];
    const rows = filteredSubmissions.map((s) => [
      s.submissionCode,
      s.fullName,
      s.phone,
      s.whatsapp,
      s.email,
      s.city,
      s.interestedIn,
      s.travelMonth,
      s.travellersCount ?? "",
      s.formTitle,
      s.campaignName || s.utmCampaign,
      s.leadSource,
      s.utmSource,
      s.utmCampaign,
      s.videoId,
      s.status,
      s.assignedToName || "Unassigned",
      new Date(s.createdAt).toISOString(),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `algafur-youtube-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  const cleanPhoneForWhatsApp = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  return (
    <div className="space-y-6 pb-16">
      <YouTubeLeadsNav
        title="YouTube Lead Responses"
        subtitle="Filter, search, assign staff, schedule follow-ups, and inspect full question/answer snapshots for every YouTube form submission."
        rightAction={
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV ({filteredSubmissions.length})
          </button>
        }
      />

      {/* Comprehensive Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            Filter & Search Responses
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, email, city, Lead ID, or any submitted answer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Form Filter */}
          <div>
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="ALL">All Lead Forms</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  Form: {f.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="ALL">All Statuses</option>
              {YOUTUBE_LEAD_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  Status: {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Filter */}
          <div>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="ALL">All Campaigns</option>
              {campaignOptions.map((c) => (
                <option key={c} value={c}>
                  Campaign: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Lead Source Filter */}
          <div>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="ALL">All Lead Sources</option>
              {sourceOptions.map((src) => (
                <option key={src} value={src}>
                  Source: {src}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Staff Filter */}
          <div>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="ALL">All Staff Assignments</option>
              <option value="UNASSIGNED">Unassigned Leads Only</option>
              {staffUsers.map((st) => (
                <option key={st.id} value={st.id}>
                  Assigned: {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="From Date"
              className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="To Date"
              className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Responses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700">
            Showing{" "}
            <span className="text-emerald-700">
              {filteredSubmissions.length}
            </span>{" "}
            of {submissions.length} YouTube form submissions
          </p>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-slate-700">
              No matching YouTube lead responses found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your filters or share your `/youtube-lead` form link
              to collect new responses.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Lead ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Form Name</th>
                  <th className="py-3.5 px-4">Campaign</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Submission Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Staff</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSubmissions.map((sub) => {
                  const primaryPhone = sub.phone || sub.whatsapp;
                  const waPhone = cleanPhoneForWhatsApp(
                    sub.whatsapp || sub.phone
                  );

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => openDetailModal(sub)}
                      className="hover:bg-emerald-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {sub.submissionCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">
                          {sub.fullName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {[sub.city, sub.interestedIn]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      </td>
                      <td
                        className="py-3.5 px-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {primaryPhone ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${primaryPhone}`}
                              className="font-semibold text-slate-800 hover:text-emerald-700"
                            >
                              {primaryPhone}
                            </a>
                            {waPhone && (
                              <a
                                href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                  `Assalamu Alaikum ${sub.fullName}, this is Al-Gafur Hajj & Umrah regarding your YouTube inquiry (${sub.submissionCode}).`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat on WhatsApp"
                                className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {sub.formTitle}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {sub.campaignName || sub.utmCampaign || (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-semibold text-[11px]">
                          {sub.leadSource}
                        </span>
                        {sub.videoId && (
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                            Video: {sub.videoId}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(sub.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {sub.assignedToName || (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetailModal(sub)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px]"
                          >
                            Inspect
                          </button>
                          <Link
                            href={`/admin/youtube-leads/responses/${sub.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                            title="Open Full Detail Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Response Detail Drawer / Modal */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-3xl h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400">
                    {activeSubmission.submissionCode}
                  </span>
                  {getStatusBadge(activeSubmission.status)}
                  <span className="text-xs text-slate-400">
                    Submitted{" "}
                    {new Date(activeSubmission.createdAt).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1.5">
                  {activeSubmission.fullName}
                </h2>
                <p className="text-xs text-slate-500">
                  Form: <strong>{activeSubmission.formTitle}</strong> (v
                  {activeSubmission.formVersion}) • URL:{" "}
                  <code>
                    {activeSubmission.formSlug === "youtube-lead"
                      ? "/youtube-lead"
                      : `/lead/${activeSubmission.formSlug}`}
                  </code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/youtube-leads/responses/${activeSubmission.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Full Page
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveSubmission(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Quick Call & Quick WhatsApp Bar */}
              <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                {(activeSubmission.phone || activeSubmission.whatsapp) && (
                  <>
                    <a
                      href={`tel:${
                        activeSubmission.phone || activeSubmission.whatsapp
                      }`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      Call{" "}
                      {activeSubmission.phone || activeSubmission.whatsapp}
                    </a>

                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(
                        activeSubmission.whatsapp || activeSubmission.phone
                      )}?text=${encodeURIComponent(
                        `Assalamu Alaikum ${activeSubmission.fullName}, JazakAllah Khair for submitting our Al-Gafur YouTube inquiry form (${activeSubmission.submissionCode}). How can we assist you with your ${
                          activeSubmission.interestedIn || "Hajj / Umrah"
                        } plans?`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp Pilgrim
                    </a>
                  </>
                )}

                {activeSubmission.email && (
                  <a
                    href={`mailto:${activeSubmission.email}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Email: {activeSubmission.email}
                  </a>
                )}
              </div>

              {/* Section 1: Every Question and Submitted Answer (Historical Snapshot) */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Submitted Questions & Answers Snapshot
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Preserved from form v{activeSubmission.formVersion}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {activeSubmission.answers.map((ans, idx) => {
                    const displayValue = Array.isArray(ans.value)
                      ? ans.value.join(", ")
                      : typeof ans.value === "boolean"
                        ? ans.value
                          ? "Yes (Consented)"
                          : "No"
                        : ans.value !== null && ans.value !== ""
                          ? String(ans.value)
                          : "— Not answered —";

                    return (
                      <div
                        key={`${ans.questionId}_${idx}`}
                        className="p-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2"
                      >
                        <div className="sm:w-5/12">
                          <p className="text-xs font-bold text-slate-700">
                            {idx + 1}. {ans.label}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">
                            {ans.type}
                          </span>
                        </div>
                        <div className="sm:w-7/12">
                          <p className="text-sm font-semibold text-slate-900 whitespace-pre-wrap break-words bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/70">
                            {displayValue}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: YouTube Campaign & UTM Attribution Details */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <Video className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Campaign, UTM & YouTube Video Attribution
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Lead Source
                    </span>
                    <span className="font-bold text-slate-900">
                      {activeSubmission.leadSource}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Campaign Name
                    </span>
                    <span className="font-bold text-slate-900">
                      {activeSubmission.campaignName ||
                        activeSubmission.utmCampaign ||
                        "—"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      UTM Source / Medium
                    </span>
                    <span className="font-mono text-slate-800">
                      {activeSubmission.utmSource || "—"} /{" "}
                      {activeSubmission.utmMedium || "—"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      UTM Campaign / Content
                    </span>
                    <span className="font-mono text-slate-800">
                      {activeSubmission.utmCampaign || "—"} /{" "}
                      {activeSubmission.utmContent || "—"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      YouTube Video ID / URL
                    </span>
                    <span className="font-mono text-slate-800 break-all">
                      {activeSubmission.videoId ||
                        activeSubmission.videoUrl ||
                        "Not provided in URL"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Landing Page & Referrer
                    </span>
                    <span className="font-mono text-slate-700 break-all">
                      {activeSubmission.landingPage || "—"}
                      {activeSubmission.referrer
                        ? ` (Ref: ${activeSubmission.referrer})`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Lead Management Form (Status, Staff Assignment, Follow-Up Date, Internal Notes) */}
              <form
                onSubmit={handleSaveLeadUpdate}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Lead Status, Staff Assignment & Follow-Up
                    </h3>
                  </div>
                  {modalSavedToast && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Updated successfully
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lead Status
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
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
                      value={modalAssignedId}
                      onChange={(e) => setModalAssignedId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white"
                    >
                      <option value="">— Unassigned —</option>
                      {staffUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Next Follow-Up Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        value={modalFollowUpDate}
                        onChange={(e) => setModalFollowUpDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Internal Team Notes & Follow-Up Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Add call summary, pilgrim budget preferences, room sharing notes, or next follow-up instructions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={modalSaving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    {modalSaving ? "Saving..." : "Save Lead Follow-Up"}
                  </button>
                </div>
              </form>

              {/* Section 4: Activity / Follow-Up History */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Follow-Up & Activity History
                  </h3>
                </div>
                <div className="p-5 space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">
                        Form Submitted via Public YouTube Lead Form
                      </p>
                      <p className="text-slate-500">
                        {new Date(activeSubmission.createdAt).toLocaleString(
                          "en-IN"
                        )}{" "}
                        • Source: {activeSubmission.leadSource}
                      </p>
                    </div>
                  </div>

                  {loadingActivity ? (
                    <p className="text-slate-400">Loading activity history...</p>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">
                            Updated by {log.user?.name || "Admin"}
                          </p>
                          <p className="text-slate-500">
                            {new Date(log.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
