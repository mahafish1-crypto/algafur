"use client";

import React, { useState } from "react";
import {
  Receipt,
  Search,
  Plus,
  Printer,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  CreditCard,
  FileText,
} from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  customerId: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  dueDate?: string | null;
  status: string;
  notes?: string | null;
  terms?: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
  };
  booking: {
    id: string;
    bookingNumber: string;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    paymentStatus: string;
    adults: number;
    roomType: string;
    package?: {
      id: string;
      name: string;
      durationDays: number;
      departureDate?: string | null;
    } | null;
  };
}

interface BookingOption {
  id: string;
  bookingNumber: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
}

interface Props {
  initialInvoices: InvoiceItem[];
  bookings: BookingOption[];
  siteSettings?: Record<string, string>;
}

export default function AdminInvoicesClient({
  initialInvoices,
  bookings,
  siteSettings = {},
}: Props) {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [generateForm, setGenerateForm] = useState({
    bookingId: bookings[0]?.id || "",
    dueDate: "",
    notes: "Official Tax Invoice for Umrah pilgrimage tour.",
  });

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateForm.bookingId) {
      alert("Please select a booking");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generateForm),
      });

      if (res.ok) {
        const json = await res.json();
        setInvoices((prev) => [json.invoice, ...prev]);
        setIsGenerateOpen(false);
        setSelectedInvoice(json.invoice);
      } else {
        alert("Failed to generate invoice.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      statusFilter === "ALL" ? true : inv.status === statusFilter;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      inv.invoiceNumber?.toLowerCase().includes(term) ||
      inv.customer?.name?.toLowerCase().includes(term) ||
      inv.customer?.phone?.toLowerCase().includes(term) ||
      inv.booking?.bookingNumber?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.total, 0);
  const totalPaid = invoices.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalDue = invoices.reduce((acc, curr) => acc + curr.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-emerald-700" />
            Tax Invoices & Billing
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Generate GST-compliant tax invoices, track receivables, and issue branded payment bills.
          </p>
        </div>
        <button
          onClick={() => setIsGenerateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Invoiced
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₹{totalInvoiced.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-1">{invoices.length} invoices generated</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Collections Realized
          </p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            ₹{totalPaid.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-1">Cleared against bookings</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Outstanding Due
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            ₹{totalDue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-1">Receivables awaiting settlement</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: "ALL", label: "All Invoices" },
            { id: "ISSUED", label: "Pending Payment" },
            { id: "PAID", label: "Paid" },
            { id: "OVERDUE", label: "Overdue" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === tab.id
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Booking Ref</th>
                <th className="px-5 py-3.5">Total Amount</th>
                <th className="px-5 py-3.5">Balance Due</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No invoices found. Click "Generate Invoice" to issue one.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{inv.customer?.name}</div>
                      <div className="text-xs text-slate-500">{inv.customer?.phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {inv.booking?.bookingNumber}
                      </span>
                      <div className="text-xs text-slate-500 mt-0.5 max-w-[180px] truncate">
                        {inv.booking?.package?.name}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      ₹{inv.total.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-semibold text-sm ${
                          inv.balanceDue > 0 ? "text-rose-600" : "text-emerald-700"
                        }`}
                      >
                        ₹{inv.balanceDue.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          inv.status === "PAID"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {inv.status === "PAID" ? "PAID" : "PENDING"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium text-xs border border-emerald-200 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Generate Tax Invoice</h3>
                <p className="text-xs text-emerald-200">
                  Select booking to create official GST-compliant invoice
                </p>
              </div>
              <button
                onClick={() => setIsGenerateOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Select Booking *
                </label>
                <select
                  value={generateForm.bookingId}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, bookingId: e.target.value })
                  }
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                >
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingNumber} &mdash; {b.customer.name} (Total: ₹
                      {b.totalAmount.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={generateForm.dueDate}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, dueDate: e.target.value })
                  }
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={generateForm.notes}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, notes: e.target.value })
                  }
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Issuing..." : "Issue Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Branded Tax Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[95vh] flex flex-col">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Official Tax Invoice</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Download PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-emerald-200 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Printable Area */}
            <div className="p-8 overflow-y-auto print-area space-y-6">
              {/* Header with Official Logo */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                <div>
                  <BrandLogo
                    variant="light"
                    size="md"
                    customLogoUrl={siteSettings.site_logo || siteSettings.header_logo || ""}
                  />
                  <p className="text-xs text-slate-500 mt-1 font-semibold">
                    {siteSettings.company_name || "AL-GAFUR International Tours And Travels"}
                  </p>
                  <p className="text-xs text-slate-500">
                    GSTIN: {siteSettings.gst_number || "27AABCA1234F1Z5"} &bull; PAN: {siteSettings.pan_number || "AABCA1234F"}
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Head Office: {siteSettings.company_address || "183, M.G. Road, 15 August Chowk, Khadda Market, Near Camp, Pune - 411001, Maharashtra, India."}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    TAX INVOICE
                  </span>
                  <p className="font-mono font-bold text-base text-slate-900 mt-2">
                    {selectedInvoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    Date:{" "}
                    {new Date(selectedInvoice.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-slate-700 font-mono mt-0.5">
                    Booking: {selectedInvoice.booking?.bookingNumber}
                  </p>
                </div>
              </div>

              {/* Billed To Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Billed To / Pilgrim Details:
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedInvoice.customer?.name}
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    Phone: {selectedInvoice.customer?.phone}
                  </p>
                  {selectedInvoice.customer?.email && (
                    <p className="text-slate-600">Email: {selectedInvoice.customer?.email}</p>
                  )}
                  {selectedInvoice.customer?.address && (
                    <p className="text-slate-600 mt-0.5">
                      Address: {selectedInvoice.customer.address},{" "}
                      {selectedInvoice.customer.city || "Mumbai"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Tour Specifications:
                  </p>
                  <p className="text-sm font-bold text-emerald-900 mt-0.5">
                    {selectedInvoice.booking?.package?.name || "Hajj / Umrah Journey"}
                  </p>
                  <p className="text-slate-700">
                    Occupancy: {selectedInvoice.booking?.roomType} Sharing &bull; Travellers:{" "}
                    {selectedInvoice.booking?.adults} Adults
                  </p>
                  <p className="text-slate-500">
                    Departure: {selectedInvoice.booking?.package?.departureDate || "Scheduled Departure"}
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-emerald-900 text-white font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Description</th>
                      <th className="px-4 py-2.5">HSN/SAC</th>
                      <th className="px-4 py-2.5 text-center">Pax</th>
                      <th className="px-4 py-2.5 text-right">Unit Rate</th>
                      <th className="px-4 py-2.5 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="px-4 py-3 font-medium">
                        {selectedInvoice.booking?.package?.name || "Umrah Package"} Tour Package Services (Flight, Hotel, Visa, Food, Transport, Ziyarat)
                      </td>
                      <td className="px-4 py-3 font-mono">998555</td>
                      <td className="px-4 py-3 text-center font-bold">
                        {selectedInvoice.booking?.adults || 1}
                      </td>
                      <td className="px-4 py-3 text-right">
                        ₹{Math.round(selectedInvoice.subtotal / (selectedInvoice.booking?.adults || 1)).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ₹{selectedInvoice.subtotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td colSpan={4} className="px-4 py-2 text-right text-slate-600">Subtotal:</td>
                      <td className="px-4 py-2 text-right font-semibold">₹{selectedInvoice.subtotal.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr className="bg-emerald-50 text-emerald-950 font-bold text-sm">
                      <td colSpan={4} className="px-4 py-2.5 text-right">Total Invoice Value:</td>
                      <td className="px-4 py-2.5 text-right text-base text-emerald-900">
                        ₹{selectedInvoice.total.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr className="text-emerald-700 font-medium">
                      <td colSpan={4} className="px-4 py-2 text-right">Less: Amount Received / Paid:</td>
                      <td className="px-4 py-2 text-right font-semibold">
                        -₹{selectedInvoice.paidAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr className="bg-rose-50 text-rose-950 font-bold text-sm">
                      <td colSpan={4} className="px-4 py-2.5 text-right">Balance Due Payable:</td>
                      <td className="px-4 py-2.5 text-right text-base text-rose-700">
                        ₹{selectedInvoice.balanceDue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bank Remittance Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-700" />
                    Bank Account Details for Remittance
                  </p>
                  <p className="text-slate-700"><span className="font-medium text-slate-500">Bank:</span> HDFC Bank Limited</p>
                  <p className="text-slate-700"><span className="font-medium text-slate-500">A/C Name:</span> AL GAFUR INTERNATIONAL TOURS AND TRAVELS</p>
                  <p className="text-slate-700"><span className="font-medium text-slate-500">A/C No:</span> 50200088991234</p>
                  <p className="text-slate-700"><span className="font-medium text-slate-500">IFSC:</span> HDFC0000123</p>
                  <p className="text-slate-700"><span className="font-medium text-slate-500">UPI ID:</span> algafurtours@hdfcbank</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1.5">
                    Payment Instructions
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Please mention invoice number <strong className="font-mono text-slate-900">{selectedInvoice.invoiceNumber}</strong> in NEFT/IMPS narration. Share transaction UTR snapshot on WhatsApp for instant receipt generation.
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
                <div className="max-w-xs text-[10px] text-slate-500">
                  <p className="font-semibold text-slate-700">Terms:</p>
                  <p>All package costs subject to government tax rules and airlines regulations. Computer generated invoice.</p>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1"></div>
                  <p className="text-xs font-semibold text-slate-800">Authorized Signatory</p>
                  <p className="text-[10px] text-slate-500">AL-GAFUR International</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

