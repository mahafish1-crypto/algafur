"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  AlertCircle,
} from "lucide-react";

interface AdminDocumentsClientProps {
  initialDocs: any[];
}

export default function AdminDocumentsClient({ initialDocs }: AdminDocumentsClientProps) {
  const router = useRouter();
  const [docs, setDocs] = useState(initialDocs);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const handleUpdateStatus = async (
    docId: string,
    status: "VERIFIED" | "REJECTED",
    reason?: string
  ) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason: reason || null }),
      });
      if (res.ok) {
        setDocs(
          docs.map((d) =>
            d.id === docId
              ? { ...d, status, rejectionReason: reason || null }
              : d
          )
        );
        router.refresh();
      }
    } catch {
      alert("Failed to update document status.");
    }
  };

  const filtered = docs.filter((d) => {
    const matchesFilter = filter === "ALL" || d.status === filter;
    const matchesSearch =
      d.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Document Compliance Desk</h1>
          <p className="text-xs text-slate-400">
            Verify pilgrim passports, white-background photos, Aadhaar copies, and vaccination records.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
          {["ALL", "UPLOADED", "VERIFIED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
                filter === f ? "bg-slate-800 text-gold-300" : "text-slate-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents by pilgrim or filename..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-600"
          />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} Documents</span>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800">
                <FileText className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{doc.customer.name}</span>
                  <span className="text-[10px] font-mono text-gold-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase">
                    {doc.type}
                  </span>
                  {doc.booking?.bookingNumber && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {doc.booking.bookingNumber}
                    </span>
                  )}
                </div>

                <p className="text-slate-300 font-mono text-[11px]">{doc.fileName}</p>

                {doc.rejectionReason && (
                  <p className="text-[11px] text-red-400 bg-red-950/60 p-1.5 rounded border border-red-800/60">
                    <strong>Rejection Reason:</strong> {doc.rejectionReason}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
                  {doc.verifiedBy?.name && <span>Verified by: {doc.verifiedBy.name}</span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  doc.status === "VERIFIED"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : doc.status === "REJECTED"
                    ? "bg-red-950 text-red-300 border border-red-800"
                    : "bg-amber-950 text-amber-300 border border-amber-800"
                }`}
              >
                {doc.status}
              </span>

              {doc.status !== "VERIFIED" && (
                <button
                  onClick={() => handleUpdateStatus(doc.id, "VERIFIED")}
                  className="p-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl"
                  title="Approve & Verify"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}

              {doc.status !== "REJECTED" && (
                <button
                  onClick={() => {
                    const reason = prompt("Enter rejection reason for pilgrim:", "Passport photo blurry / white background required");
                    if (reason) handleUpdateStatus(doc.id, "REJECTED", reason);
                  }}
                  className="p-2 bg-red-900/60 hover:bg-red-800 text-red-200 rounded-xl"
                  title="Reject with Reason"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

