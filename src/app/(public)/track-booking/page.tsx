"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Building,
  Plane,
  FileCheck,
  User,
  ArrowRight,
} from "lucide-react";

export default function TrackBookingPage() {
  const [bookingNumber, setBookingNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/track?bookingNumber=${encodeURIComponent(bookingNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Booking not found with these details.");
      }
      setResult(data.booking);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to locate booking.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { name: "Booking Confirmed", icon: CheckCircle2, done: true },
    {
      name: "Payment Verified",
      icon: ShieldCheck,
      done: result?.paymentStatus === "PAID" || result?.paymentStatus === "PARTIALLY_PAID",
    },
    {
      name: "Documents Verified",
      icon: FileCheck,
      done: result?.documentsVerified,
    },
    {
      name: "Visa Issued",
      icon: ShieldCheck,
      done: result?.visaApproved,
    },
    {
      name: "Ready to Travel",
      icon: Plane,
      done: result?.readyToTravel,
    },
  ];

  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            Real-Time Pilgrim Status
          </span>
          <h1 className="text-3xl font-serif font-bold text-forest-950 mt-3">
            Track Your Pilgrimage Booking
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            Enter your official Al-Gafur Booking Number and registered mobile number.
          </p>
        </div>

        {/* Tracking Search Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-md mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Booking Number *
                </label>
                <input
                  type="text"
                  required
                  value={bookingNumber}
                  onChange={(e) => setBookingNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. ALG-2026-00001"
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Registered Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 8888890830"
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold py-3.5 px-6 rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? "Searching Records..." : "Track Pilgrimage Status"}</span>
            </button>
          </form>
        </div>

        {/* Tracking Result Card */}
        {result && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-gold-500/30 shadow-xl space-y-6 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-100">
              <div>
                <span className="text-[11px] font-mono text-emerald-800 font-bold block">
                  {result.bookingNumber}
                </span>
                <h3 className="text-xl font-serif font-bold text-forest-950">
                  {result.package.name}
                </h3>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                {result.bookingStatus}
              </span>
            </div>

            {/* Visual Progress Stepper */}
            <div className="py-2">
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">
                Pilgrimage Progress Timeline:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                {stages.map((stage, idx) => {
                  const Icon = stage.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 ${
                        stage.done
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                          : "bg-neutral-50 border-neutral-200 text-neutral-400"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${stage.done ? "text-emerald-700" : "text-neutral-400"}`} />
                      <span className="text-[11px] leading-tight">{stage.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Travel Summary Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-ivory-100/70 p-4 rounded-2xl text-xs">
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Departure Date</span>
                <span className="font-semibold text-neutral-900">{result.package.departureDate}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Pilgrim Count</span>
                <span className="font-semibold text-neutral-900">{result.adults} Adults, {result.children} Children</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Payment Status</span>
                <span className="font-semibold text-emerald-800">{result.paymentStatus}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-between items-center gap-3">
              <span className="text-xs text-neutral-500">
                For detailed e-Visa and passport uploads, access the customer portal.
              </span>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-950 bg-gold-400 hover:bg-gold-300 px-4 py-2.5 rounded-xl transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login to Full Portal</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

