"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  User,
  Plus,
} from "lucide-react";

interface FollowupsClientProps {
  initialFollowUps: any[];
}

export default function FollowupsClient({ initialFollowUps }: FollowupsClientProps) {
  const [tab, setTab] = useState<"ALL" | "TODAY" | "OVERDUE" | "UPCOMING">("TODAY");
  const [followUps, setFollowUps] = useState(initialFollowUps);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleToggleComplete = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      const res = await fetch("/api/followups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setFollowUps(
          followUps.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
        );
      }
    } catch {
      alert("Failed to update status.");
    }
  };

  const filtered = followUps.filter((f) => {
    if (tab === "TODAY") return f.date === todayStr && f.status !== "COMPLETED";
    if (tab === "OVERDUE") return f.date < todayStr && f.status !== "COMPLETED";
    if (tab === "UPCOMING") return f.date > todayStr && f.status !== "COMPLETED";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Follow-up Task Manager</h1>
          <p className="text-xs text-slate-400">
            Never miss a callback, quotation reminder, or payment collection deadline.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
          {[
            { id: "TODAY", label: "Today" },
            { id: "OVERDUE", label: "Overdue" },
            { id: "UPCOMING", label: "Upcoming" },
            { id: "ALL", label: "All Tasks" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
                tab === t.id ? "bg-slate-800 text-gold-300" : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-950 p-12 rounded-3xl border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-base font-serif font-bold text-white">All Clear!</h3>
            <p className="text-xs text-slate-400">No pending follow-ups in this filter.</p>
          </div>
        ) : (
          filtered.map((f) => {
            const isCompleted = f.status === "COMPLETED";
            const targetPhone = f.lead?.mobile || f.customer?.phone;
            const targetName = f.lead?.name || f.customer?.name || "Client";

            return (
              <div
                key={f.id}
                className={`bg-slate-950 p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted ? "border-slate-800 opacity-60" : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => handleToggleComplete(f.id, f.status)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "border-slate-700 hover:border-gold-400"
                    }`}
                  >
                    {isCompleted && "✓"}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {targetName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-gold-400">
                        {f.type}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {f.date} at {f.time || "11:00"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-snug">{f.notes}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      <span>Assigned: {f.user?.name}</span>
                      {f.lead && (
                        <Link
                          href={`/admin/crm/leads/${f.lead.id}`}
                          className="text-emerald-400 hover:underline"
                        >
                          View Lead Timeline →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                {targetPhone && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={`tel:${targetPhone.replace(/[^0-9]/g, "")}`}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800"
                      title="Call"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                    </a>
                    <a
                      href={`https://wa.me/${targetPhone.replace(/[^0-9]/g, "")}?text=Assalamualaikum%20${encodeURIComponent(
                        targetName
                      )},%20this%20is%20Al-Gafur%20Tours%20following%20up%20on%20your%20inquiry.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

