"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  SlidersHorizontal,
  Kanban,
  Table as TableIcon,
  Plus,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  Calendar,
  X,
} from "lucide-react";

interface LeadsPipelineClientProps {
  initialLeads: any[];
  users: any[];
}

const STAGES = [
  { id: "NEW", title: "New Inquiries", color: "border-blue-500" },
  { id: "CONTACTED", title: "Contacted", color: "border-amber-500" },
  { id: "QUALIFIED", title: "Qualified", color: "border-emerald-500" },
  { id: "PACKAGE_DISCUSSION", title: "Package Discussion", color: "border-purple-500" },
  { id: "QUOTATION_SENT", title: "Quotation Sent", color: "border-gold-500" },
  { id: "BOOKING_CONFIRMED", title: "Booking Confirmed", color: "border-green-600" },
  { id: "LOST", title: "Lost / Closed", color: "border-red-500" },
];

export default function LeadsPipelineClient({
  initialLeads,
  users,
}: LeadsPipelineClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"KANBAN" | "TABLE">("KANBAN");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("ALL");
  const [leads, setLeads] = useState(initialLeads);
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);

  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "Pune",
    journeyType: "UMRAH",
    packageInterest: "Umrah Platinum Package (20 Days)",
    adults: 2,
    source: "Phone Inquiry",
  });

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads(
          leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
      }
    } catch {
      alert("Failed to update status.");
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

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.mobile.includes(searchTerm) ||
      l.leadNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === "ALL" || l.status === filterStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">
            CRM Leads &amp; Sales Pipeline
          </h1>
          <p className="text-xs text-slate-400">
            Track inquiries from initial contact through quotation, payment, and departure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex">
            <button
              onClick={() => setViewMode("KANBAN")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "KANBAN"
                  ? "bg-slate-800 text-gold-300"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Kanban View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "TABLE"
                  ? "bg-slate-800 text-gold-300"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setNewLeadModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads by name, phone, ref..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Pipeline Stage:</span>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="text-xs p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
          >
            <option value="ALL">All Stages ({leads.length})</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW: KANBAN BOARD */}
      {viewMode === "KANBAN" && (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {STAGES.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col.id);
            return (
              <div
                key={col.id}
                className="w-72 flex-shrink-0 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div
                  className={`p-3.5 border-b border-slate-800 border-t-2 ${col.color} rounded-t-2xl flex items-center justify-between`}
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {col.title}
                  </h3>
                  <span className="text-[11px] font-bold bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full border border-slate-800">
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="p-3 overflow-y-auto space-y-3 flex-1">
                  {colLeads.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-600 italic">
                      No leads in this stage
                    </div>
                  ) : (
                    colLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 shadow-sm space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <Link
                            href={`/admin/crm/leads/${lead.id}`}
                            className="font-bold text-white hover:text-gold-300 block"
                          >
                            {lead.name}
                          </Link>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {lead.leadNumber}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 truncate">
                          {lead.packageInterest || "Umrah Package"}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                          <span>{lead.city}</span>
                          <span className="font-semibold text-emerald-400">{lead.mobile}</span>
                        </div>

                        {/* Move stage dropdown */}
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                            className="text-[10px] p-1 bg-slate-950 border border-slate-800 text-slate-300 rounded w-full"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                Move to: {s.title}
                              </option>
                            ))}
                          </select>

                          <a
                            href={`https://wa.me/${lead.mobile.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 bg-emerald-800 text-white rounded hover:bg-emerald-700"
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

      {/* VIEW: TABLE */}
      {viewMode === "TABLE" && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Pilgrim Name</th>
                  <th className="py-3 px-4">Phone / WhatsApp</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Package Interest</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-900/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{l.leadNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <Link href={`/admin/crm/leads/${l.id}`} className="hover:text-gold-300">
                        {l.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{l.mobile}</td>
                    <td className="py-3.5 px-4 text-slate-300">{l.city}</td>
                    <td className="py-3.5 px-4 text-slate-300">{l.packageInterest}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{l.source}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/crm/leads/${l.id}`}
                        className="text-gold-400 hover:underline font-semibold"
                      >
                        Open Lead →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {newLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-serif font-bold text-white">Create New CRM Lead</h3>
              <button
                onClick={() => setNewLeadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pilgrim Name *</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="e.g. Haji Bashir Patel"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={newLeadForm.mobile}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, mobile: e.target.value })}
                  placeholder="+91 9890000000"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={newLeadForm.city}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                  placeholder="Pune, Mumbai, etc."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Package</label>
                <input
                  type="text"
                  value={newLeadForm.packageInterest}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, packageInterest: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewLeadModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl"
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

