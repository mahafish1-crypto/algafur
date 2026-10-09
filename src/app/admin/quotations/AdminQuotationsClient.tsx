"use client";

import React, { useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Printer,
  Calendar,
  Send,
  CheckCircle,
  Building2,
  Clock,
  Sparkles,
  MessageCircle,
  X,
  ExternalLink,
} from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";

interface QuotationItem {
  id: string;
  quotationNumber: string;
  customerId?: string | null;
  leadId?: string | null;
  packageId: string;
  travellersCount: number;
  roomType: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  advanceRequired: number;
  balanceAmount: number;
  terms?: string | null;
  validUntil?: string | null;
  status: string;
  createdAt: string;
  customer?: { id: string; name: string; phone: string; email?: string | null } | null;
  lead?: { id: string; name: string; mobile: string; email?: string | null } | null;
  package: {
    id: string;
    name: string;
    type: string;
    durationDays: number;
    makkahHotelName?: string | null;
    madinahHotelName?: string | null;
    makkahDistance?: string | null;
    madinahDistance?: string | null;
    departureDate?: string | null;
    inclusions?: Array<{ id: string; title: string; isIncluded: boolean }> | null;
  };
}

interface PackageOption {
  id: string;
  name: string;
  type: string;
  durationDays: number;
  basePrice: number;
  priceQuad?: number | null;
  priceTriple?: number | null;
  priceDouble?: number | null;
  priceSingle?: number | null;
  makkahHotelName?: string | null;
  madinahHotelName?: string | null;
  makkahDistance?: string | null;
  madinahDistance?: string | null;
  departureDate?: string | null;
}

interface CustomerOption {
  id: string;
  name: string;
  phone: string;
}

interface Props {
  initialQuotations: QuotationItem[];
  packages: PackageOption[];
  customers: CustomerOption[];
}

