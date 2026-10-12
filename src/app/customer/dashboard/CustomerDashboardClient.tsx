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
  const activeBooking = customer?.bookings?.[0];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const journeySteps = [
    { title: "Enquiry", done: true },
    { title: "Advisor Review", done: leads.some((l: any) => l.status !== "NEW") || Boolean(activeBooking) },
    { title: "Booking Confirmed", done: Boolean(activeBooking) },
    { title: "Documents", done: customer?.documents?.some((d: any) => d.status === "VERIFIED") },
    { title: "Visa", done: activeBooking?.visaApplications?.some((v: any) => v.status === "APPROVED") },
    { title: "Flight", done: Boolean(activeBooking) },
    { title: "Hotel", done: Boolean(activeBooking) },
    { title: "Ready to Travel", done: activeBooking?.bookingStatus === "CONFIRMED" },
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

            {/* Booking Coordination & Support (1 Col) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <h3 className="text-base font-serif font-bold text-forest-950">
                Booking Status &amp; Support
              </h3>

              <div className="space-y-3 text-xs bg-ivory-50 p-4 rounded-2xl border border-neutral-200">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Booking Status:</span>
                  <span className="font-bold text-emerald-800">
                    {activeBooking.bookingStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Room Preference:</span>
                  <span className="font-bold text-neutral-900">
                    {activeBooking.roomType}
                  </span>
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
            <h3 className="text-xl font-serif font-bold text-forest-950">No Confirmed Bookings Yet</h3>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              Submit a package enquiry and our travel advisors will contact you directly to confirm availability and finalize your reservation.
            </p>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md mt-2"
            >
              Explore Umrah &amp; Hajj Packages ↗
            </Link>
          </div>
        )}

        {/* Visa & Travel Documentation Advisory */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-bold text-forest-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              Travel Documentation &amp; Visa Assistance
            </h2>
            <p className="text-xs text-neutral-600 max-w-2xl">
              For your security and privacy, travel documents are collected directly by our verified Visa &amp; Operations Desk after your booking enquiry is confirmed by an advisor.
            </p>
          </div>
          <Link
            href="/booking"
            className="shrink-0 bg-gold-400 hover:bg-gold-300 text-forest-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
          >
            Submit Booking Enquiry
          </Link>
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

