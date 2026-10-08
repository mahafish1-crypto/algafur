"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  Plane,
  ShieldCheck,
  Utensils,
  Bus,
  CheckCircle2,
  XCircle,
  Users,
  Compass,
  MessageCircle,
  Phone,
  ChevronRight,
  Sparkles,
  Info,
  FileText,
  HelpCircle,
  Share2,
} from "lucide-react";
import LeadEnquiryForm from "@/components/home/LeadEnquiryForm";
import PackageCard, { PackageCardData } from "@/components/packages/PackageCard";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface PackageDetailClientProps {
  pkg: any;
  relatedPackages: any[];
}

export default function PackageDetailClient({ pkg, relatedPackages }: PackageDetailClientProps) {
  const [selectedRoom, setSelectedRoom] = useState<"QUAD" | "TRIPLE" | "DOUBLE">("QUAD");

  const roomPrices = {
    QUAD: pkg.priceQuad || pkg.basePrice,
    TRIPLE: pkg.priceTriple || Math.round(pkg.basePrice * 1.1),
    DOUBLE: pkg.priceDouble || Math.round(pkg.basePrice * 1.25),
  };

  const activePrice = roomPrices[selectedRoom];
  const seatsRemaining = Math.max(0, pkg.totalSeats - pkg.bookedSeats);

  const inclusions = pkg.inclusions.filter((i: any) => i.isIncluded);
  const exclusions = pkg.inclusions.filter((i: any) => !i.isIncluded);

  const whatsappMessage = `Assalamualaikum, I am interested in ${pkg.name} (${pkg.departureDate}) with Al-Gafur Tours. Please share seat booking details for ${selectedRoom} sharing.`;
  const whatsappUrl = buildWhatsAppLink("919890708013", whatsappMessage);

  return (
    <div className="bg-ivory-100/50 min-h-screen pb-24">
      {/* 1. Breadcrumbs */}
      <div className="bg-white border-b border-neutral-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-2 text-xs text-neutral-500">
          <Link href="/" className="hover:text-forest-950">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/packages" className="hover:text-forest-950">Packages</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-forest-950 font-semibold truncate max-w-xs">{pkg.name}</span>
        </div>
      </div>

      {/* 2. Top Header Banner */}
      <div className="bg-forest-950 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 opacity-95" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {pkg.badge && (
              <span className="bg-gold-500 text-forest-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider">
                {pkg.badge}
              </span>
            )}
            <span className="bg-forest-900 border border-gold-500/30 text-gold-300 text-xs font-semibold px-3 py-1 rounded-md">
              {pkg.year}
            </span>
            <span className="bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 text-xs font-medium px-3 py-1 rounded-md">
              {pkg.departureCity || "Mumbai"} Direct Flight
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
            {pkg.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-emerald-100/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-400" />
              <span>Departure: <strong>{pkg.departureDate}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-400" />
              <span>Duration: <strong>{pkg.durationDays} Days ({pkg.makkahNights}N Makkah / {pkg.madinahNights}N Madinah)</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gold-400" />
              <span className="text-amber-300 font-bold">{seatsRemaining} Seats Remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content & Sticky Booking Summary Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Full Package Details (8 Cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Visual Banner */}
            <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-md border border-neutral-200 bg-forest-950">
              <Image
                src={pkg.featuredImage || "/brand/poster.jpg"}
                alt={pkg.name}
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Overview */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
              <h2 className="text-xl font-serif font-bold text-forest-950 flex items-center gap-2">
                <Compass className="w-5 h-5 text-gold-600" />
                Package Overview
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {pkg.overview}
              </p>

              {/* Scholar Leadership Highlight */}
              <div className="bg-ivory-100 p-5 rounded-2xl border border-gold-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-forest-900 text-gold-300 flex items-center justify-center font-bold text-sm">
                    HA
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-forest-950">
                      Guided by Hafiz Asrar Sahab & Hafiz Sameer Madani
                    </h4>
                    <p className="text-[11px] text-neutral-600">
                      Step-by-step guidance for all 5 Umrahs, daily spiritual bayans, and historical explanations at holy sites.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <h2 className="text-xl font-serif font-bold text-forest-950">
                What&apos;s Included &amp; Excluded
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inclusions */}
                <div>
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Included Services
                  </h3>
                  <div className="space-y-2.5">
                    {inclusions.map((inc: any) => (
                      <div key={inc.id} className="flex items-start gap-2 text-xs text-neutral-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-neutral-900">{inc.title}</strong>
                          {inc.description && (
                            <p className="text-[11px] text-neutral-500">{inc.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exclusions */}
                <div>
                  <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Not Included
                  </h3>
                  <div className="space-y-2.5">
                    {exclusions.map((exc: any) => (
                      <div key={exc.id} className="flex items-start gap-2 text-xs text-neutral-700">
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-neutral-900">{exc.title}</strong>
                          {exc.description && (
                            <p className="text-[11px] text-neutral-500">{exc.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Information */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
              <h2 className="text-xl font-serif font-bold text-forest-950 flex items-center gap-2">
                <Plane className="w-5 h-5 text-gold-600" />
                Flight Specifications &amp; Airlines
              </h2>

              <div className="p-5 bg-ivory-50/70 border border-neutral-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Airline &amp; Flight</span>
                  <p className="font-bold text-forest-950 text-sm mt-0.5">
                    {pkg.airline || "Saudi Airlines (SV)"} {pkg.flightNumber && `(${pkg.flightNumber})`}
                  </p>
                  {pkg.pnr && <p className="text-[11px] text-neutral-500 font-mono mt-0.5">PNR: {pkg.pnr}</p>}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Route &amp; Airport</span>
                  <p className="font-semibold text-neutral-800 text-xs mt-0.5">
                    {pkg.departureAirport || "BOM (Mumbai)"} &rarr; {pkg.arrivalAirport || "MED (Madinah)"}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">
                    {pkg.flightType === "CONNECTING" ? "Connecting Flight" : "Direct Flight"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Baggage Allowance</span>
                  <p className="font-semibold text-neutral-800 text-xs mt-0.5">
                    {pkg.baggage || "2x23kg check-in + 7kg cabin"}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Included for each pilgrim</p>
                </div>
              </div>

              {pkg.flightDetails && (
                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  {pkg.flightDetails}
                </p>
              )}
            </div>

            {/* Accommodations Details */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <h2 className="text-xl font-serif font-bold text-forest-950 flex items-center gap-2">
                <Building className="w-5 h-5 text-gold-600" />
                Hotel Accommodations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Makkah Hotel Card */}
                <div className="border border-neutral-200 rounded-2xl p-5 bg-ivory-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Makkah Al-Mukarramah
                    </span>
                    <span className="text-xs font-semibold bg-gold-100 text-gold-800 px-2.5 py-0.5 rounded-full">
                      {pkg.makkahNights} Nights
                    </span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-forest-950">
                    {pkg.makkahHotelName || "Diyafa Jamal or similar"}
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Distance: <strong>{pkg.makkahDistance || "500m"}</strong> walking route to King Abdulaziz Gate.
                  </p>
                  {pkg.makkahMealPlan && (
                    <p className="text-xs text-emerald-800 font-semibold">
                      Meals: {pkg.makkahMealPlan}
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-500">
                    Amenities: {pkg.makkahAmenities || "Elevators, Indian buffet dining hall, air-conditioned rooms, daily housekeeping."}
                  </p>
                </div>

                {/* Madinah Hotel Card */}
                <div className="border border-neutral-200 rounded-2xl p-5 bg-ivory-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Madinah Al-Munawwarah
                    </span>
                    <span className="text-xs font-semibold bg-gold-100 text-gold-800 px-2.5 py-0.5 rounded-full">
                      {pkg.madinahNights} Nights
                    </span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-forest-950">
                    {pkg.madinahHotelName || "Ilaf Kuba or similar"}
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Distance: <strong>{pkg.madinahDistance || "400m"}</strong> walking route to Prophet&apos;s Mosque.
                  </p>
                  {pkg.madinahMealPlan && (
                    <p className="text-xs text-emerald-800 font-semibold">
                      Meals: {pkg.madinahMealPlan}
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-500">
                    Amenities: {pkg.madinahAmenities || "Close to ladies entrance, high speed Wi-Fi, prayer view rooms, 24-hr front desk."}
                  </p>
                </div>
              </div>
            </div>

            {/* Day by Day Detailed Timeline */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold text-forest-950 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold-600" />
                  Complete {pkg.durationDays}-Day Pilgrimage Itinerary
                </h2>
                <span className="text-xs text-neutral-500">
                  {pkg.itineraries.length} Scheduled Stages
                </span>
              </div>

              <div className="space-y-4">
                {pkg.itineraries.map((day: any) => (
                  <div
                    key={day.id}
                    className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/40 hover:bg-white hover:border-gold-500/40 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-gold-700 bg-gold-100 px-2.5 py-0.5 rounded">
                        Day {day.dayNumber}
                      </span>
                      <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {day.location}
                      </span>
                    </div>
                    <h3 className="text-sm font-serif font-bold text-forest-950">
                      {day.title}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {day.activities}
                    </p>
                    {day.meals && (
                      <div className="text-[11px] text-neutral-500 pt-1 flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-emerald-700" />
                        <span>Meals: {day.meals}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Requirements & Terms */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
              <h2 className="text-xl font-serif font-bold text-forest-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold-600" />
                Travel Requirements &amp; Booking Terms
              </h2>
              <div className="text-xs text-neutral-600 space-y-2 leading-relaxed">
                <p>
                  <strong>Documents Required:</strong> {pkg.travelRequirements}
                </p>
                <p>
                  <strong>Terms &amp; Payment Conditions:</strong> {pkg.termsAndConditions}
                </p>
                {pkg.cancellationPolicy && (
                  <p>
                    <strong>Cancellation Policy:</strong> {pkg.cancellationPolicy}
                  </p>
                )}
                {pkg.refundPolicy && (
                  <p>
                    <strong>Refund Policy:</strong> {pkg.refundPolicy}
                  </p>
                )}
                {pkg.importantNotes && (
                  <p className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900 mt-2">
                    <strong>Important Notes:</strong> {pkg.importantNotes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Summary (4 Cols) */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white rounded-3xl border border-gold-500/40 shadow-xl p-6 sm:p-7 space-y-5">
              {/* Top Price */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 block uppercase">
                  Select Room Sharing & Price
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <div className="text-3xl font-serif font-bold text-forest-950">
                    ₹{activePrice.toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-neutral-500"> / pilgrim</span>
                  </div>
                  {pkg.mrpPrice && (
                    <span className="text-xs text-neutral-400 line-through">
                      ₹{pkg.mrpPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              {/* Room Sharing Switcher */}
              <div className="grid grid-cols-3 gap-2">
                {(["QUAD", "TRIPLE", "DOUBLE"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRoom(r)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                      selectedRoom === r
                        ? "bg-forest-900 text-gold-300 border-forest-900 shadow-sm"
                        : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    <div>{r}</div>
                    <div className="text-[10px] font-normal opacity-80">
                      ₹{roomPrices[r] / 1000}k
                    </div>
                  </button>
                ))}
              </div>

              {/* Seat Countdown Bar */}
              <div className="bg-ivory-100 p-3.5 rounded-xl border border-neutral-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Seat Availability:</span>
                  <span className="font-bold text-emerald-800">{seatsRemaining} seats left</span>
                </div>
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (pkg.bookedSeats / pkg.totalSeats) * 100)}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-neutral-500 text-right">
                  {pkg.bookedSeats} booked out of {pkg.totalSeats} capacity
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Link
                  href={`/booking?package=${pkg.slug}&room=${selectedRoom}`}
                  className="w-full block text-center py-3.5 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-forest-950 font-bold rounded-xl text-sm shadow-gold transition-all"
                >
                  Book This Package Now
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Talk on WhatsApp (+91 9890708013)
                </a>

                <a
                  href="tel:+918793939393"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium rounded-xl text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Advisor: +91 8793939393
                </a>
              </div>

              {/* Micro Trust Bullets */}
              <div className="pt-3 border-t border-neutral-100 space-y-2 text-[11px] text-neutral-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>₹25,000 Advance Token Secures Seat</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ministry Endorsed Visa Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Free Cancellation as per Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Related Packages */}
      {relatedPackages.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-16">
          <h2 className="text-2xl font-serif font-bold text-forest-950 mb-6">
            Other Popular Departures
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPackages.map((p) => (
              <PackageCard key={p.id} pkg={p as PackageCardData} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Mobile Sticky Bottom CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-4 py-3 shadow-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase">Starting from</span>
          <span className="text-lg font-bold font-serif text-forest-950">
            ₹{activePrice.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-emerald-600 text-white rounded-xl"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          <Link
            href={`/booking?package=${pkg.slug}&room=${selectedRoom}`}
            className="bg-forest-900 text-gold-300 font-bold px-5 py-2.5 rounded-xl text-xs"
          >
            Book This Package
          </Link>
        </div>
      </div>
    </div>
  );
}

