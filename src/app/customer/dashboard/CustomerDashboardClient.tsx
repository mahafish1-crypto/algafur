"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/brand/BrandLogo";
import {
  User,
  ShieldCheck,
  Plane,
  Building,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  MessageCircle,
  LogOut,
  Calendar,
  Users,
} from "lucide-react";

interface CustomerDashboardClientProps {
  session: any;
  customer: any;
  leads?: any[];
}

export default function CustomerDashboardClient({
  session,
  customer,
  leads = [],
}: CustomerDashboardClientProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("PASSPORT");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const activeBooking = customer?.bookings?.[0];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          bookingId: activeBooking?.id,
          type: docType,
          fileName: `${docType}_uploaded_${Date.now()}.pdf`,
          fileUrl: "/uploads/sample-doc.pdf",
        }),
      });
      if (res.ok) {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);
        router.refresh();
      }
    } finally {
      setUploading(false);
    }
  };

  const journeySteps = [
    { title: "Enquiry", done: true },
    { title: "Booking", done: Boolean(activeBooking) },
    { title: "Payment", done: activeBooking?.paidAmount > 0 },
    { title: "Documents", done: customer?.documents?.some((d: any) => d.status === "VERIFIED") },
    { title: "Visa", done: activeBooking?.visaApplications?.some((v: any) => v.status === "APPROVED") },
    { title: "Flight", done: true },
    { title: "Hotel", done: true },
    { title: "Ready to Travel", done: activeBooking?.paymentStatus === "PAID" },
  ];

  return (
    <div className="bg-ivory-100/50 min-h-screen">
      {/* Top Header */}
      <header className="bg-forest-950 text-white border-b border-gold-500/20 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo variant="light" size="sm" />
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline text-emerald-200">
              Welcome, <strong>{customer?.name || session.name}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-neutral-300 hover:text-white bg-forest-900 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        {/* Welcome Card */}
        <div className="bg-forest-900 text-white rounded-3xl p-6 sm:p-8 border border-gold-500/30 relative overflow-hidden shadow-xl">
          <div className="relative z-10 space-y-2">
            <span className="text-[11px] font-mono text-gold-300 bg-forest-950 px-2.5 py-1 rounded-md border border-gold-500/20">
              Pilgrim Code: {customer?.customerCode || "ALC-2026-0001"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Assalamualaikum, {customer?.name || session.name || "Respected Pilgrim"}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-xl">
              Track your pilgrimage milestones, download payment vouchers, and review your hotel allocations in Makkah &amp; Madinah.
            </p>
          </div>
        </div>

        {/* Visual Progress Stepper (Part 20) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Your Pilgrimage Journey Status:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {journeySteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 ${
                  step.done
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                    : "bg-neutral-50 border-neutral-200 text-neutral-400"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step.done ? "bg-emerald-600 text-white" : "bg-neutral-300 text-neutral-600"
                  }`}
                >
                  {step.done ? "✓" : idx + 1}
                </div>
                <span className="text-[11px] leading-tight">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Booking Summary & Financials */}
        {activeBooking ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking Highlights (2 Cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-100">
                <div>
                  <span className="text-[11px] font-mono font-bold text-emerald-800 block">
                    {activeBooking.bookingNumber}
                  </span>
                  <h2 className="text-xl font-serif font-bold text-forest-950">
                    {activeBooking.package.name}
                  </h2>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                  {activeBooking.bookingStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Departure Date</span>
                  <span className="font-semibold text-neutral-900">{activeBooking.package.departureDate}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Duration</span>
                  <span className="font-semibold text-neutral-900">{activeBooking.package.durationDays} Days</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Room Sharing</span>
                  <span className="font-semibold text-neutral-900">{activeBooking.roomType}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Total Pilgrims</span>
                  <span className="font-semibold text-neutral-900">{activeBooking.adults} Adults, {activeBooking.children} Kids</span>
                </div>
              </div>

              {/* Hotels Allocated */}
              <div className="bg-ivory-100/70 p-5 rounded-2xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[10px] font-bold uppercase">Makkah Hotel</span>
                  <p className="font-serif font-bold text-forest-950 mt-0.5">
                    {activeBooking.package.makkahHotelName || "Diyafa Jamal"}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-medium">500m walking distance to Haram</p>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] font-bold uppercase">Madinah Hotel</span>
                  <p className="font-serif font-bold text-forest-950 mt-0.5">
                    {activeBooking.package.madinahHotelName || "Ilaf Kuba"}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-medium">400m walking distance to Mosque</p>
                </div>
              </div>

              {/* Registered Travellers List */}
              <div>
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                  Registered Family Pilgrims ({activeBooking.travellers.length}):
                </h4>
                <div className="space-y-2">
                  {activeBooking.travellers.map((traveller: any) => (
                    <div
                      key={traveller.id}
                      className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-neutral-400" />
                        <div>
                          <span className="font-semibold text-neutral-900">{traveller.fullName}</span>
                          <span className="text-[10px] text-neutral-500 ml-2">
                            Passport: {traveller.passportNumber || "Pending"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {traveller.visaStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Overview & Receipts (1 Col) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <h3 className="text-base font-serif font-bold text-forest-950">
                Payment &amp; Invoices
              </h3>

              <div className="space-y-3 text-xs bg-ivory-50 p-4 rounded-2xl border border-neutral-200">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Amount:</span>
                  <span className="font-bold text-neutral-900">
                    ₹{activeBooking.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Paid Amount:</span>
                  <span className="font-bold text-emerald-800">
                    ₹{activeBooking.paidAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 font-bold text-forest-950">
                  <span>Balance Due:</span>
                  <span className="text-amber-800">
                    ₹{activeBooking.outstandingAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Payment Receipts List */}
              <div>
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Issued Receipts:
                </h4>
                <div className="space-y-2">
                  {activeBooking.payments.map((p: any) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-emerald-800 block">
                          {p.receiptNumber}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {p.paymentMethod} • ₹{p.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 text-neutral-600 hover:text-forest-950 rounded hover:bg-neutral-200"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Support WhatsApp */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/919890708013?text=Assalamualaikum,%20my%20booking%20reference%20is%20${activeBooking.bookingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat With Travel Desk
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-forest-950">No Active Bookings Found</h3>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              You do not have any active or confirmed pilgrimage bookings under this account yet. Select a package to reserve your place.
            </p>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md mt-2"
            >
              Explore 2026 Umrah &amp; Hajj Packages ↗
            </Link>
          </div>
        )}

        {/* Documents Management Section (Part 23) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-lg font-serif font-bold text-forest-950">
                Pilgrim Documents &amp; Visa Uploads
              </h2>
              <p className="text-xs text-neutral-500">
                Securely upload passport scans, white-background photos, and vaccination certificates.
              </p>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleDocumentUpload} className="bg-ivory-50 p-4 rounded-2xl border border-neutral-200 flex flex-wrap items-center gap-3">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="text-xs p-2.5 rounded-xl border border-neutral-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="PASSPORT">Passport Scan (Front & Back)</option>
              <option value="PASSPORT_PHOTO">White Background Photograph</option>
              <option value="AADHAAR">Aadhaar Card Copy</option>
              <option value="PAN">PAN Card Copy</option>
              <option value="VACCINATION">Vaccination Certificate</option>
            </select>

            <input
              type="file"
              className="text-xs text-neutral-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-forest-900 file:text-gold-300 hover:file:bg-forest-950"
            />

            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-1.5 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold text-xs py-2.5 px-4 rounded-xl ml-auto disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? "Uploading..." : "Upload Document"}</span>
            </button>
          </form>

          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Document uploaded successfully! It is now under review by our visa team.</span>
            </div>
          )}

          {/* Uploaded Documents Table */}
          <div className="space-y-2">
            {customer?.documents?.map((doc: any) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <div>
                    <span className="font-semibold text-neutral-900">{doc.fileName}</span>
                    <span className="text-[10px] text-neutral-400 block uppercase font-bold">{doc.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      doc.status === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800"
                        : doc.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submitted Inquiries & Leads Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-lg font-serif font-bold text-forest-950">
                Submitted Inquiries &amp; Callback Requests ({leads.length})
              </h2>
              <p className="text-xs text-neutral-500">
                View your submitted package inquiries and their advisor follow-up status.
              </p>
            </div>
            <Link
              href="/contact"
              className="text-xs font-bold text-emerald-800 hover:text-forest-950 underline"
            >
              + Submit New Inquiry
            </Link>
          </div>

          {leads.length > 0 ? (
            <div className="space-y-2.5">
              {leads.map((lead: any) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-2xl border border-neutral-200 bg-ivory-50/70 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-forest-950 text-sm">
                        {lead.packageInterest || "General Pilgrimage Inquiry"}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                        {lead.travellers || 1} Pilgrim(s)
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Submitted on{" "}
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      • City: {lead.city || "Pune"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        lead.status === "CONVERTED"
                          ? "bg-emerald-100 text-emerald-800"
                          : lead.status === "FOLLOW_UP"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {lead.status || "NEW"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500">
              No inquiries recorded under your profile yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

