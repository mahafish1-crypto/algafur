"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Search,
  User,
  Circle,
} from "lucide-react";

export interface EnrichedNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string;
  createdAt: string;
  lead: {
    id: string;
    leadCode: string;
    name: string;
    phone: string;
    email: string;
    packageInterest: string;
    status: string;
    source: string;
  } | null;
}

export default function AdminNotificationsClient({
  initialNotifications,
}: {
  initialNotifications: EnrichedNotification[];
}) {
  const router = useRouter();
  const [notifications, setNotifications] =
    useState<EnrichedNotification[]>(initialNotifications);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "UNREAD" && n.isRead) return false;
      if (filter === "READ" && !n.isRead) return false;

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const hay = [
          n.title,
          n.message,
          n.lead?.name,
          n.lead?.phone,
          n.lead?.email,
          n.lead?.packageInterest,
          n.lead?.leadCode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [notifications, filter, search]);

  const toggleReadState = async (
    id: string,
    targetIsRead: boolean,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setBusyId(id);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: targetIsRead }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: targetIsRead } : n))
        );
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const handleOpenNotification = async (n: EnrichedNotification) => {
    if (!n.isRead) {
      await toggleReadState(n.id, true);
    }
    router.push(n.link || "/admin/crm/leads");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-900/50 border border-emerald-700/50 flex items-center justify-center text-gold-400 shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-serif font-bold text-white">
                Lead & System Notifications
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  unreadCount > 0
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {unreadCount} Unread
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time alerts whenever a pilgrim submits a package enquiry,
              callback request, or booking lead.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/crm/leads"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
          >
            View All Leads
          </Link>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markingAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            {markingAll ? "Updating..." : "Mark All as Read"}
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          {(
            [
              { key: "ALL", label: `All (${notifications.length})` },
              { key: "UNREAD", label: `Unread (${unreadCount})` },
              {
                key: "READ",
                label: `Read (${notifications.length - unreadCount})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                filter === tab.key
                  ? "bg-emerald-800 text-gold-300 border border-gold-500/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pilgrim name, phone, package..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              No notifications found
            </h3>
            <p className="text-xs text-slate-400">
              {filter === "UNREAD"
                ? "You have read all incoming lead notifications."
                : "New customer enquiries from the website will appear here automatically."}
            </p>
          </div>
        ) : (
          filtered.map((n) => {
            const submittedDate = new Date(n.createdAt).toLocaleString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            );

            return (
              <div
                key={n.id}
                onClick={() => handleOpenNotification(n)}
                className={`group cursor-pointer rounded-2xl border p-5 transition-all ${
                  !n.isRead
                    ? "bg-slate-950 border-gold-500/40 shadow-md hover:border-gold-400"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!n.isRead ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                          <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />
                          New Lead Alert
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                          Read
                        </span>
                      )}

                      {n.lead?.leadCode && (
                        <span className="text-[11px] font-mono font-bold text-gold-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {n.lead.leadCode}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {submittedDate}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-gold-300 transition-colors">
                      {n.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {n.message}
                    </p>

                    {/* Structured Lead Info Pill Row */}
                    {n.lead && (
                      <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold">
                          <User className="w-3.5 h-3.5 text-gold-400" />
                          {n.lead.name}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          {n.lead.phone}
                        </span>
                        {n.lead.email && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-sky-400" />
                            {n.lead.email}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-gold-300 font-semibold">
                          <Package className="w-3.5 h-3.5 text-gold-400" />
                          {n.lead.packageInterest}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className="flex flex-wrap items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {n.lead?.phone && (
                      <a
                        href={`https://wa.me/${n.lead.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 text-xs font-semibold transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    )}

                    <button
                      onClick={(e) => toggleReadState(n.id, !n.isRead, e)}
                      disabled={busyId === n.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {n.isRead ? "Mark Unread" : "Mark Read"}
                    </button>

                    <button
                      onClick={() => handleOpenNotification(n)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 text-xs font-bold transition-colors"
                    >
                      Open Lead
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

