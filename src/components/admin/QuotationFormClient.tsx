"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Users,
  Baby,
  Building2,
  Percent,
  IndianRupee,
  Calendar,
  Plane,
  Sparkles,
  CheckCircle2,
  UserCheck,
  Loader2,
} from "lucide-react";
import {
  computeQuotationTotals,
  DiscountType,
  RoomSharingType,
} from "@/lib/quotation-math";

export interface QuotationPackageOption {
  id: string;
  name: string;
  type: string;
  durationDays: number;
  makkahNights: number;
  madinahNights: number;
  basePrice: number;
  priceQuad?: number | null;
  priceTriple?: number | null;
  priceDouble?: number | null;
  priceSingle?: number | null;
  childPrice?: number | null;
  infantPrice?: number | null;
  makkahHotelName?: string | null;
  madinahHotelName?: string | null;
  makkahDistance?: string | null;
  madinahDistance?: string | null;
  makkahMealPlan?: string | null;
  madinahMealPlan?: string | null;
  airline?: string | null;
  flightType?: string | null;
  departureDate?: string | null;
  departureCity?: string | null;
}

export interface QuotationCustomerOption {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  city?: string | null;
}

export interface QuotationLeadOption {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  city?: string | null;
  status?: string;
}

interface QuotationFormClientProps {
  packages: QuotationPackageOption[];
  customers: QuotationCustomerOption[];
  leads: QuotationLeadOption[];
  initialQuotation?: any | null;
}

function getPackageRoomPrice(pkg: QuotationPackageOption | undefined, room: RoomSharingType): number {
  if (!pkg) return 120000;
  if (room === "SINGLE" && pkg.priceSingle) return Number(pkg.priceSingle);
  if (room === "DOUBLE" && pkg.priceDouble) return Number(pkg.priceDouble);
  if (room === "TRIPLE" && pkg.priceTriple) return Number(pkg.priceTriple);
  return Number(pkg.priceQuad || pkg.basePrice || 120000);
}

