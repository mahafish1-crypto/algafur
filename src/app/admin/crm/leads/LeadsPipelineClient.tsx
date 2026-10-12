"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Kanban,
  Table as TableIcon,
  Plus,
  Phone,
  MessageCircle,
  Mail,
  X,
  ExternalLink,
} from "lucide-react";

interface LeadsPipelineClientProps {
  initialLeads: any[];
  users: any[];
  packages?: any[];
  includeYouTubeLeads?: boolean;
}

const STAGES = [
  { id: "NEW", title: "New Leads", color: "border-blue-500" },
  { id: "CONTACTED", title: "Contacted", color: "border-amber-500" },
  { id: "FOLLOW_UP", title: "Follow-up", color: "border-orange-500" },
  { id: "INTERESTED", title: "Interested", color: "border-cyan-500" },
  { id: "QUALIFIED", title: "Qualified", color: "border-emerald-500" },
  { id: "BOOKING_CONFIRMED", title: "Booking Confirmed", color: "border-green-600" },
  { id: "CONVERTED", title: "Converted", color: "border-teal-500" },
  { id: "CLOSED", title: "Closed", color: "border-slate-500" },
  { id: "LOST", title: "Lost", color: "border-red-500" },
];

export default function LeadsPipelineClient({
  initialLeads,
  users,
  packages = [],
  includeYouTubeLeads = false,
}: LeadsPipelineClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"TABLE" | "KANBAN">("TABLE");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("ALL");
  const [filterSource, setFilterSource] = useState("ALL");
  const [filterPackage, setFilterPackage] = useState("ALL");
  const [filterAssignee, setFilterAssignee] = useState("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [leads, setLeads] = useState(initialLeads);
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);

  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "Pune",
    journeyType: "UMRAH",
    packageInterest:
      packages[0]?.name || "Umrah Platinum Package (15 Days)",
    travelDate: "October 2026",
    adults: 2,
    children: 0,
    roomPreference: "QUAD",
    source: "Phone Inquiry",
    notes: "",
  });

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
      }
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleAssignStaff = async (leadId: string, staffId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: staffId || null }),
      });
      if (res.ok) {
        const json = await res.json();
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId
              ? {
                  ...l,
                  assignedToId: json.lead.assignedToId,
                  assignedTo: json.lead.assignedTo,
                }
              : l
          )
        );
      }
    } catch {
      alert("Failed to assign staff.");
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLeadForm,
          utmSource: newLeadForm.source,
          consentAccepted: true,
        }),
      });
      if (res.ok) {
        setNewLeadModalOpen(false);
        router.refresh();
      }
    } catch {
      alert("Failed to create lead.");
    }
  };

  const uniqueSources = Array.from(
    new Set(leads.map((l) => l.source).filter(Boolean))
  );

  const filteredLeads = leads.filter((l) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (l.name || "").toLowerCase().includes(term) ||
      (l.mobile || "").toLowerCase().includes(term) ||
      (l.email || "").toLowerCase().includes(term) ||
      (l.leadNumber || "").toLowerCase().includes(term) ||
      (l.packageInterest || "").toLowerCase().includes(term) ||
      (l.city || "").toLowerCase().includes(term);

    const matchesStage = filterStage === "ALL" || l.status === filterStage;
    const matchesSource = filterSource === "ALL" || l.source === filterSource;
    const matchesPackage =
      filterPackage === "ALL" ||
      (l.packageInterest || "")
        .toLowerCase()
        .includes(filterPackage.toLowerCase());
    const matchesAssignee =
      filterAssignee === "ALL"
        ? true
        : filterAssignee === "UNASSIGNED"
        ? !l.assignedToId
        : l.assignedToId === filterAssignee;

    const matchesDate = !filterDateFrom
      ? true
      : new Date(l.createdAt) >= new Date(filterDateFrom);

    return (
      matchesSearch &&
      matchesStage &&
      matchesSource &&
      matchesPackage &&
      matchesAssignee &&
      matchesDate
    );
  });

  const getFollowUpDates = (lead: any) => {
    const list = Array.isArray(lead.followUps) ? lead.followUps : [];
    if (list.length === 0) return { last: "—", next: "—" };
    const today = new Date().toISOString().split("T")[0];
    const completedOrPast = list.filter(
      (f: any) => f.status === "COMPLETED" || f.date < today
    );
    const upcoming = list.filter(
      (f: any) => f.status !== "COMPLETED" && f.date >= today
    );
    return {
      last: completedOrPast[0]?.date || "—",
      next: upcoming[upcoming.length - 1]?.date || list[0]?.date || "—",
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            CRM Leads &amp; Booking Enquiries ({filteredLeads.length})
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Inspect every customer booking enquiry, assign staff advisors, schedule follow-ups, and confirm reservations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={
              includeYouTubeLeads
                ? "/admin/crm/leads"
                : "/admin/crm/leads?view=all"
            }
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              includeYouTubeLeads
                ? "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {includeYouTubeLeads
              ? "Showing All Leads (Click for Website Enquiries Only)"
              : "Include YouTube Campaign Leads"}
          </Link>

          {/* View Mode Toggle */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("TABLE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                viewMode === "TABLE"
                  ? "bg-emerald-800 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Detailed Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode("KANBAN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                viewMode === "KANBAN"
                  ? "bg-emerald-800 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Kanban Pipeline View"
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban
            </button>
          </div>

          <button
            type="button"
            onClick={() => setNewLeadModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Manual Lead</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-center">
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Lead ID, name, phone, email, city..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
          >
            <option value="ALL">All Statuses ({leads.length})</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
          >
            <option value="ALL">All Sources</option>
            {uniqueSources.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
          >
            <option value="ALL">All Staff Members</option>
            <option value="UNASSIGNED">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            title="Filter from submission date"
            className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
          />
        </div>
      </div>

      {/* VIEW: DETAILED TABLE */}
      {viewMode === "TABLE" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-3">Lead ID &amp; Date</th>
                  <th className="py-3.5 px-3">Customer Details</th>
                  <th className="py-3.5 px-3">Package &amp; Departure</th>
                  <th className="py-3.5 px-3">Travellers</th>
                  <th className="py-3.5 px-3">Source</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Assigned Staff</th>
                  <th className="py-3.5 px-3">Follow-ups (Last / Next)</th>
                  <th className="py-3.5 px-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((l) => {
                  const followDates = getFollowUpDates(l);
                  const cleanPhone = (l.mobile || "").replace(/[^0-9]/g, "");
                  const submittedAt = l.createdAt
                    ? new Date(l.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <tr
                      key={l.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <Link
                          href={
                            l.youtubeDetailHref || `/admin/crm/leads/${l.id}`
                          }
                          className="font-mono font-bold text-emerald-800 hover:underline block"
                        >
                          {l.leadNumber}
                        </Link>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {submittedAt}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <Link
                          href={
                            l.youtubeDetailHref || `/admin/crm/leads/${l.id}`
                          }
                          className="font-bold text-slate-900 hover:text-emerald-800 block"
                        >
                          {l.name}
                        </Link>
                        <span className="text-[11px] text-slate-600 block">
                          {l.mobile}
                        </span>
                        {l.email && (
                          <span className="text-[10px] text-slate-500 block">
                            {l.email}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {l.city || "Pune"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 max-w-[220px]">
                        <span className="font-semibold text-slate-900 block truncate">
                          {l.packageInterest || "Umrah Package"}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Pref: {l.travelDate || "Flexible"}
                        </span>
                        {l.budget && (
                          <span className="text-[10px] text-amber-700 font-medium block">
                            {l.budget}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {(l.adults || 1) + (l.children || 0)} Total
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {l.adults || 1}A, {l.children || 0}C
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {l.source || "Website"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={l.status}
                          onChange={(e) =>
                            handleUpdateStatus(l.id, e.target.value)
                          }
                          className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 focus:outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={l.assignedToId || ""}
                          onChange={(e) =>
                            handleAssignStaff(l.id, e.target.value)
                          }
                          className="text-[11px] px-2 py-1 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 focus:outline-none"
                        >
                          <option value="">Unassigned</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap text-[11px] text-slate-600">
                        <div>
                          <span className="text-slate-400">Last:</span>{" "}
                          {followDates.last}
                        </div>
                        <div>
                          <span className="text-slate-400">Next:</span>{" "}
                          <strong className="text-emerald-800">
                            {followDates.next}
                          </strong>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={`tel:${cleanPhone}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="Call Lead"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              `Assalamualaikum ${l.name}, this is Al-Gafur Tours regarding your enquiry (${l.leadNumber}) for ${l.packageInterest}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                            title="WhatsApp Lead"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          {l.email && (
                            <a
                              href={`mailto:${l.email}?subject=${encodeURIComponent(
                                `Al-Gafur Tours — Enquiry ${l.leadNumber}`
                              )}`}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                              title="Email Lead"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <Link
                            href={
                              l.youtubeDetailHref || `/admin/crm/leads/${l.id}`
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px]"
                          >
                            Details
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: KANBAN BOARD */}
      {viewMode === "KANBAN" && (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {STAGES.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col.id);
            return (
              <div
                key={col.id}
                className="w-72 flex-shrink-0 bg-white rounded-2xl border border-slate-200 flex flex-col max-h-[75vh] shadow-xs"
              >
                <div
                  className={`p-3.5 border-b border-slate-200 border-t-4 ${col.color} rounded-t-2xl flex items-center justify-between`}
                >
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {col.title}
                  </h3>
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    {colLeads.length}
                  </span>
                </div>

                <div className="p-3 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
                  {colLeads.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 italic">
                      No leads in this stage
                    </div>
                  ) : (
                    colLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 shadow-2xs space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <Link
                            href={`/admin/crm/leads/${lead.id}`}
                            className="font-bold text-slate-900 hover:text-emerald-800 block"
                          >
                            {lead.name}
                          </Link>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {lead.leadNumber}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 truncate">
                          {lead.packageInterest || "Umrah Package"}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>{lead.city}</span>
                          <span className="font-semibold text-emerald-700">
                            {lead.mobile}
                          </span>
                        </div>

                        <div className="pt-2 flex items-center justify-between gap-2">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleUpdateStatus(lead.id, e.target.value)
                            }
                            className="text-[10px] p-1 bg-slate-50 border border-slate-200 text-slate-800 rounded w-full"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                Move to: {s.title}
                              </option>
                            ))}
                          </select>

                          <a
                            href={`https://wa.me/${(lead.mobile || "").replace(
                              /[^0-9]/g,
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Lead Modal */}
      {newLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Create Manual CRM Lead
              </h3>
              <button
                type="button"
                onClick={() => setNewLeadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, name: e.target.value })
                  }
                  placeholder="e.g. Haji Bashir Patel"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newLeadForm.mobile}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, mobile: e.target.value })
                    }
                    placeholder="+91 9890000000"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.city}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, city: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Package
                </label>
                <input
                  type="text"
                  value={newLeadForm.packageInterest}
                  onChange={(e) =>
                    setNewLeadForm({
                      ...newLeadForm,
                      packageInterest: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewLeadModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
