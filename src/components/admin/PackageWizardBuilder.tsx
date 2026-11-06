"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/ui/SafeImage";
import { parseZiyaratLandmarks } from "@/lib/ziyarat-helpers";
import {
  MAKKAH_MAIN_ZIYARAT,
  MAKKAH_SPECIAL_ZIYARAT,
  MADINAH_MAIN_ZIYARAT,
  MADINAH_SPECIAL_ZIYARAT,
} from "@/lib/constants/ziyarats";
import {
  Sparkles,
  Building,
  Plane,
  DollarSign,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Upload,
  Trash2,
  Plus,
  Star,
  ShieldCheck,
  Bus,
  Check,
  AlertTriangle,
  ArrowRight,
  Save,
  X,
  FileText,
  Eye,
} from "lucide-react";

export interface PackageWizardBuilderProps {
  initialPackage?: any | null;
  onSaved?: (savedPkg: any) => void;
  onCancel?: () => void;
  isFullPage?: boolean;
}

const PRESET_INCLUSIONS = [
  "Umrah Tourist eVisa with Medical Insurance",
  "Direct Round-trip Airline Flight Tickets",
  "Verified Hotel Accommodations in Makkah & Madinah",
  "3 Daily Fresh Indian Buffet Meals (Breakfast, Lunch, Dinner)",
  "Daily Laundry Assistance & Room Service Support",
  "Air-conditioned Luxury Bus Transportation for All Transfers",
  "Complete Guided Holy Ziyarat in Makkah & Madinah",
  "5 Litres Sealed Zamzam Water Bottle per Pilgrim",
  "Pilgrim Welcome Kit (Trolley Bag, Ihram, Tasbeeh & Umrah Book)",
  "5 Guided Umrah Pilgrimages under Scholar Supervision",
  "24/7 Muallim & Dedicated Group Coordinator Assistance",
];

const PRESET_EXCLUSIONS = [
  "Room service, private telephone calls & personal expenses",
  "Excess baggage charges beyond standard airline allowance",
  "Private wheelchair attendant charges at Haram",
  "Custom individual transport outside scheduled group itineraries",
  "GST & TCS charges unless specifically invoiced",
];

const MAKKAH_ZIYARAT_PRESETS = [
  ...MAKKAH_MAIN_ZIYARAT,
  ...MAKKAH_SPECIAL_ZIYARAT,
];

const MADINAH_ZIYARAT_PRESETS = [
  ...MADINAH_MAIN_ZIYARAT,
  ...MADINAH_SPECIAL_ZIYARAT,
];

