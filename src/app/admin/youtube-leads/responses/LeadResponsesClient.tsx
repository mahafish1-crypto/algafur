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
  Flame,
  Sun,
  Snowflake,
  MapPin,
  ArrowUpDown,
  SlidersHorizontal,
  AlertTriangle,
  Sparkles,
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
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationSource?: string;
  interestedIn: string;
  travelMonth: string;
  travelTimeline?: string;
  approxDepartureDate?: string;
  travellersCount: number | null;
  leadScore: number;
  priority: string;
  scoreExplanation?: string;
  priorityOverride?: string | null;
  priorityOverrideReason?: string | null;
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
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedTimeline, setSelectedTimeline] = useState("ALL");
  const [sortBy, setSortBy] = useState<
    | "RECENT_DESC"
    | "SCORE_DESC"
    | "PRIORITY_DESC"
    | "OLDEST_UNCONTACTED"
    | "TIMELINE_EARLIEST"
    | "OVERDUE_FIRST"
  >("RECENT_DESC");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modal state for Lead Detail
  const [activeSubmission, setActiveSubmission] =
    useState<SubmissionRecord | null>(null);
  const [modalStatus, setModalStatus] = useState("NEW");
  const [modalAssignedId, setModalAssignedId] = useState("");
  const [modalFollowUpDate, setModalFollowUpDate] = useState("");
  const [modalNotes, setModalNotes] = useState("");
  const [modalPriorityOverride, setModalPriorityOverride] = useState("");
  const [modalOverrideReason, setModalOverrideReason] = useState("");
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

  // Summary Counters: Hot, Warm, Cold, New, Due Today, Overdue
  const summaryMetrics = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    let hot = 0;
    let warm = 0;
    let cold = 0;
    let newLeads = 0;
    let dueToday = 0;
    let overdue = 0;

    for (const s of submissions) {
      const p = (s.priority || "WARM").toUpperCase();
      if (p === "HOT") hot++;
      else if (p === "WARM") warm++;
      else if (p === "COLD") cold++;

      if (s.status === "NEW") newLeads++;

      if (s.followUpDate) {
        if (
          s.followUpDate === today &&
          s.status !== "CONVERTED" &&
          s.status !== "CLOSED"
        ) {
          dueToday++;
        } else if (
          s.followUpDate < today &&
          s.status !== "CONVERTED" &&
          s.status !== "CLOSED"
        ) {
          overdue++;
        }
      }
    }

    return {
      hot,
      warm,
      cold,
      newLeads,
      dueToday,
      overdue,
      total: submissions.length,
    };
  }, [submissions]);

  // Filtered & Sorted Submissions
  const filteredSubmissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const today = new Date().toISOString().split("T")[0];

    const filtered = submissions.filter((sub) => {
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
      if (selectedPriority !== "ALL" && sub.priority !== selectedPriority) {
        return false;
      }
      if (selectedTimeline !== "ALL") {
        const tl = (sub.travelTimeline || "").toLowerCase();
        if (!tl.includes(selectedTimeline.toLowerCase())) return false;
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
          (sub.address && sub.address.toLowerCase().includes(q)) ||
          sub.interestedIn.toLowerCase().includes(q) ||
          sub.campaignName.toLowerCase().includes(q) ||
          (sub.travelTimeline && sub.travelTimeline.toLowerCase().includes(q)) ||
          inAnswers;
        if (!matches) return false;
      }

      return true;
    });

    const priorityWeight: Record<string, number> = { HOT: 3, WARM: 2, COLD: 1 };

    return filtered.sort((a, b) => {
      if (sortBy === "SCORE_DESC") {
        return (b.leadScore ?? 0) - (a.leadScore ?? 0);
      }
      if (sortBy === "PRIORITY_DESC") {
        const pDiff =
          (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
        if (pDiff !== 0) return pDiff;
        return (b.leadScore ?? 0) - (a.leadScore ?? 0);
      }
      if (sortBy === "OLDEST_UNCONTACTED") {
        const aIsUncontacted = a.status === "NEW" ? 1 : 0;
        const bIsUncontacted = b.status === "NEW" ? 1 : 0;
        if (aIsUncontacted !== bIsUncontacted) {
          return bIsUncontacted - aIsUncontacted;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "TIMELINE_EARLIEST") {
        const timelineUrgency = (tl?: string) => {
          const t = (tl || "").toLowerCase();
          if (t.includes("immediately") || t.includes("asap")) return 1;
          if (t.includes("1 month")) return 2;
          if (t.includes("3 months")) return 3;
          if (t.includes("6 months")) return 4;
          if (t.includes("1 year")) return 5;
          return 6;
        };
        return timelineUrgency(a.travelTimeline) - timelineUrgency(b.travelTimeline);
      }
      if (sortBy === "OVERDUE_FIRST") {
        const aOverdue =
          a.followUpDate &&
          a.followUpDate < today &&
          a.status !== "CONVERTED" &&
          a.status !== "CLOSED"
            ? 1
            : 0;
        const bOverdue =
          b.followUpDate &&
          b.followUpDate < today &&
          b.status !== "CONVERTED" &&
          b.status !== "CLOSED"
            ? 1
            : 0;
        if (aOverdue !== bOverdue) return bOverdue - aOverdue;
        return (b.leadScore ?? 0) - (a.leadScore ?? 0);
      }
      // Default: RECENT_DESC
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    submissions,
    searchQuery,
    selectedFormId,
    selectedCampaign,
    selectedSource,
    selectedStatus,
    selectedPriority,
    selectedTimeline,
    selectedStaffId,
    sortBy,
    dateFrom,
    dateTo,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedFormId("ALL");
    setSelectedCampaign("ALL");
    setSelectedSource("ALL");
    setSelectedStatus("ALL");
    setSelectedPriority("ALL");
    setSelectedTimeline("ALL");
    setSelectedStaffId("ALL");
    setSortBy("RECENT_DESC");
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
    setModalPriorityOverride(sub.priorityOverride || "");
    setModalOverrideReason(sub.priorityOverrideReason || "");
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
            priorityOverride: modalPriorityOverride || null,
            priorityOverrideReason: modalOverrideReason || null,
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
          priority: updated.priority || activeSubmission.priority,
          priorityOverride: updated.priorityOverride || null,
          priorityOverrideReason: updated.priorityOverrideReason || null,
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

      {/* 6 Top Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Hot Leads */}
        <button
          type="button"
          onClick={() =>
            setSelectedPriority(selectedPriority === "HOT" ? "ALL" : "HOT")
          }
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedPriority === "HOT"
              ? "bg-rose-50 border-rose-400 ring-2 ring-rose-300 shadow-sm"
              : "bg-white border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Hot Leads
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-700 mt-2">
            {summaryMetrics.hot}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            1st Priority • Score 70–100
          </p>
        </button>

        {/* Warm Leads */}
        <button
          type="button"
          onClick={() =>
            setSelectedPriority(selectedPriority === "WARM" ? "ALL" : "WARM")
          }
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedPriority === "WARM"
              ? "bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-sm"
              : "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Warm Leads
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-700 mt-2">
            {summaryMetrics.warm}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            2nd Priority • Score 40–69
          </p>
        </button>

        {/* Cold Leads */}
        <button
          type="button"
          onClick={() =>
            setSelectedPriority(selectedPriority === "COLD" ? "ALL" : "COLD")
          }
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedPriority === "COLD"
              ? "bg-sky-50 border-sky-400 ring-2 ring-sky-300 shadow-sm"
              : "bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
              Cold Leads
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Snowflake className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-sky-700 mt-2">
            {summaryMetrics.cold}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            3rd Priority • Score 0–39
          </p>
        </button>

        {/* New Leads */}
        <button
          type="button"
          onClick={() =>
            setSelectedStatus(selectedStatus === "NEW" ? "ALL" : "NEW")
          }
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedStatus === "NEW"
              ? "bg-blue-50 border-blue-400 ring-2 ring-blue-300 shadow-sm"
              : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              New Leads
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-700 mt-2">
            {summaryMetrics.newLeads}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Awaiting first contact
          </p>
        </button>

        {/* Due Today */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white text-left shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Due Today
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">
            {summaryMetrics.dueToday}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Follow-up scheduled today
          </p>
        </div>

        {/* Overdue Follow-ups */}
        <button
          type="button"
          onClick={() =>
            setSortBy(
              sortBy === "OVERDUE_FIRST" ? "RECENT_DESC" : "OVERDUE_FIRST"
            )
          }
          className={`p-4 rounded-2xl border text-left transition-all ${
            sortBy === "OVERDUE_FIRST"
              ? "bg-red-50 border-red-400 ring-2 ring-red-300 shadow-sm"
              : "bg-white border-red-200 hover:border-red-300 hover:bg-red-50/30 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">
              Overdue
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-red-700 mt-2">
            {summaryMetrics.overdue}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Follow-up deadline passed
          </p>
        </button>
      </div>

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
              placeholder="Search by name, phone, email, city, Lead ID, or any answer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="ALL">All Priorities</option>
              <option value="HOT">🔥 Hot Lead (1st Priority • 70-100)</option>
              <option value="WARM">☀️ Warm Lead (2nd Priority • 40-69)</option>
              <option value="COLD">❄️ Cold Lead (3rd Priority • 0-39)</option>
            </select>
          </div>

          {/* Travel Urgency / Timeline Filter */}
          <div>
            <select
              value={selectedTimeline}
              onChange={(e) => setSelectedTimeline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="ALL">All Travel Timelines</option>
              <option value="Immediately">Immediately / ASAP</option>
              <option value="1 month">Within 1 month</option>
              <option value="3 months">Within 3 months</option>
              <option value="6 months">Within 6 months</option>
              <option value="1 year">Within 1 year</option>
              <option value="Flexible">Flexible / Not decided</option>
            </select>
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

          {/* Sort By Filter */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                <ArrowUpDown className="w-3.5 h-3.5 inline mr-1 text-emerald-700" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "RECENT_DESC"
                      | "SCORE_DESC"
                      | "PRIORITY_DESC"
                      | "OLDEST_UNCONTACTED"
                      | "TIMELINE_EARLIEST"
                      | "OVERDUE_FIRST"
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 text-xs font-bold text-slate-900 bg-emerald-50/50"
              >
                <option value="RECENT_DESC">Most Recent Submission</option>
                <option value="SCORE_DESC">
                  Highest Lead Score (100 → 0)
                </option>
                <option value="PRIORITY_DESC">
                  Highest Priority (Hot → Warm → Cold)
                </option>
                <option value="TIMELINE_EARLIEST">
                  Earliest Travel Urgency (ASAP first)
                </option>
                <option value="OVERDUE_FIRST">
                  Overdue Follow-ups First ⚠️
                </option>
                <option value="OLDEST_UNCONTACTED">
                  Oldest Uncontacted Leads
                </option>
              </select>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="sm:col-span-2 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Date:
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="From Date"
              className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
            />
            <span className="text-xs text-slate-400">to</span>
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
                  <th className="py-3.5 px-4">Priority & Score</th>
                  <th className="py-3.5 px-4">Pilgrim & Location</th>
                  <th className="py-3.5 px-4">Travel Urgency</th>
                  <th className="py-3.5 px-4">Phone / WhatsApp</th>
                  <th className="py-3.5 px-4">Campaign</th>
                  <th className="py-3.5 px-4">Submitted & Follow-up</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSubmissions.map((sub) => {
                  const primaryPhone = sub.phone || sub.whatsapp;
                  const waPhone = cleanPhoneForWhatsApp(
                    sub.whatsapp || sub.phone
                  );
                  const today = new Date().toISOString().split("T")[0];
                  const isOverdue =
                    sub.followUpDate &&
                    sub.followUpDate < today &&
                    sub.status !== "CONVERTED" &&
                    sub.status !== "CLOSED";
                  const isDueToday =
                    sub.followUpDate &&
                    sub.followUpDate === today &&
                    sub.status !== "CONVERTED" &&
                    sub.status !== "CLOSED";

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => openDetailModal(sub)}
                      className={`hover:bg-emerald-50/40 cursor-pointer transition-colors ${
                        isOverdue ? "bg-red-50/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {sub.submissionCode}
                      </td>

                      {/* Priority & Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {sub.priority === "HOT" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                              <Flame className="w-3 h-3 text-rose-600 shrink-0" />
                              Hot
                            </span>
                          ) : sub.priority === "COLD" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200">
                              <Snowflake className="w-3 h-3 text-sky-600 shrink-0" />
                              Cold
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                              <Sun className="w-3 h-3 text-amber-600 shrink-0" />
                              Warm
                            </span>
                          )}
                          <span className="font-mono text-xs font-extrabold text-slate-700">
                            {sub.leadScore ?? 50}/100
                          </span>
                        </div>
                        {sub.priorityOverride && (
                          <p className="text-[10px] text-purple-700 font-semibold mt-0.5">
                            Override: {sub.priorityOverride}
                          </p>
                        )}
                      </td>

                      {/* Pilgrim & Location */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">
                          {sub.fullName}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                          <span>
                            {[sub.district || sub.city, sub.state]
                              .filter(Boolean)
                              .join(", ") ||
                              sub.city ||
                              "—"}
                          </span>
                          {sub.locationSource === "GPS" ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              <MapPin className="w-2.5 h-2.5" /> GPS
                            </span>
                          ) : sub.locationSource === "MANUAL" ? (
                            <span className="text-[10px] text-slate-400">
                              Manual
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Travel Urgency / Timeline */}
                      <td className="py-3.5 px-4">
                        {sub.travelTimeline ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                              sub.travelTimeline
                                .toLowerCase()
                                .includes("immediately") ||
                              sub.travelTimeline
                                .toLowerCase()
                                .includes("1 month")
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : sub.travelTimeline
                                    .toLowerCase()
                                    .includes("3 month") ||
                                  sub.travelTimeline
                                    .toLowerCase()
                                    .includes("6 month")
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            {sub.travelTimeline}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                        {sub.approxDepartureDate && (
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                            Target: {sub.approxDepartureDate}
                          </p>
                        )}
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
                        <p className="font-medium text-slate-700">
                          {new Date(sub.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-red-700 bg-red-100/80 border border-red-200 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-2.5 h-2.5" /> Overdue: {sub.followUpDate}
                          </span>
                        )}
                        {isDueToday && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-1.5 py-0.5 rounded">
                            <Calendar className="w-2.5 h-2.5" /> Due Today
                          </span>
                        )}
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

              {/* Lead Quality & Priority Scoring Breakdown Card */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Lead Quality & Priority Scoring Engine
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    Score: {activeSubmission.leadScore ?? 50}/100
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Calculated Quality Score
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-slate-900">
                          {activeSubmission.leadScore ?? 50}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">
                          / 100
                        </span>
                      </div>
                      <div className="w-40 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            (activeSubmission.leadScore ?? 50) >= 70
                              ? "bg-rose-500"
                              : (activeSubmission.leadScore ?? 50) >= 40
                              ? "bg-amber-500"
                              : "bg-sky-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(5, activeSubmission.leadScore ?? 50)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Priority Level
                      </span>
                      {activeSubmission.priority === "HOT" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-xs">
                          <Flame className="w-4 h-4 text-rose-600" /> Hot Lead —
                          1st Priority
                        </span>
                      ) : activeSubmission.priority === "COLD" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 font-extrabold text-xs">
                          <Snowflake className="w-4 h-4 text-sky-600" /> Cold Lead —
                          3rd Priority
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-xs">
                          <Sun className="w-4 h-4 text-amber-600" /> Warm Lead —
                          2nd Priority
                        </span>
                      )}
                    </div>
                  </div>

                  {activeSubmission.scoreExplanation && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
                      <span className="font-bold text-emerald-900 block mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Scoring Factors & Explanation
                      </span>
                      <p className="text-emerald-950 font-medium leading-relaxed">
                        {activeSubmission.scoreExplanation}
                      </p>
                    </div>
                  )}

                  {activeSubmission.priorityOverride && (
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs">
                      <span className="font-bold text-purple-900 block">
                        Manual Priority Override Active: {activeSubmission.priorityOverride}
                      </span>
                      {activeSubmission.priorityOverrideReason && (
                        <p className="text-purple-800 text-[11px] mt-0.5">
                          Reason: {activeSubmission.priorityOverrideReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Location & GPS Geolocation Card */}
              {(activeSubmission.address ||
                activeSubmission.latitude ||
                activeSubmission.district ||
                activeSubmission.state ||
                activeSubmission.city) && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Pilgrim Location & GPS Coordinates
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        activeSubmission.locationSource === "GPS"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {activeSubmission.locationSource === "GPS"
                        ? "📍 GPS Geocoded"
                        : "✏️ Manual Address Entry"}
                    </span>
                  </div>
                  <div className="p-5 space-y-3 text-xs">
                    {activeSubmission.address && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Full Detected Address
                        </span>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {activeSubmission.address}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">
                          City / District
                        </span>
                        <span className="font-bold text-slate-800">
                          {activeSubmission.district ||
                            activeSubmission.city ||
                            "—"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">
                          State
                        </span>
                        <span className="font-bold text-slate-800">
                          {activeSubmission.state || "—"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">
                          Postal Code
                        </span>
                        <span className="font-bold text-slate-800">
                          {activeSubmission.postalCode || "—"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">
                          Country
                        </span>
                        <span className="font-bold text-slate-800">
                          {activeSubmission.country || "India"}
                        </span>
                      </div>
                    </div>

                    {activeSubmission.latitude &&
                      activeSubmission.longitude && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">
                              GPS Coordinates
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-800">
                              {activeSubmission.latitude.toFixed(6)},{" "}
                              {activeSubmission.longitude.toFixed(6)}
                            </span>
                          </div>
                          <a
                            href={`https://www.google.com/maps?q=${activeSubmission.latitude},${activeSubmission.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Open in
                            Google Maps
                          </a>
                        </div>
                      )}
                  </div>
                </div>
              )}

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

              {/* Section 3: Lead Management Form (Status, Staff Assignment, Follow-Up Date, Manual Priority Override, Notes) */}
              <form
                onSubmit={handleSaveLeadUpdate}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs"
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

                {/* Manual Priority Override Controls */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Manual Priority Override (Optional)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Overrides automatic 0–100 score priority
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Override Priority Level
                      </label>
                      <select
                        value={modalPriorityOverride}
                        onChange={(e) => setModalPriorityOverride(e.target.value)}
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
                        value={modalOverrideReason}
                        onChange={(e) => setModalOverrideReason(e.target.value)}
                        placeholder="e.g. VIP client referral, ready to pay token today..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
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
