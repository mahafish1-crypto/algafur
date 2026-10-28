"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Clock,
  Send,
  ArrowLeft,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

interface LeadDetailClientProps {
  lead: any;
  users: any[];
  packages: any[];
}

const LEAD_STATUSES = [
  { id: "NEW", label: "New" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "FOLLOW_UP", label: "Follow-up" },
  { id: "INTERESTED", label: "Interested" },
  { id: "QUALIFIED", label: "Qualified" },
  { id: "BOOKING_CONFIRMED", label: "Booking Confirmed" },
  { id: "CONVERTED", label: "Converted" },
  { id: "CLOSED", label: "Closed" },
  { id: "LOST", label: "Lost" },
];

export default function LeadDetailClient({
  lead,
  users,
}: LeadDetailClientProps) {
  const router = useRouter();

  const [status, setStatus] = useState(lead.status);
  const [assignedToId, setAssignedToId] = useState(lead.assignedToId || "");
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("NOTE");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Follow-up form
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [followUpTime, setFollowUpTime] = useState("11:00");
  const [followUpType, setFollowUpType] = useState("CALL");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [followUpModal, setFollowUpModal] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  };

  const handleAssigneeChange = async (newStaffId: string) => {
    setAssignedToId(newStaffId);
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedToId: newStaffId || null }),
    });
    router.refresh();
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      await fetch(`/api/leads/${lead.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: noteType,
          description: newNote,
        }),
      });
      setNewNote("");
      router.refresh();
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          userId: assignedToId || users[0]?.id,
          date: followUpDate,
          time: followUpTime,
          type: followUpType,
          notes: followUpNotes,
        }),
      });
      setFollowUpModal(false);
      setFollowUpNotes("");
      router.refresh();
    } catch {
      alert("Failed to schedule follow-up.");
    }
  };

  const cleanPhone = (lead.mobile || "").replace(/[^0-9]/g, "");
  const whatsappMessage = `Assalamualaikum ${lead.name}, this is AL GAFUR INTERNATIONAL TOURS AND TRAVELS regarding your pilgrimage booking enquiry (${lead.leadNumber}) for ${lead.packageInterest}. How may we assist you with seat availability and confirmation?`;
  const emailSubject = `AL GAFUR INTERNATIONAL TOURS AND TRAVELS — Pilgrimage Enquiry (${lead.leadNumber})`;

  return (
    <div className="space-y-6">
      {/* Top Nav Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/crm/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Leads
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-lg border border-emerald-200">
            Ref: {lead.leadNumber}
          </span>
          <span className="text-xs text-slate-500">
            Submitted: {new Date(lead.createdAt).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Main Grid: Details Left, Timeline & Follow-ups Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lead Profile & Assignment (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-serif font-bold text-slate-900">
                  {lead.name}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lead.city || "Pune"} &bull; {lead.journeyType || "UMRAH"}
                </p>
              </div>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs font-bold bg-emerald-50 border border-emerald-300 text-emerald-900 p-2 rounded-xl"
              >
                {LEAD_STATUSES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Contact Buttons (Call, WhatsApp, Email) */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 text-xs font-bold"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                Call
              </a>
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  whatsappMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <a
                href={
                  lead.email
                    ? `mailto:${lead.email}?subject=${encodeURIComponent(
                        emailSubject
                      )}`
                    : `mailto:?subject=${encodeURIComponent(emailSubject)}`
                }
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </a>
            </div>

            {/* Staff Assignment */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                Assigned Staff Advisor
              </label>
              <select
                value={assignedToId}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Complete Submitted Details List */}
            <div className="space-y-2.5 text-xs border-t border-slate-200 pt-4 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Phone / Mobile:</span>
                <span className="font-bold text-slate-900">{lead.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">WhatsApp:</span>
                <span className="font-semibold text-slate-900">
                  {lead.whatsapp || lead.mobile}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-900">
                  {lead.email || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">City / Location:</span>
                <span className="font-medium text-slate-900">
                  {lead.city || "Pune"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Package Enquired For:</span>
                <span className="font-bold text-emerald-800 text-right max-w-[200px]">
                  {lead.packageInterest}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Preferred Travel Date:</span>
                <span className="font-semibold text-slate-900">
                  {lead.travelDate || "Flexible"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Number of Travellers:</span>
                <span className="font-semibold text-slate-900">
                  {(lead.adults || 1) + (lead.children || 0)} Total (
                  {lead.adults || 1} Adults, {lead.children || 0} Children)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Room / Budget Info:</span>
                <span className="font-medium text-amber-800">
                  {lead.budget || "Standard"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lead Source:</span>
                <span className="font-semibold text-emerald-700">
                  {lead.source} {lead.utmSource ? `(${lead.utmSource})` : ""}
                </span>
              </div>

              {lead.notes && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-semibold block mb-1">
                    Submitted Enquiry Message &amp; Context:
                  </span>
                  <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                    {lead.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setFollowUpModal(true)}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                Schedule Next Follow-up
              </button>
              <Link
                href={`/admin/quotations?leadId=${lead.id}&customerName=${encodeURIComponent(
                  lead.name
                )}`}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold text-center block"
              >
                Generate Official Quotation &rarr;
              </Link>
            </div>
          </div>

          {/* Scheduled Follow-ups Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                Scheduled Follow-ups ({(lead.followUps || []).length})
              </h3>
              <button
                type="button"
                onClick={() => setFollowUpModal(true)}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                + Add Follow-up
              </button>
            </div>

            {(lead.followUps || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No follow-ups scheduled yet.
              </p>
            ) : (
              <div className="space-y-2">
                {(lead.followUps || []).map((f: any) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800">
                        {f.date} at {f.time} ({f.type})
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {f.status}
                      </span>
                    </div>
                    <p className="text-slate-700">{f.notes}</p>
                    {f.user?.name && (
                      <span className="text-[10px] text-slate-400 block">
                        Assigned: {f.user.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Timeline & Log New Activity (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Add Activity Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Log Follow-up Note or Call Summary
            </h3>
            <form onSubmit={handleAddActivity} className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {["NOTE", "CALL", "WHATSAPP", "EMAIL", "MEETING"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNoteType(t)}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                      noteType === t
                        ? "bg-emerald-800 text-white border-emerald-800"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log notes about call discussion, room preference confirmation, or next steps..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 px-4 rounded-xl text-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingNote ? "Logging..." : "Save Note"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Activity & Status History Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Activity &amp; Status History ({(lead.activities || []).length})
            </h3>

            <div className="space-y-3">
              {(lead.activities || []).map((act: any) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-800 uppercase tracking-wide">
                      {act.type}
                    </span>
                    <span className="text-slate-400">
                      {new Date(act.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed">
                    {act.description}
                  </p>
                  {act.user?.name && (
                    <span className="text-[10px] text-slate-500 block pt-0.5">
                      Logged by {act.user.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Follow-up Modal */}
      {followUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">
              Schedule Next Follow-up
            </h3>
            <form onSubmit={handleScheduleFollowUp} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    required
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Follow-up Channel
                </label>
                <select
                  value={followUpType}
                  onChange={(e) => setFollowUpType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900"
                >
                  <option value="CALL">Phone Call</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">Office Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Action Notes
                </label>
                <textarea
                  rows={2}
                  required
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="e.g. Call to confirm room preference and seat availability"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFollowUpModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