export default function PackageWizardBuilder({
  initialPackage,
  onSaved,
  onCancel,
  isFullPage = false,
}: PackageWizardBuilderProps) {
  const router = useRouter();
  const isEditing = Boolean(initialPackage?.id);
  const handleCancel = onCancel || (() => router.push("/admin/packages"));

  // Stepper State (1 to 5)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Upload progress states
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingMakkah, setIsUploadingMakkah] = useState(false);
  const [isUploadingMadinah, setIsUploadingMadinah] = useState(false);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Basic Info & Duration
    name: initialPackage?.name || "",
    slug: initialPackage?.slug || "",
    type: initialPackage?.type || "UMRAH", // UMRAH, RAMADAN_UMRAH, HAJJ, GROUP, PRIVATE
    badge: initialPackage?.badge || "PLATINUM", // PLATINUM, DELUXE, ECONOMY
    year: initialPackage?.year || "2026 / 1448 Hijri",
    durationDays: Number(initialPackage?.durationDays) || 15,
    makkahNights: Number(initialPackage?.makkahNights) || 8,
    madinahNights: Number(initialPackage?.madinahNights) || 7,
    hasSpecificDates: Boolean(initialPackage?.hasSpecificDates),
    departureCycle:
      initialPackage?.departureCycle || "1st & 3rd Week of Every Month",
    startDate: initialPackage?.startDate
      ? new Date(initialPackage.startDate).toISOString().slice(0, 10)
      : "",
    endDate: initialPackage?.endDate
      ? new Date(initialPackage.endDate).toISOString().slice(0, 10)
      : "",
    status: initialPackage?.status || "PUBLISHED",
    isFeatured: initialPackage?.isFeatured !== undefined ? Boolean(initialPackage.isFeatured) : true,
    isPopular: initialPackage?.isPopular !== undefined ? Boolean(initialPackage.isPopular) : true,

    // Step 2: Media & Gallery
    featuredImage: initialPackage?.featuredImage || "/brand/poster.jpg",
    gallery: (() => {
      if (!initialPackage?.gallery) return [] as string[];
      try {
        return typeof initialPackage.gallery === "string"
          ? JSON.parse(initialPackage.gallery)
          : initialPackage.gallery;
      } catch {
        return [] as string[];
      }
    })(),
    makkahImage: initialPackage?.makkahImage || "",
    madinahImage: initialPackage?.madinahImage || "",

    // Step 3: Hotels & Logistics
    makkahHotelName: initialPackage?.makkahHotelName || "Diyafa Jamal or similar",
    makkahHotelRating: Number(initialPackage?.makkahHotelRating) || 4,
    makkahDistance: initialPackage?.makkahDistance || "500m walking",
    makkahAddress: initialPackage
      ? (initialPackage.makkahAddress ?? initialPackage.makkahDescription ?? initialPackage.makkahHotel?.address ?? "")
      : "Ibrahim Al Khalil Road, Makkah Al-Mukarramah",
    makkahMealPlan: initialPackage?.makkahMealPlan || "Indian Buffet Breakfast, Lunch & Dinner",

    madinahHotelName: initialPackage?.madinahHotelName || "Ilaf Kuba or similar",
    madinahHotelRating: Number(initialPackage?.madinahHotelRating) || 4,
    madinahDistance: initialPackage?.madinahDistance || "400m walking",
    madinahAddress: initialPackage
      ? (initialPackage.madinahAddress ?? initialPackage.madinahDescription ?? initialPackage.madinahHotel?.address ?? "")
      : "Central Northern Area, Near Masjid An-Nabawi",
    madinahMealPlan: initialPackage?.madinahMealPlan || "Indian Buffet Breakfast, Lunch & Dinner",

    airline: initialPackage?.airline || "Saudi Airlines (SV)",
    flightType: initialPackage?.flightType || "DIRECT",
    flightNumber: initialPackage?.flightNumber || "SV-741",
    departureAirport: initialPackage?.departureAirport || "Mumbai (BOM)",
    departureCity: initialPackage?.departureCity || "Mumbai",
    arrivalAirport: initialPackage?.arrivalAirport || "JED / MED",
    baggage: initialPackage?.baggage || "2x 23kg Check-in + 7kg Cabin + 5L Zamzam",
    flightDetails: initialPackage?.flightDetails || "Direct Return Flight with Saudi Airlines",
    localTransport: "Air-Conditioned Luxury Coach Bus",

    // Step 4: Pricing & Room Sharing
    currency: initialPackage?.currency || "INR",
    basePrice: Number(initialPackage?.basePrice) || 85000,
    priceQuad: Number(initialPackage?.priceQuad) || 85000,
    priceTriple: Number(initialPackage?.priceTriple) || 92000,
    priceDouble: Number(initialPackage?.priceDouble) || 105000,
    priceSingle: initialPackage?.priceSingle ? Number(initialPackage.priceSingle) : 135000,
    childPrice: initialPackage?.childPrice ? Number(initialPackage.childPrice) : "",
    infantPrice: initialPackage?.infantPrice ? Number(initialPackage.infantPrice) : "",
    mrpPrice: initialPackage?.mrpPrice ? Number(initialPackage.mrpPrice) : "",
    totalSeats: Number(initialPackage?.totalSeats) || 45,
    bookedSeats: Number(initialPackage?.bookedSeats) || 0,

    // Step 5: Inclusions & Ziyarat
    inclusionsList: (() => {
      if (initialPackage?.inclusions && Array.isArray(initialPackage.inclusions)) {
        const inc = initialPackage.inclusions
          .filter((i: any) => i.isIncluded)
          .map((i: any) => i.title);
        if (inc.length > 0) return inc;
      }
      return PRESET_INCLUSIONS.slice(0, 9);
    })() as string[],

    exclusionsList: (() => {
      if (initialPackage?.inclusions && Array.isArray(initialPackage.inclusions)) {
        const exc = initialPackage.inclusions
          .filter((i: any) => !i.isIncluded)
          .map((i: any) => i.title);
        if (exc.length > 0) return exc;
      }
      return PRESET_EXCLUSIONS.slice(0, 4);
    })() as string[],

    selectedMakkahZiyarat: (() => {
      if (initialPackage?.highlights) {
        const parsed = parseZiyaratLandmarks(initialPackage.highlights);
        if (parsed.makkah.length > 0) return parsed.makkah;
      }
      return isEditing ? [] : [...MAKKAH_MAIN_ZIYARAT];
    })() as string[],
    selectedMadinahZiyarat: (() => {
      if (initialPackage?.highlights) {
        const parsed = parseZiyaratLandmarks(initialPackage.highlights);
        if (parsed.madinah.length > 0) return parsed.madinah;
      }
      return isEditing ? [] : [...MADINAH_MAIN_ZIYARAT];
    })() as string[],
    customMakkahZiyaratText: "",
    customMadinahZiyaratText: "",
    customInclusionText: "",
    overview: initialPackage
      ? (initialPackage.overview ?? initialPackage.description ?? "")
      : "Experience a transformative pilgrimage with scholarly guidance, walking-distance hotels, hot Indian buffet meals, and comprehensive holy ziyarats in Makkah and Madinah.",
  });

  // Auto-generate slug when title changes unless manually edited
  const handleNameChange = (newName: string) => {
    setForm((prev) => {
      const updated: any = { ...prev, name: newName };
      if (!slugManuallyEdited && !isEditing) {
        updated.slug = newName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      return updated;
    });
  };

  // Helper: Upload file to /api/admin/packages/upload-image
  const uploadImageFile = async (
    file: File,
    setLoadingState: (val: boolean) => void
  ): Promise<string | null> => {
    setLoadingState(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("category", "PACKAGES");

      const res = await fetch("/api/admin/packages/upload-image", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to upload image.");
      }
      return json.url;
    } catch (err: any) {
      alert(err.message || "Image upload failed. Please try again.");
      return null;
    } finally {
      setLoadingState(false);
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!form.name.trim()) {
      setErrorMessage("Please enter a Package Title.");
      return false;
    }
    if (form.makkahNights <= 0 || form.madinahNights <= 0) {
      setErrorMessage("Please enter at least 1 night for both Makkah and Madinah.");
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  // Step 4 Validation
  const validateStep4 = () => {
    if (!form.basePrice || form.basePrice <= 0) {
      setErrorMessage("Please specify a valid Quad sharing base price.");
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 4 && !validateStep4()) return;
    setErrorMessage(null);
    setCurrentStep((prev) => Math.min(5, prev + 1) as any);
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(1, prev - 1) as any);
  };

  // Final Submit Handler
  const handleFinalSubmit = async () => {
    if (!validateStep1() || !validateStep4()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Assemble highlights and features
      const ziyaratHighlights = [
        ...form.selectedMakkahZiyarat.map((z) => `Makkah Ziyarat: ${z}`),
        ...form.selectedMadinahZiyarat.map((z) => `Madinah Ziyarat: ${z}`),
      ];

      const allFeatures = [
        `${form.durationDays} Days Total Pilgrimage`,
        `${form.makkahNights} Nights Makkah Stay`,
        `${form.madinahNights} Nights Madinah Stay`,
        form.airline ? `${form.airline} Flight` : "Direct Return Flight",
        "3 Times Fresh Indian Buffet Meals",
        "Complete Guided Holy Ziyarat",
        "5 Litres Sealed Zamzam Can",
      ];

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        type: form.type,
        badge: form.badge,
        year: form.year,
        durationDays: Number(form.durationDays),
        makkahNights: Number(form.makkahNights),
        madinahNights: Number(form.madinahNights),
        hasSpecificDates: form.hasSpecificDates,
        departureCycle: form.hasSpecificDates ? null : form.departureCycle,
        startDate: form.hasSpecificDates && form.startDate ? form.startDate : null,
        endDate: form.hasSpecificDates && form.endDate ? form.endDate : null,
        departureDate: form.hasSpecificDates && form.startDate ? form.startDate : "Scheduled Monthly",
        departureCity: form.departureCity,
        status: form.status,
        isFeatured: form.isFeatured,
        isPopular: form.isPopular,

        featuredImage: form.featuredImage,
        gallery: form.gallery,

        makkahHotelName: form.makkahHotelName,
        makkahHotelRating: Number(form.makkahHotelRating),
        makkahDistance: form.makkahDistance,
        makkahAddress: form.makkahAddress ? form.makkahAddress.trim() : "",
        makkahDescription: form.makkahAddress ? form.makkahAddress.trim() : "",
        makkahImage: form.makkahImage || null,
        makkahMealPlan: form.makkahMealPlan,

        madinahHotelName: form.madinahHotelName,
        madinahHotelRating: Number(form.madinahHotelRating),
        madinahDistance: form.madinahDistance,
        madinahAddress: form.madinahAddress ? form.madinahAddress.trim() : "",
        madinahDescription: form.madinahAddress ? form.madinahAddress.trim() : "",
        madinahImage: form.madinahImage || null,
        madinahMealPlan: form.madinahMealPlan,

        airline: form.airline,
        flightType: form.flightType,
        flightNumber: form.flightNumber,
        departureAirport: form.departureAirport,
        arrivalAirport: form.arrivalAirport,
        baggage: form.baggage,
        flightDetails: form.flightDetails,

        currency: form.currency,
        basePrice: Number(form.basePrice),
        priceQuad: Number(form.priceQuad || form.basePrice),
        priceTriple: Number(form.priceTriple || Math.round(form.basePrice * 1.1)),
        priceDouble: Number(form.priceDouble || Math.round(form.basePrice * 1.25)),
        priceSingle: form.priceSingle ? Number(form.priceSingle) : null,
        childPrice: form.childPrice ? Number(form.childPrice) : null,
        infantPrice: form.infantPrice ? Number(form.infantPrice) : null,
        mrpPrice: form.mrpPrice ? Number(form.mrpPrice) : null,

        totalSeats: Number(form.totalSeats),
        bookedSeats: Number(form.bookedSeats),

        inclusions: form.inclusionsList.map((title) => ({
          title,
          isIncluded: true,
          icon: "CheckCircle2",
        })),
        exclusions: form.exclusionsList.map((title) => ({
          title,
          isIncluded: false,
          icon: "XCircle",
        })),

        highlights: JSON.stringify({
          makkah: form.selectedMakkahZiyarat,
          madinah: form.selectedMadinahZiyarat,
        }),
        ziyaratLandmarks: {
          makkah: form.selectedMakkahZiyarat,
          madinah: form.selectedMadinahZiyarat,
        },
        features: JSON.stringify(allFeatures),
        overview: form.overview ? form.overview.trim() : "",
        description: form.overview ? form.overview.trim() : "",
      };

      const url = isEditing
        ? `/api/packages/${initialPackage.id}`
        : "/api/packages";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Failed to save package.");
      }

      const savedPackage = resData.package || resData.data;

      if (onSaved) {
        onSaved(savedPackage);
      } else {
        router.push("/admin/packages");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving the package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: "Basic Info & Dates", icon: Calendar },
    { num: 2, title: "Visual Photos & Gallery", icon: ImageIcon },
    { num: 3, title: "Hotels & Flights", icon: Building },
    { num: 4, title: "Room Pricing", icon: DollarSign },
    { num: 5, title: "Inclusions & Ziyarat", icon: CheckCircle2 },
  ];

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col ${
        isFullPage ? "max-w-6xl mx-auto my-6" : "max-h-[90vh]"
      }`}
    >
      {/* 1. Modal / Full-page Top Header Bar */}
      <div className="bg-slate-950 px-6 sm:px-8 py-5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-gold-500/10 text-gold-400 border border-gold-500/30">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
              {isEditing ? "Edit Pilgrimage Package" : "Create New Pilgrimage Package"}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-gold-400 border border-slate-700">
                {form.type}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Multi-step wizard collecting comprehensive hotel, flight, stay breakdown, and pricing details.
            </p>
          </div>
        </div>

        <button
          onClick={handleCancel}
          type="button"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close or return to packages catalog"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Interactive Stepper Navigation Bar */}
      <div className="bg-slate-950/70 border-b border-slate-800 px-6 sm:px-8 py-3 overflow-x-auto shrink-0 scrollbar-none">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {stepsList.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <React.Fragment key={step.num}>
                <button
                  type="button"
                  onClick={() => {
                    if (step.num < currentStep || validateStep1()) {
                      setCurrentStep(step.num as any);
                    }
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 to-gold-500/20 text-gold-300 border border-gold-500/40 shadow-sm"
                      : isCompleted
                      ? "text-emerald-400 hover:text-emerald-300 bg-emerald-950/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isActive
                        ? "bg-gold-500 text-slate-950"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </span>
                  <span className="whitespace-nowrap">{step.title}</span>
                </button>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      currentStep > step.num ? "bg-emerald-600/50" : "bg-slate-800"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Main Step Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Basic Info & Duration */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-400" />
                Step 1: Basic Information &amp; Stay Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your package title, travel category, tier badge, and stay distribution.
              </p>
            </div>

            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Package Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Umrah Platinum VIP Package 2026"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL Slug (Auto-generated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="umrah-platinum-vip-package-2026"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setForm({ ...form, slug: e.target.value });
                  }}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-300 font-mono focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            {/* Category Select (Visual Pill Buttons) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Pilgrimage Category
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "UMRAH", label: "Umrah Journey", icon: "🕋" },
                  { id: "RAMADAN_UMRAH", label: "Ramadan Special", icon: "🌙" },
                  { id: "HAJJ", label: "Hajj Pilgrimage", icon: "⭐" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({ ...form, type: cat.id })}
                    className={`py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      form.type === cat.id
                        ? "bg-gradient-to-r from-amber-500/20 to-gold-500/20 border-gold-500 text-gold-300 shadow-md scale-[1.01]"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Package Tier Badge */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Package Tier Badge
              </label>
              <div className="flex flex-wrap gap-2.5">
                {["ECONOMY", "DELUXE", "SUPER_DELUXE", "PLATINUM", "VIP_ROYAL"].map(
                  (tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setForm({ ...form, badge: tier })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        form.badge === tier
                          ? "bg-gold-500 text-slate-950 border-gold-500 shadow-gold"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {tier.replace(/_/g, " ")}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Stay Split & Auto-calculated Duration */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  City Stay Breakdown &amp; Duration
                </span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-500/30">
                  Total Calculated: {form.durationDays} Days ({form.makkahNights}N Makkah / {form.madinahNights}N Madinah)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Makkah Stay (Nights)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={form.makkahNights}
                    onChange={(e) => {
                      const mNights = Number(e.target.value) || 0;
                      setForm((prev) => ({
                        ...prev,
                        makkahNights: mNights,
                        durationDays: mNights + prev.madinahNights,
                      }));
                    }}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Madinah Stay (Nights)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={form.madinahNights}
                    onChange={(e) => {
                      const mdNights = Number(e.target.value) || 0;
                      setForm((prev) => ({
                        ...prev,
                        madinahNights: mdNights,
                        durationDays: prev.makkahNights + mdNights,
                      }));
                    }}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Total Package Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.durationDays}
                    onChange={(e) =>
                      setForm({ ...form, durationDays: Number(e.target.value) })
                    }
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold text-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Departure Mode Switch */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Departure Scheduling Mode
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Choose whether this package follows recurring monthly cycles or fixed calendar dates.
                  </p>
                </div>
                <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, hasSpecificDates: false })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !form.hasSpecificDates
                        ? "bg-gold-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Recurring Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, hasSpecificDates: true })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      form.hasSpecificDates
                        ? "bg-gold-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Specific Dates (Ramadan/Hajj)
                  </button>
                </div>
              </div>

              {!form.hasSpecificDates ? (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Departure Frequency / Recurring Cycle
                  </label>
                  <input
                    type="text"
                    value={form.departureCycle}
                    onChange={(e) =>
                      setForm({ ...form, departureCycle: e.target.value })
                    }
                    placeholder="e.g. 1st & 3rd Week of Every Month"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-gold-500"
                  />
                  <div className="flex gap-2 mt-2">
                    {[
                      "1st & 3rd Week of Every Month",
                      "Every Saturday Departure",
                      "Bi-Weekly Confirmed Batches",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setForm({ ...form, departureCycle: opt })}
                        className="text-[11px] text-slate-400 hover:text-gold-300 underline"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Start / Departure Date
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Return / End Date
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Package Overview / Summary Description */}
            <div className="space-y-1.5 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Package Overview / Summary Description *
                </label>
                <span className="text-[11px] text-slate-500">
                  Displayed prominently on public detail page and SEO meta
                </span>
              </div>
              <textarea
                rows={4}
                value={form.overview}
                onChange={(e) => setForm({ ...form, overview: e.target.value })}
                placeholder="Enter comprehensive spiritual package overview, guidance details, and key focus for pilgrims..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Media & Image Gallery (Visual Drag-and-Drop) */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gold-400" />
                Step 2: Media &amp; Image Gallery (Direct Upload)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload high-resolution package cover photo, multiple gallery photos, and dedicated Makkah/Madinah hotel views.
              </p>
            </div>

            {/* Featured Cover Image Dropzone */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                1. Featured Package Cover Image *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const url = await uploadImageFile(file, setIsUploadingCover);
                        if (url) setForm((prev) => ({ ...prev, featuredImage: url }));
                      }
                    }}
                    className="border-2 border-dashed border-slate-700 hover:border-gold-500/70 rounded-2xl p-6 bg-slate-950 text-center cursor-pointer transition-colors space-y-2 relative"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImageFile(file, setIsUploadingCover);
                          if (url) setForm((prev) => ({ ...prev, featuredImage: url }));
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-gold-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-200">
                      {isUploadingCover
                        ? "Uploading to Supabase CDN..."
                        : "Click or Drag & Drop Cover Photo here"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Supports JPG, PNG, WEBP up to 10MB
                    </p>
                  </div>
                </div>

                <div className="md:col-span-4 flex justify-center">
                  <div className="relative w-48 h-32 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-md">
                    <SafeImage
                      src={form.featuredImage || "/brand/poster.jpg"}
                      fallbackSrc="/brand/poster.jpg"
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Multiple Gallery Photos Dropzone */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300">
                2. Package Gallery Photos (Multiple)
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files || []);
                  for (const f of files) {
                    const url = await uploadImageFile(f, setIsUploadingGallery);
                    if (url) {
                      setForm((prev) => ({ ...prev, gallery: [...prev.gallery, url] }));
                    }
                  }
                }}
                className="border-2 border-dashed border-slate-700 hover:border-gold-500/70 rounded-2xl p-6 bg-slate-950 text-center cursor-pointer transition-colors space-y-2 relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    for (const f of files) {
                      const url = await uploadImageFile(f, setIsUploadingGallery);
                      if (url) {
                        setForm((prev) => ({ ...prev, gallery: [...prev.gallery, url] }));
                      }
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <ImageIcon className="w-7 h-7 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-slate-200">
                  {isUploadingGallery
                    ? "Uploading gallery images..."
                    : "Add Photos to Package Gallery (Select Multiple)"}
                </p>
                <p className="text-[11px] text-slate-500">
                  Upload hotel interior, Haram views, or ziyarat milestones
                </p>
              </div>

              {/* Gallery Grid Preview */}
              {form.gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {form.gallery.map((imgUrl: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative h-24 rounded-xl overflow-hidden border border-slate-700 group bg-slate-950"
                    >
                      <SafeImage
                        src={imgUrl}
                        fallbackSrc="/brand/poster.jpg"
                        alt={`Gallery ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            gallery: prev.gallery.filter((_: string, i: number) => i !== idx),
                          }))
                        }
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hotel Photo Upload Slots */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                3. Dedicated Hotel View Photos
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Makkah Hotel Photo */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 block">
                    Makkah Hotel Photo
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="relative w-20 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-900">
                      <SafeImage
                        src={form.makkahImage || "/brand/poster.jpg"}
                        fallbackSrc="/brand/poster.jpg"
                        alt="Makkah Hotel"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <label className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-center text-slate-200 cursor-pointer transition-colors">
                      {isUploadingMakkah ? "Uploading..." : "Upload Makkah Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await uploadImageFile(file, setIsUploadingMakkah);
                            if (url) setForm((prev) => ({ ...prev, makkahImage: url }));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Madinah Hotel Photo */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-gold-400 block">
                    Madinah Hotel Photo
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="relative w-20 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-900">
                      <SafeImage
                        src={form.madinahImage || "/brand/poster.jpg"}
                        fallbackSrc="/brand/poster.jpg"
                        alt="Madinah Hotel"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <label className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-center text-slate-200 cursor-pointer transition-colors">
                      {isUploadingMadinah ? "Uploading..." : "Upload Madinah Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await uploadImageFile(file, setIsUploadingMadinah);
                            if (url) setForm((prev) => ({ ...prev, madinahImage: url }));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Hotels & Travel Logistics */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-gold-400" />
                Step 3: Hotel Accommodations &amp; Travel Logistics
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure verified distances to Haram courtyards, star ratings, airline tickets, and group transport.
              </p>
            </div>

            {/* Makkah Hotel Card */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Building className="w-4 h-4" />
                  Makkah Al-Mukarramah Hotel Details
                </span>
                {/* Star rating selector */}
                <div className="flex items-center gap-1 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 mr-1">Rating:</span>
                  {[3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, makkahHotelRating: star })}
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        form.makkahHotelRating === star
                          ? "bg-gold-500 text-slate-950"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    value={form.makkahHotelName}
                    onChange={(e) =>
                      setForm({ ...form, makkahHotelName: e.target.value })
                    }
                    placeholder="e.g. Diyafa Jamal / Swissotel Clock Tower"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Distance from Haram Courtyard
                  </label>
                  <input
                    type="text"
                    value={form.makkahDistance}
                    onChange={(e) =>
                      setForm({ ...form, makkahDistance: e.target.value })
                    }
                    placeholder="e.g. 100m / Courtyard Facing / 500m walking"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Hotel Address / Landmark Area
                </label>
                <input
                  type="text"
                  value={form.makkahAddress}
                  onChange={(e) => setForm({ ...form, makkahAddress: e.target.value })}
                  placeholder="Ibrahim Al Khalil Road, Makkah Al-Mukarramah"
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Madinah Hotel Card */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                  <Building className="w-4 h-4" />
                  Madinah Al-Munawwarah Hotel Details
                </span>
                {/* Star rating selector */}
                <div className="flex items-center gap-1 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 mr-1">Rating:</span>
                  {[3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, madinahHotelRating: star })}
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        form.madinahHotelRating === star
                          ? "bg-gold-500 text-slate-950"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    value={form.madinahHotelName}
                    onChange={(e) =>
                      setForm({ ...form, madinahHotelName: e.target.value })
                    }
                    placeholder="e.g. Ilaf Kuba / Dar Al Taqwa / Anwar Al Madinah"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Distance from Masjid An-Nabawi
                  </label>
                  <input
                    type="text"
                    value={form.madinahDistance}
                    onChange={(e) =>
                      setForm({ ...form, madinahDistance: e.target.value })
                    }
                    placeholder="e.g. 50m / Bab As-Salam / 400m walking"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Hotel Address / Landmark Area
                </label>
                <input
                  type="text"
                  value={form.madinahAddress}
                  onChange={(e) => setForm({ ...form, madinahAddress: e.target.value })}
                  placeholder="Central Northern Area, Near Masjid An-Nabawi"
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Flight & Transport */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-emerald-400" />
                  Flight Specifications &amp; Transport
                </span>
                <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, flightType: "DIRECT" })}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      form.flightType === "DIRECT"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Direct Flight
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, flightType: "CONNECTING" })}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      form.flightType === "CONNECTING"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    1-Stop Connecting
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Airline Carrier
                  </label>
                  <input
                    type="text"
                    value={form.airline}
                    onChange={(e) => setForm({ ...form, airline: e.target.value })}
                    placeholder="Saudi Airlines (SV) / Air India / IndiGo"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Departure Airport
                  </label>
                  <input
                    type="text"
                    value={form.departureAirport}
                    onChange={(e) =>
                      setForm({ ...form, departureAirport: e.target.value })
                    }
                    placeholder="Mumbai (BOM)"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Arrival Airport
                  </label>
                  <input
                    type="text"
                    value={form.arrivalAirport}
                    onChange={(e) =>
                      setForm({ ...form, arrivalAirport: e.target.value })
                    }
                    placeholder="Jeddah (JED) / Madinah (MED)"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Baggage Allowance
                  </label>
                  <input
                    type="text"
                    value={form.baggage}
                    onChange={(e) => setForm({ ...form, baggage: e.target.value })}
                    placeholder="2x 23kg Check-in + 7kg Hand Bag + 5L Zamzam"
                    className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Local Ground Transport
                  </label>
                  <input
                    type="text"
                    value={form.localTransport}
                    onChange={(e) =>
                      setForm({ ...form, localTransport: e.target.value })
                    }
                    placeholder="Air-Conditioned Luxury Coach Bus"
                    className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Pricing & Room Sharing */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gold-400" />
                Step 4: Pricing &amp; Room Sharing Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Set transparent room-wise sharing rates (Quad, Triple, Double, Single) and seat capacity.
              </p>
            </div>

            {/* Room Sharing 4-Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Quad Sharing */}
              <div className="p-4 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase">
                    Quad Sharing (4 Beds)
                  </span>
                  <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-300 font-bold">
                    Base Rate
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    value={form.priceQuad}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setForm({ ...form, priceQuad: val, basePrice: val });
                    }}
                    className="w-full text-lg font-bold bg-transparent text-white focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Starting public display rate</p>
              </div>

              {/* Triple Sharing */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase">
                    Triple Sharing (3 Beds)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={form.priceTriple}
                    onChange={(e) =>
                      setForm({ ...form, priceTriple: Number(e.target.value) || 0 })
                    }
                    className="w-full text-lg font-bold bg-transparent text-white focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Per pilgrim in triple room</p>
              </div>

              {/* Double Sharing */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gold-400 uppercase">
                    Double Sharing (2 Beds)
                  </span>
                  <span className="text-[10px] bg-gold-950 px-2 py-0.5 rounded text-gold-300 font-bold">
                    Couples
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={form.priceDouble}
                    onChange={(e) =>
                      setForm({ ...form, priceDouble: Number(e.target.value) || 0 })
                    }
                    className="w-full text-lg font-bold bg-transparent text-white focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Per pilgrim in double room</p>
              </div>

              {/* Single Room */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase">
                    Single Room (1 Bed)
                  </span>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={form.priceSingle}
                    onChange={(e) =>
                      setForm({ ...form, priceSingle: Number(e.target.value) || 0 })
                    }
                    className="w-full text-lg font-bold bg-transparent text-white focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Full private room rate</p>
              </div>
            </div>

            {/* Child & Seat Inventory Grid */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Additional Child Rates &amp; Seat Capacity
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Child With Bed (₹)
                  </label>
                  <input
                    type="number"
                    value={form.childPrice}
                    onChange={(e) =>
                      setForm({ ...form, childPrice: e.target.value as any })
                    }
                    placeholder="e.g. 75000"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Infant Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={form.infantPrice}
                    onChange={(e) =>
                      setForm({ ...form, infantPrice: e.target.value as any })
                    }
                    placeholder="e.g. 35000"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    MRP / Strikethrough (₹)
                  </label>
                  <input
                    type="number"
                    value={form.mrpPrice}
                    onChange={(e) =>
                      setForm({ ...form, mrpPrice: e.target.value as any })
                    }
                    placeholder="e.g. 110000"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Total Seat Capacity
                  </label>
                  <input
                    type="number"
                    value={form.totalSeats}
                    onChange={(e) =>
                      setForm({ ...form, totalSeats: Number(e.target.value) || 45 })
                    }
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold text-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Inclusions, Exclusions & Ziyarat */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Step 5: Inclusions, Exclusions, Ziyarat &amp; Review
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle pre-made inclusion chips with 1 click, select holy ziyarat landmarks, and review the package summary.
              </p>
            </div>

            {/* Clickable Inclusion Chips */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Pre-Made Clickable Inclusions (Toggle ON / OFF)
                </span>
                <span className="text-[11px] text-slate-400">
                  {form.inclusionsList.length} items active
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {PRESET_INCLUSIONS.map((inc) => {
                  const isChecked = form.inclusionsList.includes(inc);
                  return (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          inclusionsList: isChecked
                            ? prev.inclusionsList.filter((item) => item !== inc)
                            : [...prev.inclusionsList, inc],
                        }));
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        isChecked
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-sm"
                          : "bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <Check
                        className={`w-3.5 h-3.5 ${
                          isChecked ? "text-emerald-400" : "opacity-30"
                        }`}
                      />
                      <span>{inc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Inclusion Tag Input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={form.customInclusionText}
                  onChange={(e) =>
                    setForm({ ...form, customInclusionText: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && form.customInclusionText.trim()) {
                      e.preventDefault();
                      setForm((prev) => ({
                        ...prev,
                        inclusionsList: [
                          ...prev.inclusionsList,
                          prev.customInclusionText.trim(),
                        ],
                        customInclusionText: "",
                      }));
                    }
                  }}
                  placeholder="Type custom inclusion and press Enter..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (form.customInclusionText.trim()) {
                      setForm((prev) => ({
                        ...prev,
                        inclusionsList: [
                          ...prev.inclusionsList,
                          prev.customInclusionText.trim(),
                        ],
                        customInclusionText: "",
                      }));
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl shrink-0"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Clickable Exclusions Chips */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Standard Exclusions (Toggle ON / OFF)
              </span>

              <div className="flex flex-wrap gap-2">
                {PRESET_EXCLUSIONS.map((exc) => {
                  const isChecked = form.exclusionsList.includes(exc);
                  return (
                    <button
                      key={exc}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          exclusionsList: isChecked
                            ? prev.exclusionsList.filter((item) => item !== exc)
                            : [...prev.exclusionsList, exc],
                        }));
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        isChecked
                          ? "bg-red-950/80 text-red-300 border-red-500/50 shadow-sm"
                          : "bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <X
                        className={`w-3.5 h-3.5 ${
                          isChecked ? "text-red-400" : "opacity-30"
                        }`}
                      />
                      <span>{exc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ziyarat Holy Landmarks Checklist */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-6 pt-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Holy Ziyarat Landmarks Covered
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select verified sacred landmarks to display on the package detail page. You can toggle presets or add custom ziyarats.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-200">
                    {form.selectedMakkahZiyarat.length + form.selectedMadinahZiyarat.length} Total Selected
                  </span>
                </div>
              </div>

              {/* SECTION A: MAKKAH AL-MUKARRAMAH */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-base">🕋</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Makkah Al-Mukarramah Ziyarat ({form.selectedMakkahZiyarat.length} selected)
                  </h4>
                </div>

                {/* 1. Makkah Main Ziyarat (7 items) */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>🕋</span> Makkah Main Ziyarat ({MAKKAH_MAIN_ZIYARAT.length} items)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => {
                          const allSelected = MAKKAH_MAIN_ZIYARAT.every((item) =>
                            prev.selectedMakkahZiyarat.includes(item)
                          );
                          return {
                            ...prev,
                            selectedMakkahZiyarat: allSelected
                              ? prev.selectedMakkahZiyarat.filter((item) => !MAKKAH_MAIN_ZIYARAT.includes(item))
                              : Array.from(new Set([...prev.selectedMakkahZiyarat, ...MAKKAH_MAIN_ZIYARAT])),
                          };
                        });
                      }}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {MAKKAH_MAIN_ZIYARAT.every((item) => form.selectedMakkahZiyarat.includes(item))
                        ? "Clear All"
                        : "Select All"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MAKKAH_MAIN_ZIYARAT.map((landmark) => {
                      const isChecked = form.selectedMakkahZiyarat.includes(landmark);
                      return (
                        <button
                          key={landmark}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              selectedMakkahZiyarat: isChecked
                                ? prev.selectedMakkahZiyarat.filter((l) => l !== landmark)
                                : [...prev.selectedMakkahZiyarat, landmark],
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                            isChecked
                              ? "bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-xs"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          {isChecked ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded border border-slate-600 block shrink-0" />
                          )}
                          <span>{landmark}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Special Makkah Ziyarat (9 items) */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>✨</span> Special Makkah Ziyarat ({MAKKAH_SPECIAL_ZIYARAT.length} items)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => {
                          const allSelected = MAKKAH_SPECIAL_ZIYARAT.every((item) =>
                            prev.selectedMakkahZiyarat.includes(item)
                          );
                          return {
                            ...prev,
                            selectedMakkahZiyarat: allSelected
                              ? prev.selectedMakkahZiyarat.filter((item) => !MAKKAH_SPECIAL_ZIYARAT.includes(item))
                              : Array.from(new Set([...prev.selectedMakkahZiyarat, ...MAKKAH_SPECIAL_ZIYARAT])),
                          };
                        });
                      }}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {MAKKAH_SPECIAL_ZIYARAT.every((item) => form.selectedMakkahZiyarat.includes(item))
                        ? "Clear All"
                        : "Select All"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MAKKAH_SPECIAL_ZIYARAT.map((landmark) => {
                      const isChecked = form.selectedMakkahZiyarat.includes(landmark);
                      return (
                        <button
                          key={landmark}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              selectedMakkahZiyarat: isChecked
                                ? prev.selectedMakkahZiyarat.filter((l) => l !== landmark)
                                : [...prev.selectedMakkahZiyarat, landmark],
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                            isChecked
                              ? "bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-xs"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          {isChecked ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded border border-slate-600 block shrink-0" />
                          )}
                          <span>{landmark}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Makkah Landmarks (if any previously added) */}
                {form.selectedMakkahZiyarat.some(
                  (item) => !MAKKAH_MAIN_ZIYARAT.includes(item) && !MAKKAH_SPECIAL_ZIYARAT.includes(item)
                ) && (
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-400">Custom Added Makkah Landmarks:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {form.selectedMakkahZiyarat
                        .filter((item) => !MAKKAH_MAIN_ZIYARAT.includes(item) && !MAKKAH_SPECIAL_ZIYARAT.includes(item))
                        .map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-900/40 border border-emerald-500/40 text-emerald-300"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  selectedMakkahZiyarat: prev.selectedMakkahZiyarat.filter((l) => l !== item),
                                }))
                              }
                              className="hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Custom Makkah Landmark Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={form.customMakkahZiyaratText}
                    onChange={(e) => setForm({ ...form, customMakkahZiyaratText: e.target.value })}
                    placeholder="Type custom Makkah ziyarat (e.g. Masjid Aisha Tan'eem, Makkah Library)..."
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = form.customMakkahZiyaratText.trim();
                        if (val && !form.selectedMakkahZiyarat.includes(val)) {
                          setForm((prev) => ({
                            ...prev,
                            selectedMakkahZiyarat: [...prev.selectedMakkahZiyarat, val],
                            customMakkahZiyaratText: "",
                          }));
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = form.customMakkahZiyaratText.trim();
                      if (val && !form.selectedMakkahZiyarat.includes(val)) {
                        setForm((prev) => ({
                          ...prev,
                          selectedMakkahZiyarat: [...prev.selectedMakkahZiyarat, val],
                          customMakkahZiyaratText: "",
                        }));
                      }
                    }}
                    className="px-3.5 py-2 bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-500/50 text-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Landmark</span>
                  </button>
                </div>
              </div>

              {/* SECTION B: MADINAH AL-MUNAWWARAH */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-base">🕌</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                    Madinah Al-Munawwarah Ziyarat ({form.selectedMadinahZiyarat.length} selected)
                  </h4>
                </div>

                {/* 3. Madinah Main Ziyarat (7 items) */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>🕌</span> Madinah Main Ziyarat ({MADINAH_MAIN_ZIYARAT.length} items)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => {
                          const allSelected = MADINAH_MAIN_ZIYARAT.every((item) =>
                            prev.selectedMadinahZiyarat.includes(item)
                          );
                          return {
                            ...prev,
                            selectedMadinahZiyarat: allSelected
                              ? prev.selectedMadinahZiyarat.filter((item) => !MADINAH_MAIN_ZIYARAT.includes(item))
                              : Array.from(new Set([...prev.selectedMadinahZiyarat, ...MADINAH_MAIN_ZIYARAT])),
                          };
                        });
                      }}
                      className="text-[11px] font-semibold text-gold-400 hover:text-gold-300 transition-colors"
                    >
                      {MADINAH_MAIN_ZIYARAT.every((item) => form.selectedMadinahZiyarat.includes(item))
                        ? "Clear All"
                        : "Select All"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MADINAH_MAIN_ZIYARAT.map((landmark) => {
                      const isChecked = form.selectedMadinahZiyarat.includes(landmark);
                      return (
                        <button
                          key={landmark}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              selectedMadinahZiyarat: isChecked
                                ? prev.selectedMadinahZiyarat.filter((l) => l !== landmark)
                                : [...prev.selectedMadinahZiyarat, landmark],
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                            isChecked
                              ? "bg-amber-950/80 border-gold-500 text-gold-200 shadow-xs"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          {isChecked ? (
                            <Check className="w-3.5 h-3.5 text-gold-400" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded border border-slate-600 block shrink-0" />
                          )}
                          <span>{landmark}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Special Madinah Ziyarat (10 items) */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>🌴</span> Special Madinah Ziyarat ({MADINAH_SPECIAL_ZIYARAT.length} items)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => {
                          const allSelected = MADINAH_SPECIAL_ZIYARAT.every((item) =>
                            prev.selectedMadinahZiyarat.includes(item)
                          );
                          return {
                            ...prev,
                            selectedMadinahZiyarat: allSelected
                              ? prev.selectedMadinahZiyarat.filter((item) => !MADINAH_SPECIAL_ZIYARAT.includes(item))
                              : Array.from(new Set([...prev.selectedMadinahZiyarat, ...MADINAH_SPECIAL_ZIYARAT])),
                          };
                        });
                      }}
                      className="text-[11px] font-semibold text-gold-400 hover:text-gold-300 transition-colors"
                    >
                      {MADINAH_SPECIAL_ZIYARAT.every((item) => form.selectedMadinahZiyarat.includes(item))
                        ? "Clear All"
                        : "Select All"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MADINAH_SPECIAL_ZIYARAT.map((landmark) => {
                      const isChecked = form.selectedMadinahZiyarat.includes(landmark);
                      return (
                        <button
                          key={landmark}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              selectedMadinahZiyarat: isChecked
                                ? prev.selectedMadinahZiyarat.filter((l) => l !== landmark)
                                : [...prev.selectedMadinahZiyarat, landmark],
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                            isChecked
                              ? "bg-amber-950/80 border-gold-500 text-gold-200 shadow-xs"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          {isChecked ? (
                            <Check className="w-3.5 h-3.5 text-gold-400" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded border border-slate-600 block shrink-0" />
                          )}
                          <span>{landmark}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Madinah Landmarks (if any previously added) */}
                {form.selectedMadinahZiyarat.some(
                  (item) => !MADINAH_MAIN_ZIYARAT.includes(item) && !MADINAH_SPECIAL_ZIYARAT.includes(item)
                ) && (
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-400">Custom Added Madinah Landmarks:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {form.selectedMadinahZiyarat
                        .filter((item) => !MADINAH_MAIN_ZIYARAT.includes(item) && !MADINAH_SPECIAL_ZIYARAT.includes(item))
                        .map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-900/40 border border-gold-500/40 text-gold-300"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  selectedMadinahZiyarat: prev.selectedMadinahZiyarat.filter((l) => l !== item),
                                }))
                              }
                              className="hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Custom Madinah Landmark Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={form.customMadinahZiyaratText}
                    onChange={(e) => setForm({ ...form, customMadinahZiyaratText: e.target.value })}
                    placeholder="Type custom Madinah ziyarat (e.g. Well of Salman Farsi, Date Farm)..."
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = form.customMadinahZiyaratText.trim();
                        if (val && !form.selectedMadinahZiyarat.includes(val)) {
                          setForm((prev) => ({
                            ...prev,
                            selectedMadinahZiyarat: [...prev.selectedMadinahZiyarat, val],
                            customMadinahZiyaratText: "",
                          }));
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = form.customMadinahZiyaratText.trim();
                      if (val && !form.selectedMadinahZiyarat.includes(val)) {
                        setForm((prev) => ({
                          ...prev,
                          selectedMadinahZiyarat: [...prev.selectedMadinahZiyarat, val],
                          customMadinahZiyaratText: "",
                        }));
                      }
                    }}
                    className="px-3.5 py-2 bg-gold-900/70 hover:bg-gold-800 border border-gold-500/50 text-gold-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Landmark</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Final Live Summary Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-forest-950/90 to-slate-950 border border-gold-500/30 text-xs space-y-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-gold-400 font-bold uppercase tracking-wider text-[11px]">
                  Package Summary Verification
                </span>
                <span className="text-white font-mono font-bold text-sm text-emerald-400">
                  From ₹{form.basePrice.toLocaleString("en-IN")}
                </span>
              </div>
              <h4 className="text-base font-serif font-bold text-white">
                {form.name || "Untitled Package"}
              </h4>
              <p className="text-[11px] text-slate-400">
                {form.durationDays} Days ({form.makkahNights}N Makkah • {form.madinahNights}N Madinah) |{" "}
                {form.hasSpecificDates
                  ? `Confirmed: ${form.startDate || "TBA"} - ${form.endDate || "TBA"}`
                  : `Cycle: ${form.departureCycle}`}
              </p>
              <div className="pt-1 flex flex-wrap gap-3 text-[11px] text-slate-400">
                <span>🏨 Makkah: {form.makkahHotelName} ({form.makkahDistance})</span>
                <span>🏨 Madinah: {form.madinahHotelName} ({form.madinahDistance})</span>
                <span>✈️ {form.airline} ({form.flightType})</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Stepper Actions Footer */}
      <div className="bg-slate-950 px-6 sm:px-8 py-4 border-t border-slate-800 flex items-center justify-between shrink-0">
        <div>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Step {currentStep} of 5
          </span>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-gold-500 hover:from-amber-300 hover:to-gold-400 text-xs font-bold text-forest-950 transition-all shadow-md flex items-center gap-1.5"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-xs font-bold text-white transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving Package...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? "Update & Publish Package" : "Create & Publish Package"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
