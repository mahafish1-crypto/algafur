"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  Send,
  FileText,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface LeadDetailClientProps {
  lead: any;
  users: any[];
  packages: any[];
}

export default function LeadDetailClient({
  lead,
  users,
  packages,
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

  const cleanPhone = lead.mobile.replace(/[^0-9]/g, "");

  return (
    <div className="space-y-6">
      {/* Top Nav Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/crm/leads"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pipeline
        </Link>
        <span className="font-mono text-xs font-bold text-gold-400">
          Ref: {lead.leadNumber}
        </span>
      </div>

      {/* Main Grid: Details Left, Timeline Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lead Profile (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-serif font-bold text-white">{lead.name}</h1>
                <p className="text-xs text-slate-400 mt-0.5">{lead.city || "Pune"}</p>
              </div>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs font-bold bg-slate-900 border border-slate-700 text-gold-300 p-2 rounded-xl"
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="PACKAGE_DISCUSSION">PACKAGE DISCUSSION</option>
                <option value="QUOTATION_SENT">QUOTATION SENT</option>
                <option value="BOOKING_CONFIRMED">BOOKING CONFIRMED</option>
                <option value="LOST">LOST</option>
              </select>
            </div>

            {/* Quick Contact Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Call Lead
              </a>
              <a
                href={`https://wa.me/${cleanPhone}?text=Assalamualaikum%20${encodeURIComponent(
                  lead.name
                )},%20this%20is%20Al-Gafur%20Tours%20regarding%20your%20Umrah%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </div>

            {/* Details List */}
            <div className="space-y-3 text-xs border-t border-slate-800 pt-4 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-white">{lead.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span>{lead.email || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Package:</span>
                <span className="font-semibold text-gold-300">{lead.packageInterest}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Travel Date:</span>
                <span>{lead.travelDate || "October 2026"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pilgrim Count:</span>
                <span>{lead.adults} Adults, {lead.children} Kids</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Budget:</span>
                <span>{lead.budget || "Not Specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lead Source:</span>
                <span className="text-emerald-400">{lead.source}</span>
              </div>
              {lead.notes && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block mb-1">Inquiry Notes:</span>
                  <p className="p-2.5 rounded-lg bg-slate-900 text-slate-300 text-[11px] leading-relaxed">
                    {lead.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setFollowUpModal(true)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                Schedule Follow-up Task
              </button>
              <Link
                href={`/admin/quotations?leadId=${lead.id}&customerName=${encodeURIComponent(lead.name)}`}
                className="w-full py-2.5 bg-forest-900 hover:bg-forest-950 text-gold-300 border border-gold-500/30 rounded-xl text-xs font-bold text-center block"
              >
                Generate Official Quotation →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline & Log New Activity (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Add Activity Form */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-bold text-white">Log Note or Interaction</h3>
            <form onSubmit={handleAddActivity} className="space-y-3">
              <div className="flex gap-2">
                {["NOTE", "CALL", "WHATSAPP", "MEETING"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNoteType(t)}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      noteType === t
                        ? "bg-slate-800 text-gold-300 border border-gold-500/30"
                        : "bg-slate-900 text-slate-400"
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
                placeholder="Log notes about call discussion, budget, passport status, etc..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-600"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl text-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingNote ? "Logging..." : "Log Activity"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Activity Timeline List (Part 90) */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-bold text-white">
              Activity Timeline ({lead.activities.length})
            </h3>

            <div className="space-y-3">
              {lead.activities.map((act: any) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-gold-400 uppercase tracking-wide">
                      {act.type}
                    </span>
                    <span className="text-slate-500">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{act.description}</p>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-serif font-bold text-white">Schedule Follow-up</h3>
            <form onSubmit={handleScheduleFollowUp} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    required
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Follow-up Type</label>
                <select
                  value={followUpType}
                  onChange={(e) => setFollowUpType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                >
                  <option value="CALL">Call</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="MEETING">In-person Meeting</option>
                  <option value="PAYMENT_REMINDER">Payment Reminder</option>
                  <option value="DOCUMENT_REMINDER">Document Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Action Notes</label>
                <textarea
                  rows={2}
                  required
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="e.g. Call to finalize room choice and advance token"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFollowUpModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl"
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

