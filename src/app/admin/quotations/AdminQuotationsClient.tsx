"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Plus,
  Edit,
  MessageCircle,
  Eye,
  Trash2,
} from "lucide-react";
import { buildQuotationWhatsAppMessage } from "@/lib/quotation-math";

interface QuotationItem {
  id: string;
  quotationNumber: string;
  customerId?: string | null;
  leadId?: string | null;
  packageId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerWhatsapp?: string | null;
  travellersCount: number;
  roomType: string;
  adultCount?: number;
  childWithBedCount?: number;
  childNoBedCount?: number;
  infantCount?: number;
  subtotal: number;
  discount: number;
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  discountReason?: string | null;
  tax: number;
  gstAmount?: number;
  additionalCharges?: number;
  total: number;
  advanceRequired: number;
  balanceAmount: number;
  departureDate?: string | null;
  departureCity?: string | null;
  validUntil?: string | null;
  status: string;
  createdAt: string;
  customer?: { id: string; name: string; phone: string; whatsapp?: string | null; email?: string | null } | null;
  lead?: { id: string; name: string; mobile: string; email?: string | null } | null;
  package: {
    id: string;
    name: string;
    type: string;
    durationDays: number;
    makkahHotelName?: string | null;
    madinahHotelName?: string | null;
    departureDate?: string | null;
  };
}

interface Props {
  initialQuotations: QuotationItem[];
  siteSettings?: Record<string, string>;
}

export default function AdminQuotationsClient({
  initialQuotations,
}: Props) {
  const [quotations, setQuotations] = useState<QuotationItem[]>(initialQuotations);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredQuotes = quotations.filter((q) => {
    const term = search.toLowerCase();
    const name = q.customerName || q.customer?.name || q.lead?.name || "";
    const phone = q.customerPhone || q.customer?.phone || q.lead?.mobile || "";
    return (
      !term ||
      q.quotationNumber?.toLowerCase().includes(term) ||
      name.toLowerCase().includes(term) ||
      phone.toLowerCase().includes(term) ||
      q.package?.name?.toLowerCase().includes(term)
    );
  });

  const handleDelete = async (id: string, quoteNum: string) => {
    if (!confirm(`Delete quotation ${quoteNum}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/quotations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setQuotations((prev) => prev.filter((q) => q.id !== id));
      } else {
        alert("Failed to delete quotation.");
      }
    } catch {
      alert("Error deleting quotation.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-emerald-700" />
            Quotation Generator &amp; Tour Estimator
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Build branded multi-occupancy estimates with Child &amp; Infant pricing, Flat/% discounts, PDF printing &amp; WhatsApp sharing.
          </p>
        </div>
        <Link
          href="/admin/quotations/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Quotation
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <p className="text-sm text-slate-600 font-medium">
          Total Quotations Issued: <span className="font-bold text-slate-900">{quotations.length}</span>
        </p>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quote ref, pilgrim name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Quote Ref &amp; Status</th>
                <th className="px-5 py-3.5">Date &amp; Validity</th>
                <th className="px-5 py-3.5">Pilgrim / Customer</th>
                <th className="px-5 py-3.5">Package &amp; Room</th>
                <th className="px-5 py-3.5">Passengers</th>
                <th className="px-5 py-3.5">Pricing &amp; Discount</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No quotations found. Click &quot;Create New Quotation&quot; to build one.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => {
                  const clientName =
                    q.customerName || q.customer?.name || q.lead?.name || "Prospective Pilgrim";
                  const clientPhone =
                    q.customerPhone || q.customer?.phone || q.lead?.mobile || "";
                  const clientWa =
                    q.customerWhatsapp || q.customer?.whatsapp || clientPhone;

                  const adults = q.adultCount || q.travellersCount || 1;
                  const childrenCount =
                    (q.childWithBedCount || 0) + (q.childNoBedCount || 0);
                  const infants = q.infantCount || 0;
                  const discAmt = q.discountAmount ?? q.discount ?? 0;

                  const waMsg = buildQuotationWhatsAppMessage(q);
                  const cleanWa = clientWa.replace(/[^0-9]/g, "");
                  const waHref = cleanWa
                    ? `https://wa.me/${cleanWa.length === 10 ? `91${cleanWa}` : cleanWa}?text=${encodeURIComponent(
                        waMsg
                      )}`
                    : `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

                  return (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 space-y-1">
                        <Link
                          href={`/admin/quotations/${q.id}`}
                          className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 inline-block"
                        >
                          {q.quotationNumber}
                        </Link>
                        <div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              q.status === "ACCEPTED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {q.status}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600 space-y-0.5">
                        <div>
                          {new Date(q.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        {q.validUntil && (
                          <div className="text-[11px] text-rose-600 font-medium">
                            Valid: {new Date(q.validUntil).toLocaleDateString("en-IN")}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{clientName}</div>
                        <div className="text-xs text-slate-500">{clientPhone}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800 text-xs max-w-[200px] truncate">
                          {q.package?.name}
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          {q.roomType} Sharing
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs space-y-0.5">
                        <div className="font-semibold text-slate-800">
                          {adults} Adult{adults > 1 ? "s" : ""}
                        </div>
                        {(childrenCount > 0 || infants > 0) && (
                          <div className="text-[11px] text-slate-500">
                            {childrenCount > 0 ? `${childrenCount} Child` : ""}
                            {childrenCount > 0 && infants > 0 ? " • " : ""}
                            {infants > 0 ? `${infants} Infant` : ""}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-sm text-emerald-800">
                          ₹{Number(q.total).toLocaleString("en-IN")}
                        </div>
                        {discAmt > 0 && (
                          <div className="text-[10px] font-semibold text-emerald-700">
                            Disc: -₹{Number(discAmt).toLocaleString("en-IN")}
                            {q.discountReason ? ` (${q.discountReason})` : ""}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500">
                          Adv: ₹{Number(q.advanceRequired || 0).toLocaleString("en-IN")}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/admin/quotations/${q.id}`}
                            title="View & Print PDF"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View / PDF
                          </Link>
                          <Link
                            href={`/admin/quotations/${q.id}/edit`}
                            title="Edit Quotation"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noreferrer"
                            title="Send on WhatsApp"
                            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            disabled={deletingId === q.id}
                            onClick={() => handleDelete(q.id, q.quotationNumber)}
                            title="Delete Quotation"
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
