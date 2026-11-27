"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Save,
  Plus,
  Trash2,
  Loader2,
  Edit3,
  Eye,
  CreditCard,
} from "lucide-react";
import AlGafurDocumentTemplate, {
  DocumentPilgrimRow,
} from "@/components/print/AlGafurDocumentTemplate";

interface InvoiceReceiptEditorClientProps {
  invoice: any;
  siteSettings?: Record<string, string>;
}

export default function InvoiceReceiptEditorClient({
  invoice,
  siteSettings = {},
}: InvoiceReceiptEditorClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const initialCustomerName =
    invoice.customerName || invoice.customer?.name || "Haji Pilgrim";
  const initialCustomerPhone =
    invoice.customerPhone || invoice.customer?.phone || "";
  const initialCustomerCity =
    invoice.customerCity || invoice.customer?.city || "";
  const initialPackageName =
    invoice.packageName || invoice.booking?.package?.name || "Umrah Package";

  const [customerName, setCustomerName] = useState<string>(initialCustomerName);
  const [customerPhone, setCustomerPhone] = useState<string>(initialCustomerPhone);
  const [customerCity, setCustomerCity] = useState<string>(initialCustomerCity);
  const [packageName, setPackageName] = useState<string>(initialPackageName);
  const [bookingDate, setBookingDate] = useState<string>(
    invoice.bookingDate ||
      new Date(invoice.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
  );
  const [airlines, setAirlines] = useState<string>(
    invoice.airlines || invoice.booking?.package?.airline || "Saudi / Air India"
  );
  const [departure, setDeparture] = useState<string>(
    invoice.departure || invoice.booking?.package?.departureCity || "Mumbai (BOM)"
  );
  const [arrival, setArrival] = useState<string>(
    invoice.arrival || invoice.booking?.package?.arrivalAirport || "Jeddah (JED)"
  );
  const [days, setDays] = useState<number>(
    invoice.days || invoice.booking?.package?.durationDays || 15
  );
  const [paymentMode, setPaymentMode] = useState<string>(
    invoice.paymentMode || "BANK_TRANSFER"
  );

  const [totalBillAmount, setTotalBillAmount] = useState<number>(
    invoice.totalBillAmount || invoice.total || 0
  );
  const [discountAmount, setDiscountAmount] = useState<number>(
    invoice.discountAmount || invoice.discount || 0
  );
  const [advanceAmount, setAdvanceAmount] = useState<number>(
    invoice.advanceAmount || 0
  );
  const [paidAmount, setPaidAmount] = useState<number>(invoice.paidAmount || 0);
  const [notes, setNotes] = useState<string>(invoice.notes || "");

  const [pilgrims, setPilgrims] = useState<DocumentPilgrimRow[]>(() => {
    if (Array.isArray(invoice.pilgrimsJson) && invoice.pilgrimsJson.length > 0) {
      return invoice.pilgrimsJson.map((p: any, i: number) => ({
        srNo: p.srNo || i + 1,
        name: p.name || "",
        passportNo: p.passportNo || "",
        contactNo: p.contactNo || "",
        amount: p.amount ?? "",
      }));
    }
    return [
      {
        srNo: 1,
        name: initialCustomerName,
        passportNo: "",
        contactNo: initialCustomerPhone,
        amount: invoice.totalBillAmount || invoice.total || 0,
      },
    ];
  });

  const remainingAmount = useMemo(
    () => Math.max(0, Number(totalBillAmount || 0) - Number(paidAmount || 0)),
    [totalBillAmount, paidAmount]
  );

  const handleAddPilgrim = () => {
    setPilgrims((prev) => [
      ...prev,
      {
        srNo: prev.length + 1,
        name: "",
        passportNo: "",
        contactNo: "",
        amount: "",
      },
    ]);
  };

  const handleRemovePilgrim = (idx: number) => {
    setPilgrims((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((row, i) => ({ ...row, srNo: i + 1 }))
    );
  };

  const handlePilgrimChange = (
    idx: number,
    field: keyof DocumentPilgrimRow,
    value: string | number
  ) => {
    setPilgrims((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerCity,
          packageName,
          bookingDate,
          airlines,
          departure,
          arrival,
          days,
          paymentMode,
          pilgrimsJson: pilgrims,
          totalBillAmount,
          discountAmount,
          advanceAmount,
          paidAmount,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update receipt.");
      }
      setSaveMessage("Receipt & Pilgrim Roster saved successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error saving receipt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-16">
      {/* Action Bar (Hidden in Print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/invoices"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-emerald-900">
                {invoice.invoiceNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  remainingAmount <= 0 && totalBillAmount > 0
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {remainingAmount <= 0 && totalBillAmount > 0 ? "PAID" : invoice.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Official AL-GAFUR Booking Receipt &amp; Haji Roster
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold"
          >
            {isEditing ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                Preview Receipt
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                Edit Haji Roster &amp; Payments
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-emerald-950 text-xs font-bold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Download PDF
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="no-print p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {saveMessage}
        </div>
      )}

      {/* Editable Form Drawer (Hidden in Print) */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="no-print bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              Edit Receipt Details, Pilgrim Roster &amp; Payment Ledger
            </h2>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? "Saving..." : "Save Receipt"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Booking Date</label>
              <input
                type="text"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Airlines</label>
              <input
                type="text"
                value={airlines}
                onChange={(e) => setAirlines(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Days</label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Departure</label>
              <input
                type="text"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Arrival</label>
              <input
                type="text"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 font-semibold"
              >
                <option value="BANK_TRANSFER">Bank Account Transfer</option>
                <option value="CASH">Cash</option>
                <option value="MIXED">Both (Bank Transfer + Cash)</option>
              </select>
            </div>
          </div>

          {/* Pilgrim Roster Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase">
                Pilgrim Roster (Name of Haji, Passport No, Contact No, Amount)
              </span>
              <button
                type="button"
                onClick={handleAddPilgrim}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Haji Row
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-2 py-2 w-12 text-center">Sr.</th>
                    <th className="px-2 py-2 text-left">Name of Haji</th>
                    <th className="px-2 py-2 text-left w-36">Passport No</th>
                    <th className="px-2 py-2 text-left w-36">Contact No</th>
                    <th className="px-2 py-2 text-right w-32">Amount (₹)</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pilgrims.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1.5 text-center font-bold">{row.srNo}</td>
                      <td className="px-2 py-1.5">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handlePilgrimChange(idx, "name", e.target.value)}
                          placeholder="Full Name as per Passport"
                          className="w-full rounded border border-slate-300 px-2 py-1 text-slate-900"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="text"
                          value={row.passportNo || ""}
                          onChange={(e) =>
                            handlePilgrimChange(idx, "passportNo", e.target.value.toUpperCase())
                          }
                          placeholder="e.g. Z1234567"
                          className="w-full rounded border border-slate-300 px-2 py-1 font-mono text-slate-900"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="text"
                          value={row.contactNo || ""}
                          onChange={(e) => handlePilgrimChange(idx, "contactNo", e.target.value)}
                          placeholder="Mobile"
                          className="w-full rounded border border-slate-300 px-2 py-1 font-mono text-slate-900"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          value={row.amount ?? ""}
                          onChange={(e) => handlePilgrimChange(idx, "amount", e.target.value)}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-right font-semibold text-slate-900"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {pilgrims.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePilgrim(idx)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Summary Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Total Bill Amount (₹)
              </label>
              <input
                type="number"
                value={totalBillAmount}
                onChange={(e) => setTotalBillAmount(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-bold text-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Advance Amount (₹)
              </label>
              <input
                type="number"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-bold text-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-emerald-800 mb-1">
                Paid Amount (₹)
              </label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-emerald-400 px-3 py-2 font-bold text-emerald-900 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-rose-700 mb-1">
                Remaining Amount (₹)
              </label>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 font-extrabold text-rose-800">
                ₹{remainingAmount.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Receipt Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
            />
          </div>
        </form>
      )}

      {/* Branded Printable Official AL-GAFUR Receipt / Invoice */}
      <AlGafurDocumentTemplate
        mode="INVOICE"
        documentNumber={invoice.invoiceNumber}
        dateLabel={bookingDate}
        customerName={customerName}
        customerPhone={customerPhone}
        customerCity={customerCity}
        packageName={packageName}
        airlines={airlines}
        departure={departure}
        arrival={arrival}
        days={days}
        paymentMode={paymentMode}
        pilgrimRows={pilgrims}
        subtotal={invoice.subtotal || totalBillAmount + discountAmount}
        discountAmount={discountAmount}
        discountReason={invoice.discountReason}
        gstAmount={invoice.tax || 0}
        totalBillAmount={totalBillAmount}
        advanceAmount={advanceAmount}
        paidAmount={paidAmount}
        remainingAmount={remainingAmount}
        specialNotes={notes}
        terms={invoice.terms}
        siteSettings={siteSettings}
      />
    </div>
  );
}
