"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  Sparkles,
  Calendar,
  Moon,
  Plane,
  ArrowRight,
  MessageCircle,
  Building,
  CheckCircle2,
} from "lucide-react";

interface SpotlightPackageData {
  id?: string;
  name?: string;
  slug?: string;
  departureDate?: string | null;
  returnDate?: string | null;
  durationDays?: number | null;
  makkahNights?: number | null;
  madinahNights?: number | null;
  basePrice?: number | null;
  priceQuad?: number | null;
  airline?: string | null;
  flightType?: string | null;
  departureCity?: string | null;
  featuredImage?: string | null;
  badge?: string | null;
}

interface SpotlightPackagePopupProps {
  packageData?: SpotlightPackageData | null;
  settings?: Record<string, string>;
}

export default function SpotlightPackagePopup({
  packageData,
  settings,
}: SpotlightPackagePopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show if not previously dismissed in this session
    try {
      const dismissed = sessionStorage.getItem("dismissed_spotlight_popup");
      if (!dismissed && packageData) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200); // 1.2s delay
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore storage errors
    }
  }, [packageData]);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem("dismissed_spotlight_popup", "true");
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  if (!isOpen || !packageData) {
    return null;
  }

  const title = packageData.name || "Umrah Platinum Package 2026";
  const slug = packageData.slug || "umrah-platinum-package-20-days";
  const makkahNights = packageData.makkahNights || 12;
  const madinahNights = packageData.madinahNights || 7;
  const totalDays = packageData.durationDays || makkahNights + madinahNights;
  const startingPrice = packageData.basePrice || packageData.priceQuad || 135000;
  const departureDate = packageData.departureDate || "26 Nov 2026";
  const departureCity = packageData.departureCity || "Mumbai";
  const airline = packageData.airline || "Saudi Airlines (SV)";
  const whatsappNumber = settings?.whatsapp_number || "919890708013";

  const whatsappMessage = encodeURIComponent(
    `Assalamualaikum, I am interested in reserving seats for the confirmed upcoming departure: ${title} (${departureDate} from ${departureCity}). Please share full booking details and seat availability.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 bg-forest-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-gold-400/60 overflow-hidden my-auto transform transition-all">
        {/* Top Header Banner with Luxury Gold Theme */}
        <div className="relative bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 px-6 py-5 text-white border-b border-gold-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-gold-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close spotlight modal"
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-gold-300 hover:text-white flex items-center justify-center transition-colors border border-gold-400/30"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 space-y-1 pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-[11px] font-bold border border-gold-500/30">
              <Sparkles className="w-3 h-3 text-gold-400" />
              <span>Next Confirmed Sacred Tour</span>
            </div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-white tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-xs text-emerald-200/90">
              Guaranteed seat allocation • Direct flights from {departureCity}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Key Departure Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-ivory-100 p-3 rounded-2xl border border-neutral-200/80 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gold-600" />
                Departure
              </span>
              <p className="text-xs sm:text-sm font-bold text-forest-950 mt-1">
                {departureDate}
              </p>
            </div>

            <div className="bg-ivory-100 p-3 rounded-2xl border border-neutral-200/80 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                <Moon className="w-3 h-3 text-emerald-600" />
                Stay Split
              </span>
              <p className="text-xs sm:text-sm font-bold text-forest-950 mt-1">
                {makkahNights}N Makkah / {madinahNights}N Madinah
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-ivory-100 p-3 rounded-2xl border border-neutral-200/80 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                <Plane className="w-3 h-3 text-sky-600" />
                Flight
              </span>
              <p className="text-xs sm:text-sm font-bold text-forest-950 mt-1 truncate">
                Direct ({departureCity})
              </p>
            </div>
          </div>

          {/* Pricing Highlight Card */}
          <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 p-4 sm:p-5 rounded-2xl text-white border border-gold-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gold-300 uppercase tracking-wider block">
                All-Inclusive Starting Price
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  ₹{startingPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-emerald-200">/ pilgrim</span>
              </div>
              <p className="text-[10px] text-emerald-300/80 mt-1">
                Includes Visa, Return Flight, 4★ Hotels, Buffet Meals &amp; Ziyarat
              </p>
            </div>

            <div className="text-right hidden sm:block">
              <span className="inline-block px-2.5 py-1 rounded-full bg-gold-400 text-forest-950 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                Fast Filling
              </span>
            </div>
          </div>

          {/* Value Feature Pills */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>3 Times Daily Fresh Indian Buffet</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Complete Guided Historic Ziyarat</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Near Haram Courtyard Hotels</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Scholarly &amp; Medical Guidance</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDismiss}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md transition-all group"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Inquire &amp; Reserve via WhatsApp</span>
            </a>

            <div className="flex items-center gap-3">
              <Link
                href={`/packages/${slug}`}
                onClick={handleDismiss}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-950 hover:bg-forest-900 text-white text-xs font-bold transition-all"
              >
                <span>View Full Itinerary</span>
                <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
              </Link>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-4 py-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