export default function QuotationFormClient({
  packages,
  customers,
  leads,
  initialQuotation = null,
}: QuotationFormClientProps) {
  const router = useRouter();
  const isEdit = Boolean(initialQuotation?.id);

  const defaultPkg =
    packages.find((p) => p.id === initialQuotation?.packageId) || packages[0];

  const defaultRoom = (initialQuotation?.roomType || "QUAD") as RoomSharingType;
  const defaultAdultPrice = initialQuotation?.adultUnitPrice
    ? Number(initialQuotation.adultUnitPrice)
    : getPackageRoomPrice(defaultPkg, defaultRoom);

  const defaultChildPrice =
    initialQuotation?.childWithBedPrice !== undefined && initialQuotation?.childWithBedPrice > 0
      ? Number(initialQuotation.childWithBedPrice)
      : Number(defaultPkg?.childPrice || Math.round(defaultAdultPrice * 0.85));

  const defaultChildNoBedPrice =
    initialQuotation?.childNoBedPrice !== undefined && initialQuotation?.childNoBedPrice > 0
      ? Number(initialQuotation.childNoBedPrice)
      : Number(
          defaultPkg?.childPrice
            ? Math.round(Number(defaultPkg.childPrice) * 0.75)
            : Math.round(defaultAdultPrice * 0.65)
        );

  const defaultInfantPrice =
    initialQuotation?.infantPrice !== undefined && initialQuotation?.infantPrice > 0
      ? Number(initialQuotation.infantPrice)
      : Number(defaultPkg?.infantPrice || 25000);

  // Pilgrim / Lead Linking
  const [customerId, setCustomerId] = useState<string>(initialQuotation?.customerId || "");
  const [leadId, setLeadId] = useState<string>(initialQuotation?.leadId || "");
  const [customerName, setCustomerName] = useState<string>(
    initialQuotation?.customerName ||
      initialQuotation?.customer?.name ||
      initialQuotation?.lead?.name ||
      ""
  );
  const [customerPhone, setCustomerPhone] = useState<string>(
    initialQuotation?.customerPhone ||
      initialQuotation?.customer?.phone ||
      initialQuotation?.lead?.mobile ||
      ""
  );
  const [customerWhatsapp, setCustomerWhatsapp] = useState<string>(
    initialQuotation?.customerWhatsapp ||
      initialQuotation?.customer?.whatsapp ||
      initialQuotation?.customer?.phone ||
      initialQuotation?.lead?.mobile ||
      ""
  );
  const [customerEmail, setCustomerEmail] = useState<string>(
    initialQuotation?.customerEmail ||
      initialQuotation?.customer?.email ||
      initialQuotation?.lead?.email ||
      ""
  );
  const [customerCity, setCustomerCity] = useState<string>(
    initialQuotation?.customerCity ||
      initialQuotation?.customer?.city ||
      initialQuotation?.lead?.city ||
      ""
  );

  // Package & Trip Metadata
  const [packageId, setPackageId] = useState<string>(defaultPkg?.id || "");
  const [roomType, setRoomType] = useState<RoomSharingType>(defaultRoom);
  const [departureCity, setDepartureCity] = useState<string>(
    initialQuotation?.departureCity || defaultPkg?.departureCity || "Mumbai (BOM)"
  );
  const [departureDate, setDepartureDate] = useState<string>(
    initialQuotation?.departureDate || defaultPkg?.departureDate || ""
  );
  const [validUntil, setValidUntil] = useState<string>(() => {
    if (initialQuotation?.validUntil) {
      return new Date(initialQuotation.validUntil).toISOString().split("T")[0];
    }
    return new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  });
  const [balanceDueDate, setBalanceDueDate] = useState<string>(() => {
    if (initialQuotation?.balanceDueDate) {
      return new Date(initialQuotation.balanceDueDate).toISOString().split("T")[0];
    }
    return "";
  });

  // Passenger Counts & Unit Rates
  const [adultCount, setAdultCount] = useState<number>(
    initialQuotation?.adultCount ?? initialQuotation?.travellersCount ?? 2
  );
  const [adultUnitPrice, setAdultUnitPrice] = useState<number>(defaultAdultPrice);

  const [childWithBedCount, setChildWithBedCount] = useState<number>(
    initialQuotation?.childWithBedCount ?? 0
  );
  const [childWithBedPrice, setChildWithBedPrice] = useState<number>(defaultChildPrice);

  const [childNoBedCount, setChildNoBedCount] = useState<number>(
    initialQuotation?.childNoBedCount ?? 0
  );
  const [childNoBedPrice, setChildNoBedPrice] = useState<number>(defaultChildNoBedPrice);

  const [infantCount, setInfantCount] = useState<number>(initialQuotation?.infantCount ?? 0);
  const [infantPrice, setInfantPrice] = useState<number>(defaultInfantPrice);

  // Discount, Tax & Add-ons
  const [discountType, setDiscountType] = useState<DiscountType>(
    (initialQuotation?.discountType || "FLAT") as DiscountType
  );
  const [discountValue, setDiscountValue] = useState<number>(
    initialQuotation?.discountValue ?? initialQuotation?.discount ?? 0
  );
  const [discountReason, setDiscountReason] = useState<string>(
    initialQuotation?.discountReason || ""
  );
  const [taxPercent, setTaxPercent] = useState<number>(
    initialQuotation?.taxPercent ?? (initialQuotation?.tax > 0 ? 5 : 0)
  );
  const [additionalCharges, setAdditionalCharges] = useState<number>(
    initialQuotation?.additionalCharges ?? 0
  );
  const [additionalChargesNote, setAdditionalChargesNote] = useState<string>(
    initialQuotation?.additionalChargesNote || ""
  );

  const [advanceRequired, setAdvanceRequired] = useState<number>(
    initialQuotation?.advanceRequired ?? 0
  );
  const [advanceTouched, setAdvanceTouched] = useState<boolean>(Boolean(initialQuotation?.id));

  const [specialNotes, setSpecialNotes] = useState<string>(
    initialQuotation?.specialNotes || ""
  );
  const [terms, setTerms] = useState<string>(
    initialQuotation?.terms ||
      "Prices are subject to airline fare & Saudi visa slot availability at the time of booking confirmation."
  );
  const [status, setStatus] = useState<string>(initialQuotation?.status || "SENT");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedPkg = useMemo(
    () => packages.find((p) => p.id === packageId) || defaultPkg,
    [packages, packageId, defaultPkg]
  );

  // Live Totals Calculation
  const totals = useMemo(() => {
    const baseCalc = computeQuotationTotals({
      roomType,
      adultCount,
      adultUnitPrice,
      childWithBedCount,
      childWithBedPrice,
      childNoBedCount,
      childNoBedPrice,
      infantCount,
      infantPrice,
      discountType,
      discountValue,
      discountReason,
      taxPercent,
      additionalCharges,
      additionalChargesNote,
      advanceRequired: advanceTouched ? advanceRequired : 0,
    });

    const effectiveAdvance = advanceTouched
      ? advanceRequired
      : Math.round(baseCalc.total * 0.25);

    return {
      ...baseCalc,
      advanceRequired: Math.min(baseCalc.total, effectiveAdvance),
      balanceAmount: Math.max(0, baseCalc.total - Math.min(baseCalc.total, effectiveAdvance)),
    };
  }, [
    roomType,
    adultCount,
    adultUnitPrice,
    childWithBedCount,
    childWithBedPrice,
    childNoBedCount,
    childNoBedPrice,
    infantCount,
    infantPrice,
    discountType,
    discountValue,
    discountReason,
    taxPercent,
    additionalCharges,
    additionalChargesNote,
    advanceRequired,
    advanceTouched,
  ]);

  const handleSelectCustomer = (custId: string) => {
    setCustomerId(custId);
    if (!custId) return;
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setLeadId("");
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setCustomerWhatsapp(found.whatsapp || found.phone);
      setCustomerEmail(found.email || "");
      setCustomerCity(found.city || "");
    }
  };

  const handleSelectLead = (lId: string) => {
    setLeadId(lId);
    if (!lId) return;
    const found = leads.find((l) => l.id === lId);
    if (found) {
      setCustomerId("");
      setCustomerName(found.name);
      setCustomerPhone(found.mobile);
      setCustomerWhatsapp(found.mobile);
      setCustomerEmail(found.email || "");
      setCustomerCity(found.city || "");
    }
  };

  const handlePackageChange = (newPkgId: string) => {
    setPackageId(newPkgId);
    const pkg = packages.find((p) => p.id === newPkgId);
    if (pkg) {
      const unitRate = getPackageRoomPrice(pkg, roomType);
      setAdultUnitPrice(unitRate);
      setChildWithBedPrice(
        pkg.childPrice ? Number(pkg.childPrice) : Math.round(unitRate * 0.85)
      );
      setChildNoBedPrice(
        pkg.childPrice
          ? Math.round(Number(pkg.childPrice) * 0.75)
          : Math.round(unitRate * 0.65)
      );
      setInfantPrice(pkg.infantPrice ? Number(pkg.infantPrice) : 25000);
      if (pkg.departureDate) setDepartureDate(pkg.departureDate);
      if (pkg.departureCity) setDepartureCity(pkg.departureCity);
    }
  };

  const handleRoomChange = (newRoom: RoomSharingType) => {
    setRoomType(newRoom);
    if (selectedPkg) {
      setAdultUnitPrice(getPackageRoomPrice(selectedPkg, newRoom));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!packageId) {
      setErrorMsg("Please select a Hajj/Umrah package.");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg("Please select a Customer/Lead or enter Pilgrim Name and Phone.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId: customerId || null,
        leadId: leadId || null,
        packageId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerWhatsapp: (customerWhatsapp || customerPhone).trim(),
        customerEmail: customerEmail.trim() || null,
        customerCity: customerCity.trim() || null,
        roomType,
        adultCount,
        adultUnitPrice,
        childWithBedCount,
        childWithBedPrice,
        childNoBedCount,
        childNoBedPrice,
        infantCount,
        infantPrice,
        discountType,
        discountValue,
        discountReason: discountReason.trim() || null,
        taxPercent,
        additionalCharges,
        additionalChargesNote: additionalChargesNote.trim() || null,
        advanceRequired: totals.advanceRequired,
        balanceDueDate: balanceDueDate || null,
        departureDate: departureDate.trim() || null,
        departureCity: departureCity.trim() || null,
        specialNotes: specialNotes.trim() || null,
        terms: terms.trim(),
        validUntil: validUntil || null,
        status,
      };

      const url = isEdit
        ? `/api/admin/quotations/${initialQuotation.id}`
        : "/api/admin/quotations";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save quotation.");
      }

      router.push(`/admin/quotations/${data.quotation.id}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Error saving quotation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/quotations"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEdit
                ? `Edit Quotation ${initialQuotation.quotationNumber}`
                : "Create New Hajj / Umrah Quotation"}
            </h1>
            <p className="text-xs text-slate-500">
              Configure passenger breakdown (Adults, Child w/ Bed, Child No Bed, Infant), discounts, and tour details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs font-semibold rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
          >
            <option value="DRAFT">Status: DRAFT</option>
            <option value="SENT">Status: SENT</option>
            <option value="ACCEPTED">Status: ACCEPTED</option>
            <option value="EXPIRED">Status: EXPIRED</option>
          </select>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold shadow-sm disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{submitting ? "Saving..." : isEdit ? "Update Quotation" : "Save & View Proposal"}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns: Pilgrim, Package, Passenger Pricing & Terms */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Pilgrim / Lead Auto-Fill Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                1. Pilgrim / Lead Details
              </h2>
              <span className="text-[11px] text-slate-500">
                Auto-fill from CRM or enter manually
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Link Existing Customer
                </label>
                <select
                  value={customerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                >
                  <option value="">-- Select Customer (Optional) --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Or Auto-Fill from CRM Lead
                </label>
                <select
                  value={leadId}
                  onChange={(e) => handleSelectLead(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                >
                  <option value="">-- Select CRM Lead (Optional) --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.mobile})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilgrim Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Haji Abdul Rehman"
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98XXXXXXXX"
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  placeholder="Same as phone if blank"
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder="Pune / Mumbai"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Optional"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Tour & Stay Snapshot Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                2. Package & Tour Specifications
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Hajj / Umrah Package *
              </label>
              <select
                value={packageId}
                onChange={(e) => handlePackageChange(e.target.value)}
                required
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 bg-white text-slate-900 font-medium"
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.durationDays} Days &bull; Base ₹{Number(p.basePrice).toLocaleString("en-IN")})
                  </option>
                ))}
              </select>
            </div>

            {selectedPkg && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Makkah ({selectedPkg.makkahNights}N)
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedPkg.makkahHotelName || "Makkah Hotel"}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {selectedPkg.makkahDistance || "Walking Distance"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Madinah ({selectedPkg.madinahNights}N)
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedPkg.madinahHotelName || "Madinah Hotel"}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {selectedPkg.madinahDistance || "Walking Distance"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Flight &amp; Type
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedPkg.airline || "Saudi / Air India"}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {selectedPkg.flightType || "DIRECT"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Meal Plan
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedPkg.makkahMealPlan || "Indian Buffet (3x)"}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {selectedPkg.durationDays} Days Total
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Departure Date / Cycle
                </label>
                <input
                  type="text"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  placeholder="e.g. 15 Dec 2026 / 1st Week"
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Departure City / Airport
                </label>
                <input
                  type="text"
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  placeholder="Mumbai (BOM)"
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quote Valid Until
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 3. Passenger & Room Pricing Breakdown Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                3. Passenger &amp; Occupancy Pricing
              </h2>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                Total Travellers: {totals.travellersCount}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Passenger Category</th>
                    <th className="px-3 py-2.5">Room / Option</th>
                    <th className="px-3 py-2.5 w-24">Count</th>
                    <th className="px-3 py-2.5 w-36">Unit Rate (₹)</th>
                    <th className="px-3 py-2.5 text-right">Row Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Adults Row */}
                  <tr>
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      Adults (12+ yrs)
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={roomType}
                        onChange={(e) => handleRoomChange(e.target.value as RoomSharingType)}
                        className="text-xs rounded-lg border border-slate-300 px-2 py-1.5 bg-white text-slate-900 font-semibold"
                      >
                        <option value="QUAD">QUAD (4 Beds)</option>
                        <option value="TRIPLE">TRIPLE (3 Beds)</option>
                        <option value="DOUBLE">DOUBLE (2 Beds)</option>
                        <option value="SINGLE">SINGLE (1 Bed)</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={adultCount}
                        onChange={(e) => setAdultCount(Math.max(1, Number(e.target.value)))}
                        className="w-20 text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 text-slate-900 font-semibold"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={adultUnitPrice}
                        onChange={(e) => setAdultUnitPrice(Math.max(0, Number(e.target.value)))}
                        className="w-32 text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 text-slate-900 font-semibold"
                      />
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900">
                      ₹{totals.adultTotal.toLocaleString("en-IN")}
                    </td>
                  </tr>

                  {/* Child with Bed Row */}
                  <tr>
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <Baby className="w-3.5 h-3.5 text-amber-600" />
                        Child with Bed (2–11 yrs)
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500">Extra Bed</td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={childWithBedCount}
                        onChange={(e) => setChildWithBedCount(Math.max(0, Number(e.target.value)))}
                        className="w-20 text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 text-slate-900 font-semibold"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={childWithBedPrice}
                        onChange={(e) => setChildWithBedPrice(Math.max(0, Number(e.target.value)))}
                        className="w-32 text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 text-slate-900"
                      />
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900">
                      ₹{totals.childWithBedTotal.toLocaleString("en-IN")}
                    </td>
                  </tr>

                  {/* Child without Bed Row */}
                  <tr>
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <Baby className="w-3.5 h-3.5 text-sky-600" />
                        Child without Bed (2–11 yrs)
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500">No Separate Bed</td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={childNoBedCount}
                        onChange={(e) => setChildNoBedCount(Math.max(0, Number(e.target.value)))}
                        className="w-20 text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 text-slate-900 font-semibold"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={childNoBedPrice}
                        onChange={(e) => setChildNoBedPrice(Math.max(0, Number(e.target.value)))}
                        className="w-32 text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 text-slate-900"
                      />
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900">
                      ₹{totals.childNoBedTotal.toLocaleString("en-IN")}
                    </td>
                  </tr>

                  {/* Infant Row */}
                  <tr>
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <Baby className="w-3.5 h-3.5 text-emerald-600" />
                        Infant (0–2 yrs)
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500">Lap / Visa Only</td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={infantCount}
                        onChange={(e) => setInfantCount(Math.max(0, Number(e.target.value)))}
                        className="w-20 text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 text-slate-900 font-semibold"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={infantPrice}
                        onChange={(e) => setInfantPrice(Math.max(0, Number(e.target.value)))}
                        className="w-32 text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 text-slate-900"
                      />
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900">
                      ₹{totals.infantTotal.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Notes & Terms */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. Special Notes &amp; Validity Terms
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Notes / Custom Requests
                </label>
                <textarea
                  rows={3}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Ground floor rooms requested for elderly parents, wheelchair assistance at Jeddah airport."
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quotation Terms &amp; Conditions
                </label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Discount Engine, Tax, Payment Schedule & Grand Total */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 sticky top-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Discount, Tax &amp; Summary
            </h2>

            {/* Subtotal */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Passenger Subtotal</span>
              <span className="font-bold text-slate-900">
                ₹{totals.subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Discount Control */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Discount Control
                </span>
                <div className="inline-flex rounded-lg border border-emerald-300 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setDiscountType("FLAT")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                      discountType === "FLAT"
                        ? "bg-emerald-800 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <IndianRupee className="w-3 h-3" /> Flat
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("PERCENT")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                      discountType === "PERCENT"
                        ? "bg-emerald-800 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Percent className="w-3 h-3" /> Percent
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {discountType === "PERCENT" ? "Discount (%)" : "Discount (₹)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={discountType === "PERCENT" ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                    className="w-full text-xs rounded-lg border border-emerald-300 px-2.5 py-1.5 bg-white text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Deducted Amount
                  </label>
                  <div className="text-xs font-bold text-emerald-800 bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5">
                    -₹{totals.discountAmount.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Discount Reason / Label
                </label>
                <input
                  type="text"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="e.g. Group Family Discount / Early Bird"
                  className="w-full text-xs rounded-lg border border-emerald-300 px-2.5 py-1.5 bg-white text-slate-900"
                />
              </div>
            </div>

            {/* GST & Add-ons */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  GST / Tax (%)
                </label>
                <div className="flex items-center gap-1.5">
                  {[0, 5].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTaxPercent(pct)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                        taxPercent === pct
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-300"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value)))}
                    className="w-16 text-xs rounded-lg border border-slate-300 px-2 py-1 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Extra Add-on Charges (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={additionalCharges}
                    onChange={(e) => setAdditionalCharges(Math.max(0, Number(e.target.value)))}
                    className="w-28 text-xs rounded-lg border border-slate-300 px-2.5 py-1 text-slate-900 font-semibold text-right"
                  />
                </div>
                <input
                  type="text"
                  value={additionalChargesNote}
                  onChange={(e) => setAdditionalChargesNote(e.target.value)}
                  placeholder="Add-on note (e.g. Private GMC / Wheelchair)"
                  className="w-full text-[11px] rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-700"
                />
              </div>
            </div>

            {/* Grand Total */}
            <div className="p-4 rounded-xl bg-forest-950 text-white space-y-1.5">
              <div className="flex justify-between text-xs text-emerald-200">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal.toLocaleString("en-IN")}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-300 font-semibold">
                  <span>Discount{discountReason ? ` (${discountReason})` : ""}:</span>
                  <span>-₹{totals.discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              {totals.gstAmount > 0 && (
                <div className="flex justify-between text-xs text-slate-300">
                  <span>GST ({taxPercent}%):</span>
                  <span>+₹{totals.gstAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              {totals.additionalCharges > 0 && (
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Add-on Charges:</span>
                  <span>+₹{totals.additionalCharges.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-white/15">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-300">
                  Grand Total
                </span>
                <span className="text-2xl font-serif font-bold text-white">
                  ₹{totals.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Token Advance Required (₹)
                </label>
                <div className="flex gap-1">
                  {[25, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setAdvanceTouched(true);
                        setAdvanceRequired(Math.round((totals.total * pct) / 100));
                      }}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min={0}
                value={totals.advanceRequired}
                onChange={(e) => {
                  setAdvanceTouched(true);
                  setAdvanceRequired(Math.max(0, Number(e.target.value)));
                }}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-bold"
              />
              <div className="flex justify-between text-xs text-slate-600">
                <span>Balance Payable Later:</span>
                <span className="font-bold text-slate-900">
                  ₹{totals.balanceAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Balance Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={balanceDueDate}
                  onChange={(e) => setBalanceDueDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
