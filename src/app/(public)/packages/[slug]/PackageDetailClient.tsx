"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  Plane,
  ShieldCheck,
  Utensils,
  CheckCircle2,
  XCircle,
  Users,
  Compass,
  MessageCircle,
  Phone,
  ChevronRight,
  Sparkles,
  FileText,
  Star,
  ExternalLink,
  Award,
} from "lucide-react";
import LeadEnquiryForm from "@/components/home/LeadEnquiryForm";
import PackageCard, { PackageCardData } from "@/components/packages/PackageCard";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { buildCanonicalUrl } from "@/lib/site-url";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { trackMetaViewContent } from "@/lib/meta-pixel-events";
import { useLanguage } from "@/context/LanguageContext";
import {
  parseHotelImages,
  parseHotelAmenities,
  formatHotelCityLabel,
} from "@/lib/hotel-helpers";
import { parseZiyaratLandmarks } from "@/lib/ziyarat-helpers";
import type { TeamMemberProfile } from "@/lib/team-data";

interface PackageDetailClientProps {
  pkg: any;
  relatedPackages: any[];
  settings?: Record<string, string>;
  spiritualGuides?: TeamMemberProfile[];
}

export default function PackageDetailClient({
  pkg,
  relatedPackages,
  settings = {},
  spiritualGuides = [],
}: PackageDetailClientProps) {
  const { t, language } = useLanguage();
  const [selectedRoom, setSelectedRoom] = useState<"QUAD" | "TRIPLE" | "DOUBLE">("QUAD");
  const [activeMakkahImg, setActiveMakkahImg] = useState<string | null>(null);
  const [activeMadinahImg, setActiveMadinahImg] = useState<string | null>(null);

  useEffect(() => {
    if (pkg?.id) {
      trackAnalyticsEvent({
        eventType: "PACKAGE_VIEW",
        packageId: pkg.id,
        packageSlug: pkg.slug,
        packageTitle: pkg.name,
        sourcePage: `/packages/${pkg.slug}`,
        language,
      });

      trackMetaViewContent({
        id: pkg.id,
        name: pkg.name,
        slug: pkg.slug,
        price: pkg.priceQuad || pkg.basePrice || pkg.startingPrice || 0,
        currency: "INR",
        category: pkg.type || "Umrah",
      });
    }
  }, [pkg?.id, pkg?.slug, pkg?.name, pkg?.priceQuad, pkg?.basePrice, pkg?.startingPrice, pkg?.type, language]);

  const roomPrices = {
    QUAD: pkg.priceQuad || pkg.basePrice,
    TRIPLE: pkg.priceTriple || Math.round(pkg.basePrice * 1.1),
    DOUBLE: pkg.priceDouble || Math.round(pkg.basePrice * 1.25),
  };

  const activePrice = roomPrices[selectedRoom];
  const seatsRemaining = Math.max(0, pkg.totalSeats - pkg.bookedSeats);

  let packageFeatures: string[] = [];
  if (pkg.features) {
    try {
      packageFeatures =
        typeof pkg.features === "string"
          ? JSON.parse(pkg.features)
          : pkg.features;
    } catch {
      packageFeatures =
        typeof pkg.features === "string" ? pkg.features.split(",") : [];
    }
  }

  const ziyaratLandmarks = parseZiyaratLandmarks(pkg.highlights);

  const rawInclusions = (pkg.inclusions || []).filter((i: any) => i.isIncluded);
  const rawExclusions = (pkg.inclusions || []).filter((i: any) => !i.isIncluded);

  const inclusions = rawInclusions.length > 0
    ? rawInclusions
    : (packageFeatures.length > 0
        ? packageFeatures.map((feat: string, idx: number) => ({ id: `feat-${idx}`, title: feat, description: null }))
        : [
            { id: "inc-1", title: "Umrah Visa & Tourist Insurance", description: "Official electronic visa issued with mandatory medical coverage." },
            { id: "inc-2", title: "Hotel Accommodations", description: `${pkg.makkahNights} Nights Makkah and ${pkg.madinahNights} Nights Madinah.` },
            { id: "inc-3", title: "Indian Buffet Meals", description: "Freshly prepared 3-times daily breakfast, lunch, and dinner." },
            { id: "inc-4", title: "Air-Conditioned Bus Transportation", description: "Airport transfers, hotel shuttles, and intercity travel." },
            { id: "inc-5", title: "Holy Ziyarat in Makkah & Madinah", description: "Guided historical site visits under scholar supervision." },
            { id: "inc-6", title: "Complimentary Zamzam (5 Litres)", description: "Sealed authentic 5L Zamzam bottle per pilgrim." },
          ]);

  const exclusions = rawExclusions.length > 0
    ? rawExclusions
    : [
        { id: "exc-1", title: "Room Service & Personal Laundry", description: "Personal laundry expenses unless specified as complimentary in package." },
        { id: "exc-2", title: "Excess Baggage Charges", description: "Any baggage exceeding the standard airline weight allowance." },
        { id: "exc-3", title: "Wheelchair Attendant Charges", description: "Private wheelchair handler fees at Haram." },
      ];

  const phone = settings.company_phone_1 || "+91 8793939393";
  const whatsappNum = settings.whatsapp_number || "919890708013";
  const companyTitle =
    settings.company_short_name || settings.company_name || "AL GAFUR INTERNATIONAL TOURS AND TRAVELS";
  const packageCanonicalUrl = buildCanonicalUrl(`/packages/${pkg.slug}`);

  const formatDepartureSchedule = () => {
    if (pkg.hasSpecificDates) {
      if (pkg.startDate && pkg.endDate) {
        try {
          const start = new Date(pkg.startDate);
          const end = new Date(pkg.endDate);
          const startStr = start.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const endStr = end.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          return `${startStr} – ${endStr}`;
        } catch {
          // fallback
        }
      }
      return pkg.departureDate || "Fixed Group Departure";
    }
    return pkg.departureCycle || "Departures: 1st & 3rd Week of Every Month";
  };

  const departureScheduleText = formatDepartureSchedule();
  const whatsappMessage = `Assalamualaikum, I am interested in ${pkg.name} (${departureScheduleText}) with ${companyTitle}. Package link: ${packageCanonicalUrl}. Please share seat booking details for ${selectedRoom} sharing.`;
  const whatsappUrl = buildWhatsAppLink(whatsappNum, whatsappMessage);

  let galleryImages: string[] = [];
  if (pkg.gallery) {
    try {
      galleryImages =
        typeof pkg.gallery === "string" ? JSON.parse(pkg.gallery) : pkg.gallery;
    } catch {
      galleryImages = [];
    }
  }

  // Resolve Makkah & Madinah Hotel Records + Package Overrides
  const makkahHotel = pkg.makkahHotel || null;
  const madinahHotel = pkg.madinahHotel || null;

  const makkahMedia = parseHotelImages(
    makkahHotel?.images,
    "MAKKAH",
    pkg.makkahImage
  );
  const madinahMedia = parseHotelImages(
    madinahHotel?.images,
    "MADINAH",
    pkg.madinahImage
  );

  const makkahName = pkg.makkahHotelName?.trim() || makkahHotel?.name || "";
  const madinahName = pkg.madinahHotelName?.trim() || madinahHotel?.name || "";

  const makkahDistance =
    pkg.makkahDistance?.trim() ||
    makkahHotel?.distanceFromHaram ||
    makkahHotel?.distanceToHaram ||
    "";
  const madinahDistance =
    pkg.madinahDistance?.trim() ||
    madinahHotel?.distanceFromHaram ||
    madinahHotel?.distanceToHaram ||
    "";

  const makkahWalkingTime = makkahHotel?.walkingTime || "";
  const madinahWalkingTime = madinahHotel?.walkingTime || "";

  const makkahStars =
    typeof pkg.makkahHotelRating === "number" && pkg.makkahHotelRating > 0
      ? Math.min(5, pkg.makkahHotelRating)
      : typeof makkahHotel?.starRating === "number" && makkahHotel.starRating > 0
      ? Math.min(5, makkahHotel.starRating)
      : 4;
  const madinahStars =
    typeof pkg.madinahHotelRating === "number" && pkg.madinahHotelRating > 0
      ? Math.min(5, pkg.madinahHotelRating)
      : typeof madinahHotel?.starRating === "number" && madinahHotel.starRating > 0
      ? Math.min(5, madinahHotel.starRating)
      : 4;

  const makkahDesc = pkg.makkahDescription?.trim() || makkahHotel?.description || "";
  const madinahDesc = pkg.madinahDescription?.trim() || madinahHotel?.description || "";

  const makkahAddress =
    (pkg as any).makkahAddress?.trim() ||
    pkg.makkahDescription?.trim() ||
    makkahHotel?.address?.trim() ||
    "";
  const madinahAddress =
    (pkg as any).madinahAddress?.trim() ||
    pkg.madinahDescription?.trim() ||
    madinahHotel?.address?.trim() ||
    "";

  const makkahAmenities = parseHotelAmenities(
    makkahHotel?.amenities || pkg.makkahAmenities
  );
  const madinahAmenities = parseHotelAmenities(
    madinahHotel?.amenities || pkg.madinahAmenities
  );

  const displayedMakkahImg = activeMakkahImg || makkahMedia.mainImage;
  const displayedMadinahImg = activeMadinahImg || madinahMedia.mainImage;

  return (
    <div className="bg-ivory-100/50 min-h-screen pb-24">
      {/* 1. Breadcrumbs */}
      <div className="bg-white border-b border-neutral-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/" className="hover:text-forest-950 shrink-0">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href="/packages" className="hover:text-forest-950 shrink-0">
              Packages
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-forest-950 font-semibold truncate max-w-xs">
              {pkg.name}
            </span>
          </div>
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 hover:text-forest-950 transition-colors shrink-0 ml-4"
          >
            &larr; {t("btn_back_to_packages", "Back to Packages")}
          </Link>
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
            {pkg.departureCity && (
              <span className="bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 text-xs font-medium px-3 py-1 rounded-md">
                {pkg.departureCity}{" "}
                {pkg.flightType === "CONNECTING" ? "Flight" : "Direct Flight"}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
            {pkg.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-emerald-100/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-400" />
              <span>
                {pkg.hasSpecificDates ? "Departure Dates" : "Departures"}:{" "}
                <strong>{departureScheduleText}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-400" />
              <span>
                Duration:{" "}
                <strong>
                  {pkg.durationDays} Days ({pkg.makkahNights}N Makkah /{" "}
                  {pkg.madinahNights}N Madinah)
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gold-400" />
              <span className="text-amber-300 font-bold">
                {seatsRemaining} Seats Remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content & Sticky Booking Summary Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Full Package Details (8 Cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Main Package Visual Banner & Optional Package Gallery */}
            <div className="space-y-3">
              <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-md border border-neutral-200 bg-forest-950">
                <SafeImage
                  src={pkg.featuredImage || "/brand/poster.jpg"}
                  fallbackSrc="/brand/poster.jpg"
                  alt={pkg.name}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {galleryImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative h-24 sm:h-28 rounded-2xl overflow-hidden border border-neutral-200 shadow-xs group bg-forest-950"
                    >
                      <SafeImage
                        src={imgUrl}
                        fallbackSrc="/brand/poster.jpg"
                        alt={`${pkg.name} Gallery Photo ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PROMINENT HOTEL ACCOMMODATIONS SECTION (Immediately below main package image/gallery) */}
            {(makkahName || madinahName) && (
              <div
                id="package-hotels"
                className="bg-white p-7 sm:p-9 rounded-3xl border-2 border-gold-500/40 shadow-md space-y-6 scroll-mt-28"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-neutral-100 pb-4">
                  <div>
                    <span className="text-xs uppercase text-[#d4af37] font-semibold tracking-wider block">
                      FEATURED SANCTUARY STAYS
                    </span>
                    <h2 className="text-2xl font-serif text-gray-900 mt-1 flex items-center gap-2 font-bold">
                      <Building className="w-5 h-5 text-[#d4af37]" />
                      Hotel Accommodations in Makkah &amp; Madinah
                    </h2>
                  </div>
                  <Link
                    className="text-sm text-[#081d12] hover:text-[#d4af37] font-medium flex items-center gap-1 shrink-0 self-start sm:self-auto"
                    href="/hotels"
                  >
                    Explore All Hotels &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Makkah Hotel Card */}
                  {makkahName && (
                    <div className="border border-neutral-200 rounded-2xl p-5 bg-ivory-50/70 flex flex-col justify-between space-y-4 overflow-hidden shadow-xs">
                      <div className="space-y-3">
                        <div className="relative h-52 w-full rounded-xl overflow-hidden bg-forest-950">
                          <SafeImage
                            src={displayedMakkahImg}
                            fallbackSrc={makkahMedia.mainImage || "/brand/poster.jpg"}
                            alt={makkahName}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover"
                          />
                          {makkahDistance && (
                            <span className="absolute top-3 left-3 bg-forest-950/90 text-gold-300 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-gold-500/30">
                              {makkahDistance} from Haram
                            </span>
                          )}
                          <span className="absolute top-3 right-3 text-[11px] font-bold bg-gold-400 text-forest-950 px-2.5 py-1 rounded-lg shadow-xs">
                            {pkg.makkahNights} Nights
                          </span>
                        </div>

                        {makkahMedia.allImages.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {makkahMedia.allImages.slice(0, 5).map((imgUrl, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveMakkahImg(imgUrl)}
                                className={`relative w-14 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                                  displayedMakkahImg === imgUrl
                                    ? "border-gold-500 scale-105"
                                    : "border-transparent opacity-75 hover:opacity-100"
                                }`}
                              >
                                <SafeImage
                                  src={imgUrl}
                                  fallbackSrc="/brand/poster.jpg"
                                  alt={`${makkahName} view ${idx + 1}`}
                                  fill
                                  sizes="60px"
                                  className="object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
                            {formatHotelCityLabel(makkahHotel?.city || "MAKKAH")}
                          </span>
                          {makkahStars > 0 && (
                            <div className="flex items-center gap-0.5 text-gold-500">
                              {[...Array(makkahStars)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3.5 h-3.5 fill-gold-500"
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <h3 className="text-lg font-serif font-bold text-forest-950">
                          {makkahName}
                        </h3>

                        {makkahDesc && (
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {makkahDesc}
                          </p>
                        )}

                        <div className="space-y-1.5 text-xs text-neutral-700 pt-1">
                          {makkahDistance && (
                            <p className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                              <span>
                                Distance to Haram:{" "}
                                <strong>{makkahDistance}</strong>
                                {makkahWalkingTime
                                  ? ` (${makkahWalkingTime} walk)`
                                  : ""}
                              </span>
                            </p>
                          )}
                          {makkahAddress && (
                            <p className="text-[11px] text-neutral-500 pl-5">
                              {makkahAddress}
                            </p>
                          )}
                          {makkahHotel?.mapLocation && (
                            <a
                              href={makkahHotel.mapLocation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline pl-5"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Hotel on Map
                            </a>
                          )}
                          {pkg.makkahMealPlan && (
                            <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5 pt-1">
                              <Utensils className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Meals: {pkg.makkahMealPlan}</span>
                            </p>
                          )}
                        </div>

                        {makkahAmenities.length > 0 && (
                          <div className="pt-2 border-t border-neutral-200/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                              Verified Hotel Amenities
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {makkahAmenities.map((am, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 text-[11px] bg-white text-forest-950 px-2.5 py-1 rounded-lg border border-neutral-200 font-medium"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  {am}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Madinah Hotel Card */}
                  {madinahName && (
                    <div className="border border-neutral-200 rounded-2xl p-5 bg-ivory-50/70 flex flex-col justify-between space-y-4 overflow-hidden shadow-xs">
                      <div className="space-y-3">
                        <div className="relative h-52 w-full rounded-xl overflow-hidden bg-forest-950">
                          <SafeImage
                            src={displayedMadinahImg}
                            fallbackSrc={madinahMedia.mainImage || "/brand/poster.jpg"}
                            alt={madinahName}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover"
                          />
                          {madinahDistance && (
                            <span className="absolute top-3 left-3 bg-forest-950/90 text-gold-300 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-gold-500/30">
                              {madinahDistance} from Haram
                            </span>
                          )}
                          <span className="absolute top-3 right-3 text-[11px] font-bold bg-gold-400 text-forest-950 px-2.5 py-1 rounded-lg shadow-xs">
                            {pkg.madinahNights} Nights
                          </span>
                        </div>

                        {madinahMedia.allImages.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {madinahMedia.allImages.slice(0, 5).map((imgUrl, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveMadinahImg(imgUrl)}
                                className={`relative w-14 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                                  displayedMadinahImg === imgUrl
                                    ? "border-gold-500 scale-105"
                                    : "border-transparent opacity-75 hover:opacity-100"
                                }`}
                              >
                                <SafeImage
                                  src={imgUrl}
                                  fallbackSrc="/brand/poster.jpg"
                                  alt={`${madinahName} view ${idx + 1}`}
                                  fill
                                  sizes="60px"
                                  className="object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
                            {formatHotelCityLabel(madinahHotel?.city || "MADINAH")}
                          </span>
                          {madinahStars > 0 && (
                            <div className="flex items-center gap-0.5 text-gold-500">
                              {[...Array(madinahStars)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3.5 h-3.5 fill-gold-500"
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <h3 className="text-lg font-serif font-bold text-forest-950">
                          {madinahName}
                        </h3>

                        {madinahDesc && (
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {madinahDesc}
                          </p>
                        )}

                        <div className="space-y-1.5 text-xs text-neutral-700 pt-1">
                          {madinahDistance && (
                            <p className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                              <span>
                                Distance to Masjid An-Nabawi:{" "}
                                <strong>{madinahDistance}</strong>
                                {madinahWalkingTime
                                  ? ` (${madinahWalkingTime} walk)`
                                  : ""}
                              </span>
                            </p>
                          )}
                          {madinahAddress && (
                            <p className="text-[11px] text-neutral-500 pl-5">
                              {madinahAddress}
                            </p>
                          )}
                          {madinahHotel?.mapLocation && (
                            <a
                              href={madinahHotel.mapLocation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline pl-5"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Hotel on Map
                            </a>
                          )}
                          {pkg.madinahMealPlan && (
                            <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5 pt-1">
                              <Utensils className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Meals: {pkg.madinahMealPlan}</span>
                            </p>
                          )}
                        </div>

                        {madinahAmenities.length > 0 && (
                          <div className="pt-2 border-t border-neutral-200/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                              Verified Hotel Amenities
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {madinahAmenities.map((am, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 text-[11px] bg-white text-forest-950 px-2.5 py-1 rounded-lg border border-neutral-200 font-medium"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  {am}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Overview & Spiritual Guides */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <div className="space-y-3">
                <h2 className="text-xl font-serif font-bold text-forest-950 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-gold-600" />
                  Package Overview
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                  {pkg.overview ||
                    pkg.description ||
                    "Experience a blessed pilgrimage with AL GAFUR INTERNATIONAL TOURS AND TRAVELS."}
                </p>
              </div>

              {/* Linked Spiritual Guides from Database */}
              {spiritualGuides.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-serif font-bold text-forest-950 flex items-center gap-2">
                      <Award className="w-4 h-4 text-gold-600" />
                      Spiritual Guides &amp; Group Leadership
                    </h3>
                    <Link
                      href="/about#spiritual-guides"
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      Meet Our Team &rarr;
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {spiritualGuides.map((guide) => {
                      const initials = guide.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                      return (
                        <div
                          key={guide.id}
                          className="bg-ivory-100/80 p-4 rounded-2xl border border-gold-500/30 flex items-start gap-3.5"
                        >
                          {guide.photo ? (
                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gold-500/40 shrink-0 bg-forest-900">
                              <SafeImage
                                src={guide.photo}
                                fallbackSrc="/brand/poster.jpg"
                                alt={guide.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-forest-900 text-gold-300 flex items-center justify-center font-bold text-sm shrink-0 border border-gold-500/30">
                              {initials}
                            </div>
                          )}
                          <div className="space-y-1 min-w-0">
                            <h4 className="text-sm font-bold text-forest-950">
                              {guide.name}
                            </h4>
                            <p className="text-[11px] font-semibold text-gold-700">
                              {guide.designation}
                            </p>
                            {guide.bio && (
                              <p className="text-[11px] text-neutral-600 leading-relaxed">
                                {guide.bio}
                              </p>
                            )}
                            {guide.languages && (
                              <p className="text-[10px] text-neutral-500">
                                <strong>Languages:</strong> {guide.languages}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
                      <div
                        key={inc.id}
                        className="flex items-start gap-2 text-xs text-neutral-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-neutral-900">
                            {inc.title}
                          </strong>
                          {inc.description && (
                            <p className="text-[11px] text-neutral-500">
                              {inc.description}
                            </p>
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
                      <div
                        key={exc.id}
                        className="flex items-start gap-2 text-xs text-neutral-700"
                      >
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-neutral-900">
                            {exc.title}
                          </strong>
                          {exc.description && (
                            <p className="text-[11px] text-neutral-500">
                              {exc.description}
                            </p>
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
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">
                    Airline &amp; Flight
                  </span>
                  <p className="font-bold text-forest-950 text-sm mt-0.5">
                    {pkg.airline
                      ? `${pkg.airline} ${pkg.flightNumber ? `(${pkg.flightNumber})` : ""}`
                      : pkg.flightDetails
                      ? "Direct Group Airline"
                      : "Group Airline Allocated on Confirmation"}
                  </p>
                  {pkg.pnr && (
                    <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                      PNR: {pkg.pnr}
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">
                    Route &amp; Airport
                  </span>
                  <p className="font-semibold text-neutral-800 text-xs mt-0.5">
                    {pkg.departureAirport || pkg.departureCity || "Mumbai"} &rarr;{" "}
                    {pkg.arrivalAirport || "Jeddah / Madinah"}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">
                    {pkg.flightType === "CONNECTING"
                      ? "Connecting Flight"
                      : pkg.airline || pkg.flightDetails
                      ? "Direct Flight"
                      : "Flight Assistance Available"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">
                    Baggage Allowance
                  </span>
                  <p className="font-semibold text-neutral-800 text-xs mt-0.5">
                    {pkg.baggage || "Standard Airline Allowance + 5L Zamzam"}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Included for each pilgrim
                  </p>
                </div>
              </div>

              {pkg.flightDetails && (
                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  {pkg.flightDetails}
                </p>
              )}
            </div>

            {/* City Stay Split & Pilgrimage Schedule */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-1.5">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    Pilgrimage Stay Schedule
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest-950">
                    City Stay Split &amp; Duration Breakdown
                  </h2>
                </div>
                <div className="text-xs text-neutral-600 font-medium bg-ivory-50 px-3.5 py-1.5 rounded-xl border border-neutral-200 self-start sm:self-auto">
                  Total Duration: <strong className="text-forest-950 font-bold">{pkg.durationDays} Days</strong> ({pkg.durationDays > 1 ? `${pkg.durationDays - 1} Nights` : "Same Day"})
                </div>
              </div>

              {/* Visual Proportion Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-neutral-700">
                  <span className="flex items-center gap-1.5 text-forest-950">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    Makkah Al-Mukarramah ({pkg.makkahNights} Nights)
                  </span>
                  <span className="flex items-center gap-1.5 text-forest-950">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold-500" />
                    Madinah Al-Munawwarah ({pkg.madinahNights} Nights)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden bg-neutral-200 flex">
                  <div
                    className="bg-emerald-700 h-full transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        (pkg.makkahNights / Math.max(1, pkg.durationDays - 1 || 1)) * 100
                      )}%`,
                    }}
                    title={`Makkah: ${pkg.makkahNights} Nights`}
                  />
                  <div
                    className="bg-gold-500 h-full transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        (pkg.madinahNights / Math.max(1, pkg.durationDays - 1 || 1)) * 100
                      )}%`,
                    }}
                    title={`Madinah: ${pkg.madinahNights} Nights`}
                  />
                </div>
              </div>

              {/* City Stay Split Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Makkah Stay */}
                <div className="p-5 rounded-2xl border border-neutral-200 bg-ivory-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                      Makkah Al-Mukarramah
                    </span>
                    <span className="text-xs font-bold text-forest-950">
                      {pkg.makkahNights} Nights Stay
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-forest-950">
                      {makkahName || "Sanctuary Hotel Accommodation"}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {makkahDistance ? `${makkahDistance} from Haram` : "Convenient walking distance to Haram"}
                    </p>
                  </div>
                  <ul className="text-xs text-neutral-600 space-y-1.5 pt-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Guided Umrah rituals with scholarly Muallim supervision</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Historical Holy Ziyarat tour across sacred Makkah landmarks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Daily congregational prayers &amp; Tawaf at Masjid Al-Haram</span>
                    </li>
                  </ul>
                </div>

                {/* Madinah Stay */}
                <div className="p-5 rounded-2xl border border-neutral-200 bg-ivory-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-gold-800 bg-gold-100/80 px-2.5 py-0.5 rounded-md">
                      Madinah Al-Munawwarah
                    </span>
                    <span className="text-xs font-bold text-forest-950">
                      {pkg.madinahNights} Nights Stay
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-forest-950">
                      {madinahName || "Sanctuary Hotel Accommodation"}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {madinahDistance ? `${madinahDistance} from Masjid An-Nabawi` : "Convenient walking distance to Masjid Nabawi"}
                    </p>
                  </div>
                  <ul className="text-xs text-neutral-600 space-y-1.5 pt-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Salam at Rawdah Mubarak &amp; Riyazul Jannah assistance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Historical Ziyarat to Masjid Quba, Mount Uhud &amp; Saba Masajid</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Spiritual contemplation &amp; daily prayers at Masjid An-Nabawi</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Departure Schedule Cycle Callout */}
              <div className="p-4 rounded-2xl bg-forest-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gold-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-900 border border-gold-500/40 text-gold-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400 block">
                      {pkg.hasSpecificDates ? "Confirmed Travel Window" : "Recurring Departure Cycle"}
                    </span>
                    <p className="text-sm font-bold text-white">
                      {departureScheduleText}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-emerald-200/80 sm:text-right">
                  {pkg.hasSpecificDates
                    ? "Fixed calendar departures reserved for this special season."
                    : "Regular group departures operate bi-weekly throughout the year."}
                </div>
              </div>
            </div>

            {/* HOLY ZIYARAT LANDMARKS COVERED SECTION */}
            {(ziyaratLandmarks.makkah.length > 0 || ziyaratLandmarks.madinah.length > 0) && (
              <div
                id="ziyarat-landmarks"
                className="bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-gold-700 bg-gold-50 px-2.5 py-1 rounded-full border border-gold-200 mb-1.5">
                      <Compass className="w-3 h-3 text-gold-600" />
                      Guided Sacred Heritage
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest-950 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-700" />
                      Holy Ziyarat Landmarks Covered
                    </h2>
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">
                    Total: {ziyaratLandmarks.makkah.length + ziyaratLandmarks.madinah.length} Sacred Sites
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Makkah Ziyarat Landmarks */}
                  {ziyaratLandmarks.makkah.length > 0 && (
                    <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                          Makkah Mukarrama Landmarks
                        </span>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {ziyaratLandmarks.makkah.length} Sites
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {ziyaratLandmarks.makkah.map((landmark, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 text-xs bg-white text-forest-950 px-3 py-1.5 rounded-xl border border-emerald-200/80 font-medium shadow-2xs"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                            {landmark}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Madinah Ziyarat Landmarks */}
                  {ziyaratLandmarks.madinah.length > 0 && (
                    <div className="p-5 rounded-2xl border border-gold-200/80 bg-gold-50/40 space-y-3">
                      <div className="flex items-center justify-between border-b border-gold-200/60 pb-2.5">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gold-600" />
                          Madinah Munawwara Landmarks
                        </span>
                        <span className="text-[11px] font-bold text-amber-800 bg-gold-100 px-2 py-0.5 rounded-full">
                          {ziyaratLandmarks.madinah.length} Sites
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {ziyaratLandmarks.madinah.map((landmark, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 text-xs bg-white text-forest-950 px-3 py-1.5 rounded-xl border border-gold-200 font-medium shadow-2xs"
                          >
                            <span className="w-2 h-2 rounded-full bg-gold-500 shrink-0" />
                            {landmark}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Collapsible for archived Day-by-Day Stages (Zero data loss) */}
                {(pkg.itineraries || []).length > 0 && (
                  <details className="group border border-neutral-200 rounded-2xl p-4 bg-neutral-50/50">
                    <summary className="cursor-pointer text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center justify-between">
                      <span>View Day-by-Day Stage Archive ({pkg.itineraries.length} Stages)</span>
                      <span className="text-[10px] text-neutral-400 group-open:rotate-90 transition-transform">▸</span>
                    </summary>
                    <div className="mt-3 space-y-3 pt-3 border-t border-neutral-200/70">
                      {pkg.itineraries.map((day: any) => (
                        <div key={day.id} className="p-3 bg-white rounded-xl border border-neutral-200 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-forest-950">
                            <span>Day {day.dayNumber}: {day.title}</span>
                            <span className="text-neutral-500 font-normal">{day.location}</span>
                          </div>
                          <p className="text-neutral-600 text-[11px] leading-relaxed">{day.activities}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* Travel Requirements & Terms */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
              <h2 className="text-xl font-serif font-bold text-forest-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold-600" />
                Travel Requirements &amp; Booking Terms
              </h2>
              <div className="text-xs text-neutral-600 space-y-2 leading-relaxed">
                {pkg.travelRequirements && (
                  <p>
                    <strong>Documents Required (upon confirmation):</strong>{" "}
                    {pkg.travelRequirements}
                  </p>
                )}
                {pkg.termsAndConditions && (
                  <p>
                    <strong>Terms &amp; Conditions:</strong>{" "}
                    {pkg.termsAndConditions}
                  </p>
                )}
                {pkg.cancellationPolicy && (
                  <p>
                    <strong>Cancellation Policy:</strong>{" "}
                    {pkg.cancellationPolicy}
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

          {/* Right Column: Sticky Booking Enquiry Summary (4 Cols) */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white rounded-3xl border border-gold-500/40 shadow-xl p-6 sm:p-7 space-y-5">
              {/* Top Price */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 block uppercase">
                  Select Room Sharing &amp; Package Rate
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <div className="text-3xl font-serif font-bold text-forest-950">
                    ₹{activePrice.toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-neutral-500">
                      {" "}
                      / pilgrim
                    </span>
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
                    type="button"
                    onClick={() => setSelectedRoom(r)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                      selectedRoom === r
                        ? "bg-forest-900 text-gold-300 border-forest-900 shadow-sm"
                        : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    <div>{r}</div>
                    <div className="text-[10px] font-normal opacity-80">
                      ₹{Math.round(roomPrices[r] / 1000)}k
                    </div>
                  </button>
                ))}
              </div>

              {/* Departure Schedule / Dates in Sidebar */}
              <div className="bg-ivory-50 p-3.5 rounded-xl border border-neutral-200 text-xs space-y-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                    {pkg.hasSpecificDates ? "Departure Dates" : "Departure Cycle"}
                  </span>
                  <span className="font-bold text-forest-950 text-xs whitespace-normal break-words">
                    {departureScheduleText}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-600 pt-1.5 border-t border-neutral-200/60 text-[11px] whitespace-normal gap-2">
                  <span className="shrink-0 font-medium">Stay Breakdown:</span>
                  <span className="font-semibold text-emerald-800 text-right whitespace-normal">
                    {pkg.durationDays} Days ({pkg.makkahNights}N / {pkg.madinahNights}N)
                  </span>
                </div>
              </div>

              {/* Quick Hotel Summary in Sticky Sidebar */}
              {(makkahName || madinahName) && (
                <div className="bg-ivory-50 p-3.5 rounded-xl border border-neutral-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                      Included Hotels
                    </span>
                    <a
                      href="#package-hotels"
                      className="text-[10px] font-bold text-emerald-700 hover:underline"
                    >
                      View Photos
                    </a>
                  </div>
                  {makkahName && (
                    <div className="flex items-start justify-between gap-2 text-[11px]">
                      <span className="text-neutral-500 shrink-0">Makkah:</span>
                      <span className="font-bold text-forest-950 text-right whitespace-normal break-words">
                        {makkahName}
                      </span>
                    </div>
                  )}
                  {madinahName && (
                    <div className="flex items-start justify-between gap-2 text-[11px]">
                      <span className="text-neutral-500 shrink-0">Madinah:</span>
                      <span className="font-bold text-forest-950 text-right whitespace-normal break-words">
                        {madinahName}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Seat Countdown Bar */}
              <div className="bg-ivory-100 p-3.5 rounded-xl border border-neutral-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Seat Availability:</span>
                  <span className="font-bold text-emerald-800">
                    {seatsRemaining} seats left
                  </span>
                </div>
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (pkg.bookedSeats / Math.max(1, pkg.totalSeats)) * 100
                      )}%`,
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
                  {t("btn_book_now", "Book Now")}
                </Link>

                <a
                  href="#lead-form"
                  className="w-full block text-center py-2.5 bg-forest-950 hover:bg-forest-900 text-gold-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  {t("btn_enquire_now", "Enquire Now")}
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t("btn_whatsapp_enquiry", "WhatsApp Enquiry")}
                </a>

                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium rounded-xl text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Advisor: {phone}
                </a>
              </div>

              {/* Micro Trust Bullets (No public payment / advance token claims) */}
              <div className="pt-3 border-t border-neutral-100 space-y-2 text-[11px] text-neutral-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>
                    No Online Payment Required — Submit Enquiry &amp; Our Team Confirms Your Booking
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Dedicated Spiritual &amp; Operations Guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Transparent Documentation &amp; Visa Assistance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Direct Package Inquiry Form */}
      <LeadEnquiryForm
        defaultPackage={pkg.name}
        defaultPackageId={pkg.id}
        packages={[pkg, ...relatedPackages].map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          type: p.type,
        }))}
        settings={settings}
        sourcePage={`/packages/${pkg.slug}`}
      />

      {/* 5. Related Packages */}
      {relatedPackages.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-16">
          <h2 className="text-2xl font-serif font-bold text-forest-950 mb-6">
            {t("detail_related")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPackages.map((p) => (
              <PackageCard key={p.id} pkg={p as PackageCardData} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Mobile Sticky Bottom CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-4 py-3 shadow-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase">
            Starting from
          </span>
          <span className="text-lg font-bold font-serif text-forest-950">
            ₹{activePrice.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-xs"
            aria-label="WhatsApp Enquiry"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
          <Link
            href={`/booking?package=${pkg.slug}&room=${selectedRoom}`}
            className="bg-forest-900 text-gold-300 font-bold px-5 py-2.5 rounded-xl text-xs"
          >
            {t("btn_book_now", "Book Now")}
          </Link>
        </div>
      </div>
    </div>
  );
}
