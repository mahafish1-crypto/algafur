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
  CreditCard,
  AlertTriangle,
  CalendarDays,
  Bus,
  Layers,
  List,
} from "lucide-react";
import { getStandardUmrahItinerary } from "@/lib/constants/default-itineraries";
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
import { parseAssignedGuides, ScholarPreset, DEFAULT_SCHOLARS } from "@/lib/constants/scholars";
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
  const [activeItineraryDayIdx, setActiveItineraryDayIdx] = useState(0);
  const [itineraryViewMode, setItineraryViewMode] = useState<"interactive" | "timeline">("interactive");

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

  const assignedScholars: ScholarPreset[] = (() => {
    if (pkg.assignedGuides) {
      const parsed = parseAssignedGuides(pkg.assignedGuides);
      if (parsed.length > 0) return parsed;
    }
    if (spiritualGuides && spiritualGuides.length > 0) {
      return spiritualGuides.map((g) => ({
        id: g.id,
        name: g.name,
        role: g.designation || "Spiritual Guide & Scholar",
        bio: g.bio || "",
        languages: Array.isArray(g.languages) ? g.languages.join(", ") : (g.languages || ""),
        avatarUrl: g.photo || "",
      }));
    }
    return DEFAULT_SCHOLARS;
  })();

  const packageItineraries =
    pkg.itineraries && Array.isArray(pkg.itineraries) && pkg.itineraries.length > 0
      ? pkg.itineraries
      : getStandardUmrahItinerary(pkg.durationDays || 15);

  const rawInclusions = (pkg.inclusions || []).filter((i: any) => i.isIncluded);
  const rawExclusions = (pkg.inclusions || []).filter((i: any) => !i.isIncluded);
  const hasRelationData = (pkg.inclusions || []).length > 0;

  const inclusions = hasRelationData
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

  const exclusions = hasRelationData
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

  const defaultTravelReqs = `- Valid Original Passport: Minimum 6 months validity from departure date with at least 2 blank pages.
- Passport Photos: 2 recent passport-size color photographs with white background (4cm x 6cm).
- Mandatory Vaccination: Meningitis (ACWY) vaccination certificate and approved COVID-19 vaccination certificates as mandated by the Ministry of Hajj & Umrah.
- Identity Proof: Clear copies of PAN Card and Aadhaar Card for Indian regulatory and KYC compliance.
- Mahram Relationship: Women below 45 years traveling without Mahram are subject to current Saudi regulatory guidelines.`;

  const defaultBookingTerms = `- Booking Token Advance: A token booking deposit of ₹25,000 per pilgrim is required to secure seat allotment.
- Payment Schedule: 50% of the package cost must be deposited upon visa processing initiation; the remaining balance must be cleared at least 20 days prior to departure.
- Airlines & Schedules: Flight schedules, group departure timings, and airline allocations are subject to regulatory clearance and operational approvals.
- Hotel Stays: Hotel rooms are allocated according to sharing preferences (Quad, Triple, Double). Standard check-in/check-out policies of Saudi hospitality apply.
- Currency & Taxation: All prices are stated in Indian Rupees (INR). Any sudden revision in foreign exchange or Saudi VAT is subject to applicable regulatory notification.`;

  const defaultCancellationPolicy = `- Notice Period: All cancellation requests must be officially submitted in writing via registered email or WhatsApp.
- 30+ Days Prior to Departure: Full refund after deducting ₹10,000 per pilgrim towards administrative and slot reservation expenses.
- 15 to 30 Days Prior to Departure: 50% of total package cost will be retained towards confirmed ticket and hotel blocking penalties.
- Less than 15 Days / No-Show: 100% cancellation charges apply as group airline tickets and hotel reservations in the Haramain are non-refundable.
- Visa & Insurance Fees: Saudi visa issuance fees and mandatory medical tourist insurance premiums are non-refundable once approved by the Ministry.`;

  const resolvedTravelReqs = settings?.global_travel_requirements?.trim() || pkg.travelRequirements || defaultTravelReqs;
  const resolvedBookingTerms = settings?.global_booking_terms?.trim() || pkg.termsAndConditions || defaultBookingTerms;
  const resolvedCancellationPolicy = settings?.global_cancellation_policy?.trim() || pkg.cancellationPolicy || defaultCancellationPolicy;

  const displayedMakkahImg = activeMakkahImg || pkg.makkahImage || makkahMedia.mainImage;
  const displayedMadinahImg = activeMadinahImg || pkg.madinahImage || madinahMedia.mainImage;

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
              </div>
            )}

            {/* SPIRITUAL GUIDES & GROUP LEADERSHIP SECTION */}
            {assignedScholars.length > 0 && (
              <div
                id="spiritual-guides"
                className="bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-1.5">
                      <Award className="w-3 h-3 text-gold-600" />
                      Scholarly Mentorship &amp; Care
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest-950 flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-700" />
                      Spiritual Guides &amp; Group Leadership
                    </h2>
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">
                    {assignedScholars.length} Designated {assignedScholars.length === 1 ? "Guide" : "Guides"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {assignedScholars.map((guide, idx) => {
                    const initials =
                      guide.name
                        .replace(/[^a-zA-Z\s]/g, "")
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0].toUpperCase())
                        .join("") || "IS";

                    return (
                      <div
                        key={guide.id || idx}
                        className="p-5 rounded-2xl border border-neutral-200 bg-ivory-50/70 space-y-3 hover:border-gold-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          {guide.avatarUrl ? (
                            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-gold-500/30 shrink-0">
                              <SafeImage
                                src={guide.avatarUrl}
                                alt={guide.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-forest-950 border border-gold-500/40 text-gold-400 font-serif font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                              {initials}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-serif font-bold text-forest-950 truncate">
                              {guide.name}
                            </h3>
                            <span className="inline-block text-[11px] font-semibold text-gold-700 bg-gold-50 px-2 py-0.5 rounded-md border border-gold-200 mt-0.5">
                              {guide.role}
                            </span>
                          </div>
                        </div>

                        {guide.bio && (
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {guide.bio}
                          </p>
                        )}

                        {guide.languages && (
                          <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 pt-1 border-t border-neutral-200/60">
                            <span className="font-semibold text-neutral-700">Languages:</span>
                            <span>{guide.languages}</span>
                          </div>
                        )}

                        <ul className="text-[11px] text-neutral-600 space-y-1 pt-1 border-t border-neutral-200/60">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Step-by-step guidance through Ihram, Tawaf, Sa&apos;i &amp; Tahallul</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Daily lectures on pilgrimage virtues &amp; historical explanations at Ziyarat</span>
                          </li>
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Day-by-Day Pilgrimage Itinerary */}
            {packageItineraries.length > 0 && (
              <div className="bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest-950 flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-gold-600" />
                      Day-by-Day Pilgrimage Itinerary
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      Comprehensive daily schedule with holy ziyarats, hotel check-ins, prayer milestones, and guided group movements.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      {packageItineraries.length} Days Schedule
                    </span>
                    <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setItineraryViewMode("interactive")}
                        className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                          itineraryViewMode === "interactive"
                            ? "bg-white text-forest-950 shadow-2xs font-bold"
                            : "text-neutral-500 hover:text-neutral-900"
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 text-gold-600" />
                        <span>Day Viewer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setItineraryViewMode("timeline")}
                        className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                          itineraryViewMode === "timeline"
                            ? "bg-white text-forest-950 shadow-2xs font-bold"
                            : "text-neutral-500 hover:text-neutral-900"
                        }`}
                      >
                        <List className="w-3.5 h-3.5 text-gold-600" />
                        <span>All Days</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* VIEW MODE 1: Interactive Day-by-Day Stepper */}
                {itineraryViewMode === "interactive" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Days Stepper List */}
                    <div className="lg:col-span-4 space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                      {packageItineraries.map((it: any, idx: number) => {
                        const isSelected = activeItineraryDayIdx === idx;
                        const dayNumStr = String(it.dayNumber || idx + 1).padStart(2, "0");
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveItineraryDayIdx(idx)}
                            className={`w-full text-left p-3 rounded-2xl transition-all border flex items-center gap-3 ${
                              isSelected
                                ? "bg-forest-950 text-white border-gold-500 shadow-sm"
                                : "bg-neutral-50 text-neutral-700 border-neutral-200/80 hover:bg-neutral-100/80 hover:border-neutral-300"
                            }`}
                          >
                            <span
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 font-mono transition-colors ${
                                isSelected
                                  ? "bg-gold-500 text-forest-950 font-black shadow-xs"
                                  : "bg-white text-forest-950 border border-neutral-200"
                              }`}
                            >
                              D{dayNumStr}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-gold-400" : "text-neutral-400"}`}>
                                  {it.location || "Pilgrimage"}
                                </span>
                              </div>
                              <p className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-neutral-900"}`}>
                                {it.title}
                              </p>
                            </div>
                            <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-gold-400 translate-x-0.5" : "text-neutral-400 opacity-40"}`} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Active Day Detail Block */}
                    {packageItineraries[activeItineraryDayIdx] && (
                      <div className="lg:col-span-8 bg-gradient-to-br from-neutral-50/90 to-ivory-50/50 p-6 sm:p-7 rounded-3xl border border-neutral-200 space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/80 pb-4">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-xl bg-forest-950 text-gold-400 text-xs font-black font-mono shadow-xs">
                              Day {String(packageItineraries[activeItineraryDayIdx].dayNumber || activeItineraryDayIdx + 1).padStart(2, "0")}
                            </span>
                            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              {packageItineraries[activeItineraryDayIdx].location || "Makkah / Madinah"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={activeItineraryDayIdx === 0}
                              onClick={() => setActiveItineraryDayIdx((prev) => Math.max(0, prev - 1))}
                              className="px-2.5 py-1.5 rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:text-forest-950 hover:bg-neutral-50 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                              ← Prev Day
                            </button>
                            <button
                              type="button"
                              disabled={activeItineraryDayIdx === packageItineraries.length - 1}
                              onClick={() => setActiveItineraryDayIdx((prev) => Math.min(packageItineraries.length - 1, prev + 1))}
                              className="px-2.5 py-1.5 rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:text-forest-950 hover:bg-neutral-50 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                              Next Day →
                            </button>
                          </div>
                        </div>

                        {/* Title & Detailed Activities */}
                        <div className="space-y-3">
                          <h3 className="text-lg sm:text-xl font-serif font-bold text-forest-950 leading-snug">
                            {packageItineraries[activeItineraryDayIdx].title}
                          </h3>
                          <div className="text-neutral-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                            {packageItineraries[activeItineraryDayIdx].activities ||
                              packageItineraries[activeItineraryDayIdx].description ||
                              "Guided pilgrimage schedule and religious activities under scholar supervision."}
                          </div>
                        </div>

                        {/* Logistics Badges (Meals, Transport) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {packageItineraries[activeItineraryDayIdx].meals && (
                            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-neutral-200 text-xs">
                              <span className="p-2 rounded-xl bg-gold-50 text-gold-700">
                                <Utensils className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="block text-[10px] font-bold uppercase text-neutral-400">Included Meals</span>
                                <span className="font-semibold text-neutral-900">{packageItineraries[activeItineraryDayIdx].meals}</span>
                              </div>
                            </div>
                          )}

                          {packageItineraries[activeItineraryDayIdx].transport && (
                            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-neutral-200 text-xs">
                              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                                <Bus className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="block text-[10px] font-bold uppercase text-neutral-400">Transport &amp; Transfer</span>
                                <span className="font-semibold text-neutral-900">{packageItineraries[activeItineraryDayIdx].transport}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* VIEW MODE 2: Full Vertical Chronological Timeline */}
                {itineraryViewMode === "timeline" && (
                  <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-gold-400 before:via-emerald-400 before:to-forest-900">
                    {packageItineraries.map((it: any, idx: number) => {
                      const dayNumStr = String(it.dayNumber || idx + 1).padStart(2, "0");
                      return (
                        <div key={idx} className="relative group">
                          {/* Timeline node */}
                          <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-forest-950 border-2 border-gold-400 flex items-center justify-center text-[10px] font-black text-gold-400 font-mono shadow-xs">
                            {idx + 1}
                          </div>

                          <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200 hover:border-neutral-300 transition-colors space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-lg bg-forest-950 text-gold-400 text-xs font-mono font-bold">
                                  Day {dayNumStr}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                  {it.location || "Makkah / Madinah"}
                                </span>
                              </div>
                              {it.meals && (
                                <span className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
                                  <Utensils className="w-3.5 h-3.5 text-gold-600" />
                                  {it.meals}
                                </span>
                              )}
                            </div>

                            <h4 className="text-base font-serif font-bold text-forest-950">
                              {it.title}
                            </h4>

                            <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">
                              {it.activities || it.description || "Guided pilgrimage schedule and religious activities under scholar supervision."}
                            </p>

                            {it.transport && (
                              <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-1 pt-1 border-t border-neutral-200/60">
                                <Bus className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{it.transport}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Master Travel Requirements & Booking Terms */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h2 className="text-xl font-serif font-bold text-forest-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gold-600" />
                  Travel Requirements &amp; Booking Terms
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Official Policy
                </span>
              </div>

              {/* 1. Travel & Visa Documentation */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  Mandatory Travel &amp; Visa Documentation
                </h3>
                <div className="text-xs text-neutral-600 space-y-1.5 bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200/70 leading-relaxed whitespace-pre-line">
                  {resolvedTravelReqs}
                </div>
              </div>

              {/* 2. Booking Terms & Payment Milestones */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  Booking Terms &amp; Payment Milestones
                </h3>
                <div className="text-xs text-neutral-600 space-y-1.5 bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200/70 leading-relaxed whitespace-pre-line">
                  {resolvedBookingTerms}
                </div>
              </div>

              {/* 3. Cancellation Policy */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Cancellation &amp; Refund Slabs
                </h3>
                <div className="text-xs text-neutral-600 space-y-1.5 bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200/70 leading-relaxed whitespace-pre-line">
                  {resolvedCancellationPolicy}
                </div>
              </div>

              {/* Package-specific important notes (if present) */}
              {pkg.importantNotes && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-1">
                  <strong className="block font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-gold-600" />
                    Special Tour Notes:
                  </strong>
                  <p className="leading-relaxed">{pkg.importantNotes}</p>
                </div>
              )}
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
