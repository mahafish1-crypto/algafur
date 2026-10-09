"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Search,
  Plus,
  Receipt,
  Printer,
  CheckCircle,
  Building2,
  Calendar,
  Wallet,
  ArrowUpRight,
  User,
  X,
} from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";

interface PaymentItem {
  id: string;
  receiptNumber: string;
  bookingId: string;
  customerId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string | null;
  status: string;
  paymentDate: string;
  notes?: string | null;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
  };
  booking: {
    id: string;
    bookingNumber: string;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    package?: {
      id: string;
      name: string;
    } | null;
  };
  createdBy?: {
    id: string;
    name: string;
  } | null;
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
  initialPayments: PaymentItem[];
  bookings: BookingOption[];
}

export default function AdminPaymentsClient({
  initialPayments,
  bookings,
}: Props) {
  const [payments, setPayments] = useState<PaymentItem[]>(initialPayments);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [recordForm, setRecordForm] = useState({
    bookingId: bookings[0]?.id || "",
    amount: "",
    paymentMethod: "BANK_TRANSFER",
    transactionId: "",
    notes: "",
  });

  const selectedBookingDetails = bookings.find((b) => b.id === recordForm.bookingId);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.bookingId || !recordForm.amount) {
      alert("Please select a booking and enter amount");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordForm),
      });

      if (res.ok) {
        const json = await res.json();
        setPayments((prev) => [json.payment, ...prev]);
        setIsRecordModalOpen(false);
        setSelectedReceipt(json.payment);
        setRecordForm({
          bookingId: bookings[0]?.id || "",
          amount: "",
          paymentMethod: "BANK_TRANSFER",
          transactionId: "",
          notes: "",
        });
      } else {
        const error = await res.json();
        alert(error.error || "Failed to record payment");
      }
    } catch (err) {
      console.error(err);
      alert("Error recording payment");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesMethod =
      methodFilter === "ALL" ? true : p.paymentMethod === methodFilter;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      p.receiptNumber?.toLowerCase().includes(term) ||
      p.transactionId?.toLowerCase().includes(term) ||
      p.customer?.name?.toLowerCase().includes(term) ||
      p.customer?.phone?.toLowerCase().includes(term) ||
      p.booking?.bookingNumber?.toLowerCase().includes(term);

    return matchesMethod && matchesSearch;
  });

  const totalCollected = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const upiTotal = payments
    .filter((p) => p.paymentMethod === "UPI")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const bankTotal = payments
    .filter((p) => p.paymentMethod === "BANK_TRANSFER")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const cashTotal = payments
    .filter((p) => p.paymentMethod === "CASH")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-7 h-7 text-emerald-700" />
            Financial Management & Payment Receipts
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time collection ledger, payment receipts, and reconciliation for Hajj & Umrah bookings.
          </p>
        </div>
        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Record Advance / Payment
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Collections
          </p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            ₹{totalCollected.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {payments.length} verified receipts issued
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Bank Transfer (NEFT/RTGS)
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₹{bankTotal.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-1">Direct company account</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            UPI / QR Collections
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₹{upiTotal.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-1">Instant verified transfers</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Cash / In-Office
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₹{cashTotal.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-1">Office counter receipts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Method filter */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: "ALL", label: "All Methods" },
            { id: "BANK_TRANSFER", label: "Bank Transfer" },
            { id: "UPI", label: "UPI" },
            { id: "CASH", label: "Cash" },
            { id: "CARD", label: "Card / Online" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMethodFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                methodFilter === tab.id
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receipt, booking, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Receipt #</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Pilgrim / Customer</th>
                <th className="px-5 py-3.5">Booking Ref</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Method & Ref</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {p.receiptNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{p.customer?.name}</div>
                      <div className="text-xs text-slate-500">{p.customer?.phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {p.booking?.bookingNumber}
                      </span>
                      <div className="text-xs text-slate-500 mt-0.5 max-w-[180px] truncate">
                        {p.booking?.package?.name}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-emerald-800">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </div>
                      <span className="inline-block text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5">
                        PAID &bull; VERIFIED
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-medium text-slate-800">
                        {p.paymentMethod.replace("_", " ")}
                      </div>
                      {p.transactionId && (
                        <div className="font-mono text-[11px] text-slate-500 truncate max-w-[140px]">
                          Ref: {p.transactionId}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium text-xs border border-emerald-200 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Record Payment / Advance</h3>
                <p className="text-xs text-emerald-200">
                  Issues official Al-Gafur receipt and adjusts booking outstanding balance
                </p>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-emerald-200 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Select Booking *
                </label>
                <select
                  value={recordForm.bookingId}
                  onChange={(e) => setRecordForm({ ...recordForm, bookingId: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                >
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingNumber} &mdash; {b.customer.name} (Due: ₹
                      {b.outstandingAmount.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              {selectedBookingDetails && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-slate-500 block">Total</span>
                    <span className="font-semibold text-slate-800">
                      ₹{selectedBookingDetails.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Already Paid</span>
                    <span className="font-semibold text-emerald-700">
                      ₹{selectedBookingDetails.paidAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Balance Due</span>
                    <span className="font-semibold text-rose-700">
                      ₹{selectedBookingDetails.outstandingAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Amount Received (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={recordForm.amount}
                    onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-semibold bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={recordForm.paymentMethod}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, paymentMethod: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI / GooglePay / PhonePe</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="CHEQUE">Cheque / Demand Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Bank UTR / Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001239871"
                  value={recordForm.transactionId}
                  onChange={(e) =>
                    setRecordForm({ ...recordForm, transactionId: e.target.value })
                  }
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Advance for Umrah package registration..."
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Generate Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Official Payment Receipt</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-emerald-200 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Printable Area */}
            <div className="p-8 overflow-y-auto print-area space-y-6">
              {/* Receipt Header with Official Logo */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                <div>
                  <BrandLogo variant="light" size="md" />
                  <p className="text-xs text-slate-500 mt-1">
                    Govt. Approved Hajj & Umrah Tour Operator
                  </p>
                  <p className="text-xs text-slate-500">
                    Head Office: Mumbai, Maharashtra, India
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    Official Receipt
                  </div>
                  <p className="font-mono font-bold text-sm text-slate-900 mt-2">
                    {selectedReceipt.receiptNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    Date:{" "}
                    {new Date(selectedReceipt.paymentDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Customer and Booking Details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Received From:
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedReceipt.customer?.name}
                  </p>
                  <p className="text-slate-600 mt-0.5">Phone: {selectedReceipt.customer?.phone}</p>
                  {selectedReceipt.customer?.email && (
                    <p className="text-slate-600">Email: {selectedReceipt.customer?.email}</p>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Tour / Booking Details:
                  </p>
                  <p className="text-sm font-bold text-emerald-800 mt-0.5">
                    {selectedReceipt.booking?.bookingNumber}
                  </p>
                  <p className="text-slate-700 mt-0.5">
                    Package: {selectedReceipt.booking?.package?.name || "Hajj / Umrah Journey"}
                  </p>
                  <p className="text-slate-600">
                    Payment Mode: {selectedReceipt.paymentMethod.replace("_", " ")}
                  </p>
                </div>
              </div>

              {/* Amount Box */}
              <div className="border border-emerald-200 rounded-xl p-5 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-emerald-800">
                    Amount Received
                  </p>
                  <p className="text-3xl font-bold text-emerald-950 mt-1">
                    ₹{selectedReceipt.amount.toLocaleString("en-IN")}
                  </p>
                  {selectedReceipt.transactionId && (
                    <p className="text-xs text-slate-600 mt-1 font-mono">
                      Transaction Ref: {selectedReceipt.transactionId}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5" />
                    PAID IN FULL
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Balance Due on Tour: ₹
                    {selectedReceipt.booking?.outstandingAmount?.toLocaleString("en-IN") || 0}
                  </p>
                </div>
              </div>

              {/* Terms and Signatures */}
              <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
                <div className="max-w-xs text-[10px] text-slate-500 leading-relaxed">
                  <p className="font-semibold text-slate-700">Terms & Acknowledgement:</p>
                  <p>
                    Receipt generated electronically by AL-GAFUR International Tours And Travels. All
                    advances are subject to booking terms, visa regulations, and airlines policy.
                  </p>
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

