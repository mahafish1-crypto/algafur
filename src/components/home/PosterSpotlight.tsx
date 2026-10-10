"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Sparkles,
  Phone,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { useLanguage } from "@/context/LanguageContext";

interface PosterSpotlightProps {
  packageData?: {
    slug: string;
    name: string;
    year: string;
    durationDays: number;
    basePrice: number;
    departureDate: string;
    returnDate: string;
    makkahHotelName: string | null;
    madinahHotelName: string | null;
    featuredImage?: string | null;
  } | null;
  settings?: Record<string, string>;
}

export default function PosterSpotlight({ packageData, settings = {} }: PosterSpotlightProps) {
  const { formatPrice } = useLanguage();

  const pkg = packageData || {
    slug: "umrah-platinum-package-2026",
    name: "Umrah Platinum Package",
    year: "2026 / 1448 Hijri",
    durationDays: 20,
    basePrice: 120000,
    departureDate: "31 October 2026",
    returnDate: "19 November 2026",
    makkahHotelName: "Diyafa Jamal or similar (500m)",
    madinahHotelName: "Ilaf Kuba or similar (400m)",
    featuredImage: "/brand/poster.jpg",
  };

  const whatsappNum = settings.whatsapp_number || "919890708013";
  const phone1 = settings.company_phone_1 || "+91 8793939393";
  const whatsappHref = buildWhatsAppLink(
    whatsappNum,
    `Assalamualaikum, I am interested in ${pkg.name} (${pkg.departureDate}).`
  );

  return (
    <section className="py-20 bg-forest-950 text-white relative overflow-hidden border-y border-gold-500/20">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-forest-950 to-forest-950 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900 border border-gold-500/30 text-gold-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Featured Signature Tour</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white">
            {pkg.name} ({pkg.year})
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/70 mt-2">
            A comprehensive {pkg.durationDays}-day spiritual transformation under guided scholarship with walking distance stays.
          </p>
        </div>

        {/* Feature Grid: Poster Asset + Structured Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-forest-900/60 rounded-3xl p-6 sm:p-10 border border-gold-500/30 backdrop-blur-md">
          {/* Left Column: Official Poster Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-400/40 group">
              <Image
                src={pkg.featuredImage || "/brand/poster.jpg"}
                alt={`${pkg.name} Official Poster`}
                width={600}
                height={850}
                sizes="(max-width: 768px) 100vw, 400px"
                className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-forest-950/20 group-hover:bg-transparent transition-colors" />
            </div>
          </div>

          {/* Right Column: Breakdown of Services & Scholarly Supervision */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-gold-500 text-forest-950 text-xs font-extrabold px-3 py-1 rounded-md uppercase tracking-wide">
                {pkg.year}
              </span>
              <span className="text-xs text-emerald-200 font-semibold bg-emerald-900/60 border border-emerald-500/30 px-3 py-1 rounded-md">
                {pkg.durationDays} Days Tour
              </span>
              <span className="text-xs text-amber-300 font-semibold bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-md">
                {formatPrice(pkg.basePrice)}/- Only
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {pkg.departureDate}
              {pkg.returnDate && !pkg.departureDate.includes(pkg.returnDate)
                ? ` – ${pkg.returnDate}`
                : ""}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Departing direct from Mumbai with airport bus transfers for pilgrims across Pune, Ahmednagar, and Aurangabad. Guided with continuous bayans and 5 distinct Umrah pilgrimages.
            </p>

            {/* 5 Umrahs Pills */}
            <div>
              <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                5 Blessed Umrah Pilgrimages Included:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {["1. India Arrival", "2. Masjid Jorana", "3. Masjid Ayesha", "4. Sulh Hudaibiya", "5. Taif Meeqat"].map(
                  (u, i) => (
                    <div
                      key={i}
                      className="bg-forest-950/80 border border-gold-500/20 p-2 rounded-lg text-center font-medium text-emerald-100 text-[11px]"
                    >
                      {u}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Two Renowned Scholars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-forest-950/60 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-gold-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  HA
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Hafiz Asrar Sahab</div>
                  <div className="text-[10px] text-emerald-300">International Naat Khwa &amp; Scholar</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-gold-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  HS
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Hafiz Sameer Madani</div>
                  <div className="text-[10px] text-emerald-300">Resident Guide &amp; Madinah Specialist</div>
                </div>
              </div>
            </div>

            {/* Services Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>Makkah Stay ({pkg.makkahHotelName || "Diyafa Jamal"})</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>Madinah Stay ({pkg.madinahHotelName || "Ilaf Kuba"})</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>3 Times Fresh Indian Buffet Meals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>Luggage Kit, Cabin Bag, Tasbeeh &amp; Ihram</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>Full Ziyarat in Makkah, Madinah, Badr &amp; Taif</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>Free 5 Litre Blessed Zamzam Can</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={`/packages/${pkg.slug}`}
                className="inline-flex items-center gap-2 text-xs font-bold bg-gold-400 hover:bg-gold-300 text-forest-950 px-5 py-3 rounded-xl transition-all shadow-gold"
              >
                <span>View Full Itinerary &amp; Book</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire on WhatsApp</span>
              </a>
              <a
                href={`tel:${phone1.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 text-xs text-gold-300 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{phone1}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

