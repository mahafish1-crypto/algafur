"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  User,
  Clock,
  Terminal,
  Activity,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface Props {
  initialLogs: AuditLogItem[];
}

export default function AdminAuditLogsClient({ initialLogs }: Props) {
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");

  const entities = [
    "ALL",
    "Lead",
    "Customer",
    "Booking",
    "Payment",
    "Document",
    "VisaApplication",
    "Quotation",
    "Invoice",
    "User",
  ];

  const filtered = logs.filter((log) => {
    const matchesEntity = entityFilter === "ALL" ? true : log.entity === entityFilter;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      log.action.toLowerCase().includes(term) ||
      log.entity.toLowerCase().includes(term) ||
      log.user?.name.toLowerCase().includes(term) ||
      (log.details && log.details.toLowerCase().includes(term));

    return matchesEntity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-emerald-700" />
            Security Audit Trail & Compliance Logs
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Immutable log of all sensitive administrative actions, payments, document approvals, and lead modifications.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {entities.map((ent) => (
            <button
              key={ent}
              onClick={() => setEntityFilter(ent)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                entityFilter === ent
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {ent}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Action Executed</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5">Performed By</th>
                <th className="px-5 py-3.5">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-sans">
                    No security events found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 whitespace-nowrap text-slate-500 font-sans">
                      {new Date(log.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-800 font-semibold">{log.entity}</span>
                      {log.entityId && (
                        <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                          ID: {log.entityId}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-sans">
                      <div className="font-semibold text-slate-900">
                        {log.user?.name || "System Automated"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {log.user?.email || "internal-daemon"}
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs truncate text-slate-700">
                      {log.details || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