export default function AdminQuotationsClient({
  initialQuotations,
  packages,
  customers,
}: Props) {
  const [quotations, setQuotations] = useState<QuotationItem[]>(initialQuotations);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuotationItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedPkgId, setSelectedPkgId] = useState(packages[0]?.id || "");
  const [selectedCustId, setSelectedCustId] = useState(customers[0]?.id || "");
  const [travellersCount, setTravellersCount] = useState(2);
  const [roomType, setRoomType] = useState<"QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE">("QUAD");
  const [discount, setDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(5); // 5% GST on tour
  const [advancePercent, setAdvancePercent] = useState(30); // 30% advance

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];

  // Dynamic calculations
  const getRatePerPerson = () => {
    if (!selectedPkg) return 120000;
    if (roomType === "SINGLE" && selectedPkg.priceSingle) return selectedPkg.priceSingle;
    if (roomType === "DOUBLE" && selectedPkg.priceDouble) return selectedPkg.priceDouble;
    if (roomType === "TRIPLE" && selectedPkg.priceTriple) return selectedPkg.priceTriple;
    return selectedPkg.priceQuad || selectedPkg.basePrice || 120000;
  };

  const ratePerPerson = getRatePerPerson();
  const subtotal = ratePerPerson * travellersCount;
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const taxAmount = (taxableSubtotal * taxPercent) / 100;
  const totalAmount = taxableSubtotal + taxAmount;
  const advanceRequired = Math.round((totalAmount * advancePercent) / 100);
  const balanceDue = totalAmount - advanceRequired;

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        packageId: selectedPkgId,
        customerId: selectedCustId || null,
        travellersCount,
        roomType,
        subtotal,
        discount,
        tax: taxAmount,
        total: totalAmount,
        advanceRequired,
        balanceAmount: balanceDue,
        validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
      };

      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        setQuotations((prev) => [json.quotation, ...prev]);
        setIsCreateOpen(false);
        setSelectedQuote(json.quotation);
      } else {
        alert("Failed to create quotation.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating quotation.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQuotes = quotations.filter((q) => {
    const term = search.toLowerCase();
    return (
      !term ||
      q.quotationNumber?.toLowerCase().includes(term) ||
      q.customer?.name?.toLowerCase().includes(term) ||
      q.customer?.phone?.toLowerCase().includes(term) ||
      q.package?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-emerald-700" />
            Quotation Generator & Tour Estimator
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Build branded multi-occupancy pricing proposals, share directly on WhatsApp, and print PDF sheets.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Quotation
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <p className="text-sm text-slate-600 font-medium">
          Total Quotations Issued: <span className="font-bold text-slate-900">{quotations.length}</span>
        </p>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quotation ref, pilgrim..."
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
                <th className="px-5 py-3.5">Quotation Ref</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Pilgrim / Customer</th>
                <th className="px-5 py-3.5">Package & Room</th>
                <th className="px-5 py-3.5">Travellers</th>
                <th className="px-5 py-3.5">Total Amount</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No quotations generated yet. Click "Create New Quotation" to build one.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => {
                  const clientName = q.customer?.name || q.lead?.name || "Prospective Pilgrim";
                  const clientPhone = q.customer?.phone || q.lead?.mobile || "";

                  return (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {q.quotationNumber}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {new Date(q.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
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
                          {q.roomType} Room
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                          {q.travellersCount} {q.travellersCount === 1 ? "Pilgrim" : "Pilgrims"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-sm text-emerald-800">
                          ₹{q.total.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Adv: ₹{q.advanceRequired.toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedQuote(q)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium text-xs border border-emerald-200 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Proposal
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Quotation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">New Tour Quotation</h3>
                <p className="text-xs text-emerald-200">
                  Select package, occupancy, and calculate package pricing
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Customer / Pilgrim *
                </label>
                <select
                  value={selectedCustId}
                  onChange={(e) => setSelectedCustId(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} &mdash; {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Tour Package *
                </label>
                <select
                  value={selectedPkgId}
                  onChange={(e) => setSelectedPkgId(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.durationDays} Days &bull; Base ₹{p.basePrice.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Room Sharing / Occupancy
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as any)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="QUAD">Quad Sharing (4 in a room)</option>
                    <option value="TRIPLE">Triple Sharing (3 in a room)</option>
                    <option value="DOUBLE">Double Sharing (2 in a room)</option>
                    <option value="SINGLE">Single Room (Private)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Number of Travellers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={travellersCount}
                    onChange={(e) => setTravellersCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    GST / Tax (%)
                  </label>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Advance Req (%)
                  </label>
                  <input
                    type="number"
                    value={advancePercent}
                    onChange={(e) => setAdvancePercent(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              {/* Dynamic Calculation Preview */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Rate Per Person ({roomType}):</span>
                  <span className="font-semibold text-slate-900">
                    ₹{ratePerPerson.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({travellersCount} pilgrims):</span>
                  <span className="font-semibold text-slate-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount Applied:</span>
                    <span>-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>GST ({taxPercent}%):</span>
                  <span>+₹{taxAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-sm text-emerald-950">
                  <span>Total Proposal Amount:</span>
                  <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1">
                  <span>Booking Advance ({advancePercent}%):</span>
                  <span className="font-medium text-emerald-800">
                    ₹{advanceRequired.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Generating..." : "Save & Preview Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branded Printable Quotation Sheet Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[95vh] flex flex-col">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Official Tour Quotation & Itinerary Proposal</h3>
              </div>
              <div className="flex items-center gap-2">
                {selectedQuote.customer?.phone && (
                  <a
                    href={`https://wa.me/${selectedQuote.customer.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Assalamu Alaikum ${selectedQuote.customer.name},\nHere is your official Umrah Quotation from AL-GAFUR International Tours And Travels.\n\nRef: ${selectedQuote.quotationNumber}\nPackage: ${selectedQuote.package.name}\nPilgrims: ${selectedQuote.travellersCount}\nRoom: ${selectedQuote.roomType}\nTotal Amount: ₹${selectedQuote.total.toLocaleString("en-IN")}\nAdvance to Confirm: ₹${selectedQuote.advanceRequired.toLocaleString("en-IN")}\n\nCall us for instant booking!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Share WhatsApp
                  </a>
                )}
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Proposal
                </button>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-emerald-200 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quotation Sheet Printable Area */}
            <div className="p-8 overflow-y-auto print-area space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                <div>
                  <BrandLogo variant="light" size="md" />
                  <p className="text-xs text-slate-500 mt-1">
                    Govt. Approved Hajj & Umrah Tour Operator
                  </p>
                  <p className="text-xs text-slate-500">
                    Phone: +91 98200 00000 | Email: info@algafurtours.com
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    Official Quotation
                  </span>
                  <p className="font-mono font-bold text-base text-slate-900 mt-2">
                    {selectedQuote.quotationNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    Date:{" "}
                    {new Date(selectedQuote.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {selectedQuote.validUntil && (
                    <p className="text-xs text-rose-600 font-medium">
                      Valid Until:{" "}
                      {new Date(selectedQuote.validUntil).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Quotation Prepared For:
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedQuote.customer?.name || selectedQuote.lead?.name || "Respected Pilgrim"}
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    Phone: {selectedQuote.customer?.phone || selectedQuote.lead?.mobile}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Tour Specifications:
                  </p>
                  <p className="text-sm font-bold text-emerald-900 mt-0.5">
                    {selectedQuote.package.name}
                  </p>
                  <p className="text-slate-700">
                    Duration: {selectedQuote.package.durationDays} Days &bull; Departure:{" "}
                    {selectedQuote.package.departureDate || "Next scheduled group"}
                  </p>
                </div>
              </div>

              {/* Accommodation & Inclusions Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    Hotel Accommodations
                  </p>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium text-slate-700">Makkah: </span>
                      <span className="text-slate-900">
                        {selectedQuote.package.makkahHotelName || "Diyafa Jamal or similar"}
                      </span>
                      <span className="text-slate-500 block text-[11px]">
                        Distance: {selectedQuote.package.makkahDistance || "500m walking"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Madinah: </span>
                      <span className="text-slate-900">
                        {selectedQuote.package.madinahHotelName || "Ilaf Kuba or similar"}
                      </span>
                      <span className="text-slate-500 block text-[11px]">
                        Distance: {selectedQuote.package.madinahDistance || "400m walking"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Package Inclusions
                  </p>
                  <ul className="text-[11px] text-slate-700 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Direct Return Flight (BOM/JED)
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Saudi Tourist/Umrah Visa & Medical Insurance
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> 5 Umrahs Guided by Experienced Scholars
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Buffet Indian/Hyderabadi Meals (3 times)
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Ziyarat of Makkah & Madinah Historical Sites
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Luxury AC High-Speed Bus Transport
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pricing Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-emerald-900 text-white font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Item Description</th>
                      <th className="px-4 py-2.5">Occupancy</th>
                      <th className="px-4 py-2.5 text-center">Pax</th>
                      <th className="px-4 py-2.5 text-right">Rate / Pax</th>
                      <th className="px-4 py-2.5 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="px-4 py-3 font-medium">
                        {selectedQuote.package.name} Complete Package
                      </td>
                      <td className="px-4 py-3">{selectedQuote.roomType} Sharing</td>
                      <td className="px-4 py-3 text-center font-bold">
                        {selectedQuote.travellersCount}
                      </td>
                      <td className="px-4 py-3 text-right">
                        ₹{Math.round(selectedQuote.subtotal / selectedQuote.travellersCount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ₹{selectedQuote.subtotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    {selectedQuote.discount > 0 && (
                      <tr className="text-emerald-700">
                        <td colSpan={4} className="px-4 py-2 text-right">Special Early-Bird / Group Discount:</td>
                        <td className="px-4 py-2 text-right font-semibold">-₹{selectedQuote.discount.toLocaleString("en-IN")}</td>
                      </tr>
                    )}
                    {selectedQuote.tax > 0 && (
                      <tr className="text-slate-600">
                        <td colSpan={4} className="px-4 py-2 text-right">GST & Tour Compliance Tax:</td>
                        <td className="px-4 py-2 text-right font-semibold">+₹{selectedQuote.tax.toLocaleString("en-IN")}</td>
                      </tr>
                    )}
                    <tr className="bg-emerald-50 text-emerald-950 font-bold text-sm">
                      <td colSpan={4} className="px-4 py-3 text-right">Grand Total:</td>
                      <td className="px-4 py-3 text-right text-base text-emerald-900">
                        ₹{selectedQuote.total.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Booking Confirmation Terms */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-amber-950">To Confirm This Quotation & Reserve Seats:</p>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    Advance of ₹{selectedQuote.advanceRequired.toLocaleString("en-IN")} is required along with passport copies.
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-950 text-base">
                    Advance: ₹{selectedQuote.advanceRequired.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
                <div className="max-w-xs text-[10px] text-slate-500">
                  <p className="font-semibold text-slate-700">Terms:</p>
                  <p>{selectedQuote.terms || "Subject to seat and room availability at the time of booking."}</p>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1"></div>
                  <p className="text-xs font-semibold text-slate-800">Authorized Officer</p>
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

