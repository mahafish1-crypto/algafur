"use client";

import React, { useState } from "react";
import {
  X,
  Save,
  Eye,
  Plus,
  Trash2,
  Calendar,
  Building,
  Plane,
  DollarSign,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Sparkles,
  Info,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  ShieldCheck,
  Upload,
} from "lucide-react";
import MediaPickerModal from "./MediaPickerModal";

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (pkg: any) => void;
  initialPackage?: any | null;
}

export default function PackageFormModal({
  isOpen,
  onClose,
  onSaved,
  initialPackage,
}: PackageFormModalProps) {
  const isEditing = Boolean(initialPackage?.id);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    | "basic"
    | "pricing"
    | "duration"
    | "images"
    | "makkah"
    | "madinah"
    | "flight"
    | "itinerary"
    | "inclusions"
    | "features"
    | "departure"
    | "policies"
    | "seo"
  >("basic");

  // Media Picker state
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string | null>(null);

  // Preview Modal state
  const [showPreview, setShowPreview] = useState(false);

  // Submitting state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: initialPackage?.name || "",
    slug: initialPackage?.slug || "",
    type: initialPackage?.type || "UMRAH",
    badge: initialPackage?.badge || "PLATINUM",
    year: initialPackage?.year || "2026 / 1448 Hijri",
    status: initialPackage?.status || "PUBLISHED",
    isFeatured: initialPackage?.isFeatured ?? true,
    isPopular: initialPackage?.isPopular ?? true,
    sortOrder: initialPackage?.sortOrder || 0,
    overview: initialPackage?.overview || "",

    // Pricing
    basePrice: initialPackage?.basePrice || 120000,
    priceQuad: initialPackage?.priceQuad || 120000,
    priceTriple: initialPackage?.priceTriple || 130000,
    priceDouble: initialPackage?.priceDouble || 145000,
    priceSingle: initialPackage?.priceSingle || 180000,
    childPrice: initialPackage?.childPrice || "",
    infantPrice: initialPackage?.infantPrice || "",
    couplePrice: initialPackage?.couplePrice || "",
    mrpPrice: initialPackage?.mrpPrice || 140000,
    currency: initialPackage?.currency || "INR",
    taxGst: initialPackage?.taxGst || "5% GST included",
    additionalCharges: initialPackage?.additionalCharges || "No hidden extra charges",
    discountType: initialPackage?.discountType || "FIXED",
    discountValue: initialPackage?.discountValue || "",

    // Duration & Dates
    durationDays: initialPackage?.durationDays || 20,
    makkahNights: initialPackage?.makkahNights || 12,
    madinahNights: initialPackage?.madinahNights || 7,
    departureDate: initialPackage?.departureDate || "31 October 2026",
    returnDate: initialPackage?.returnDate || "19 November 2026",
    departureCity: initialPackage?.departureCity || "Mumbai",

    // Media
    featuredImage: initialPackage?.featuredImage || "/brand/poster.jpg",
    heroImage: initialPackage?.heroImage || "/brand/poster.jpg",
    thumbnailImage: initialPackage?.thumbnailImage || "/brand/poster.jpg",
    gallery: initialPackage?.gallery ? (typeof initialPackage.gallery === "string" ? JSON.parse(initialPackage.gallery) : initialPackage.gallery) : [],

    // Makkah Hotel
    makkahHotelName: initialPackage?.makkahHotelName || "Diyafa Jamal or similar",
    makkahDistance: initialPackage?.makkahDistance || "500m walking",
    makkahHotelRating: initialPackage?.makkahHotelRating || 4,
    makkahRoomType: initialPackage?.makkahRoomType || "Quad, Triple, Double available",
    makkahMealPlan: initialPackage?.makkahMealPlan || "Indian Buffet 3 Times Daily (Breakfast, Lunch, Dinner)",
    makkahDescription: initialPackage?.makkahDescription || "Walking route to King Abdulaziz Gate with 24/7 elevators and authentic Indian dining hall.",
    makkahAmenities: initialPackage?.makkahAmenities || "Air Conditioned, High Speed WiFi, Elevators, Indian Buffet, Daily Housekeeping",
    makkahImage: initialPackage?.makkahImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",

    // Madinah Hotel
    madinahHotelName: initialPackage?.madinahHotelName || "Ilaf Kuba or similar",
    madinahDistance: initialPackage?.madinahDistance || "400m walking",
    madinahHotelRating: initialPackage?.madinahHotelRating || 4,
    madinahRoomType: initialPackage?.madinahRoomType || "Quad, Triple, Double available",
    madinahMealPlan: initialPackage?.madinahMealPlan || "Indian Buffet 3 Times Daily (Breakfast, Lunch, Dinner)",
    madinahDescription: initialPackage?.madinahDescription || "Close to Ladies Entrance with 24-hr front desk and prayer view corridors.",
    madinahAmenities: initialPackage?.madinahAmenities || "Air Conditioned, High Speed WiFi, Close to Ladies Gate, Indian Buffet, 24h Front Desk",
    madinahImage: initialPackage?.madinahImage || "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80",

    // Flight
    airline: initialPackage?.airline || "Saudi Airlines (SV)",
    flightNumber: initialPackage?.flightNumber || "SV-771",
    pnr: initialPackage?.pnr || "ALG9872",
    departureAirport: initialPackage?.departureAirport || "BOM (Mumbai)",
    arrivalAirport: initialPackage?.arrivalAirport || "MED (Madinah)",
    flightType: initialPackage?.flightType || "DIRECT",
    baggage: initialPackage?.baggage || "2x23kg check-in + 7kg cabin",
    flightDetails: initialPackage?.flightDetails || "Direct flight BOM to MED, return JED to BOM with baggage allowance and meal included.",

    // Departure & Seats
    totalSeats: initialPackage?.totalSeats || 45,
    bookedSeats: initialPackage?.bookedSeats || 0,
    registrationDeadline: initialPackage?.registrationDeadline || "15 October 2026",

    // Policies & Terms
    travelRequirements: initialPackage?.travelRequirements || "Original passport valid for minimum 6 months, 2 passport-size white background photographs, PAN card & Aadhaar card copy.",
    termsAndConditions: initialPackage?.termsAndConditions || "₹25,000 advance non-refundable deposit upon booking confirmation. Remaining balance to be cleared 15 days before flight departure. Package cost based on current airfare and forex rates.",
    cancellationPolicy: initialPackage?.cancellationPolicy || "Cancellations 30 days prior: 10% deduction. 15-30 days: 30% deduction. Less than 15 days: Non-refundable.",
    refundPolicy: initialPackage?.refundPolicy || "Refunds processed within 7 business days via direct bank transfer.",
    importantNotes: initialPackage?.importantNotes || "Scholarly guidance by Hafiz Asrar Sahab & Hafiz Sameer Madani throughout the journey.",

    // SEO
    seoTitle: initialPackage?.seoTitle || "",
    seoDescription: initialPackage?.seoDescription || "",
    seoKeywords: initialPackage?.seoKeywords || "Umrah 2026, Mumbai direct flight Umrah, Al-Gafur Umrah package",
    ogImage: initialPackage?.ogImage || "",

    // Features
    features: initialPackage?.features ? (typeof initialPackage.features === "string" ? JSON.parse(initialPackage.features) : initialPackage.features) : [
      "Saudi Direct Flight",
      "Umrah Visa & Insurance",
      "5 Star / 4 Star Hotels Walking Distance",
      "3 Times Indian Buffet Meals",
      "Luxury AC Bus Transport",
      "5 Guided Umrahs with Scholars",
      "Makkah & Madinah Historical Ziyarat",
      "Complimentary 5L Zamzam Can",
      "Free Laundry Service",
      "Al-Gafur Welcome Kit & Shoulder Bags",
    ],

    // Inclusions & Exclusions
    inclusions: initialPackage?.inclusions ? initialPackage.inclusions.filter((i: any) => i.isIncluded) : [
      { title: "Umrah Visa & Medical Insurance", description: "Saudi Tourist / Umrah E-Visa with full health insurance coverage" },
      { title: "Direct Flight Tickets (Return)", description: "Direct flights with 2x23kg baggage allowance" },
      { title: "Makkah & Madinah Hotels", description: "Walking distance 400m-500m stays" },
      { title: "Indian Buffet Meals (3 Times Daily)", description: "Fresh hot breakfast, lunch, and dinner prepared by Indian chefs" },
      { title: "Luxury AC Transportation", description: "Modern buses for airport, Makkah, Madinah, and Jeddah transit" },
      { title: "5 Guided Umrahs with Scholars", description: "Step-by-step rituals guidance by senior scholars" },
      { title: "Complete Holy Ziyarat", description: "Guided tour to Jabal al-Noor, Ghar Thawr, Mina, Arafat, Quba, Uhud" },
      { title: "Zamzam Water (5 Litres)", description: "Official 5-litre packed Zamzam can provided at Jeddah airport" },
      { title: "Free Laundry Facilities", description: "Complimentary laundry service every 3 days" },
      { title: "Al-Gafur Pilgrimage Kit", description: "Shoulder bag, passport pouch, shoe bag, and Umrah guidebook" },
    ],
    exclusions: initialPackage?.inclusions ? initialPackage.inclusions.filter((i: any) => !i.isIncluded) : [
      { title: "Room Service & Personal Expenses", description: "Personal laundry outside package, phone calls, room service" },
      { title: "Excess Baggage Charges", description: "Any baggage exceeding the 46kg airline limit" },
      { title: "Wheelchair Attendant Charges", description: "Personal wheelchair helpers in Haram courtyards" },
    ],

    // Itineraries
    itineraries: initialPackage?.itineraries && initialPackage.itineraries.length > 0 ? initialPackage.itineraries : [
      { dayNumber: 1, title: "Departure from Mumbai & Arrival in Madinah", location: "Madinah", activities: "Assemble at CSIA Mumbai Terminal 2. Board flight. Land at Prince Mohammad Airport Madinah. Check-in at hotel and initial Darood & Salaam at Prophet's Mosque." },
      { dayNumber: 2, title: "Ibadah in Masjid an-Nabawi & Riyazul Jannah", location: "Madinah", activities: "Perform prayers in Masjid an-Nabawi. Group appointment for Rawdah ash-Sharifah (Riyazul Jannah) through Nusuk." },
      { dayNumber: 3, title: "Holy Ziyarat of Madinah Al-Munawwarah", location: "Madinah", activities: "Visit Masjid Quba, Masjid Qiblatayn, Mount Uhud and Shuhada Uhud cemetery, and Seven Mosques." },
      { dayNumber: 7, title: "Ihram Preparation & Departure to Makkah", location: "Transit / Makkah", activities: "Perform Ghusl, put on Ihram at hotel, proceed to Dhul Hulayfah (Bir Ali) for Niyyah of First Umrah. High speed train/AC coach to Makkah. Check-in and perform First Umrah." },
      { dayNumber: 10, title: "Second Umrah via Masjid Aisha (Taneem)", location: "Makkah", activities: "Group departure to Masjid Aisha in Taneem. Tie Ihram and perform 2nd guided Umrah." },
      { dayNumber: 15, title: "Holy Ziyarat of Makkah Al-Mukarramah", location: "Makkah", activities: "Guided ziyarat to Cave of Hira (Jabal an-Nour), Jabal Thawr, Arafat plains, Mina, Muzdalifah, and Jannat al-Mu'alla." },
      { dayNumber: 20, title: "Tawaf al-Wida & Return Flight to Mumbai", location: "Jeddah / Transit", activities: "Perform Farewell Tawaf (Tawaf al-Wida). Luxury coach to King Abdulaziz Airport Jeddah. Receive 5L Zamzam. Return flight to Mumbai." },
    ],
  });

  const availableSeats = Math.max(0, Number(form.totalSeats) - Number(form.bookedSeats));

  const handleTextChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMediaSelected = (url: string) => {
    if (mediaPickerTarget) {
      if (mediaPickerTarget === "featuredImage") handleTextChange("featuredImage", url);
      else if (mediaPickerTarget === "heroImage") handleTextChange("heroImage", url);
      else if (mediaPickerTarget === "thumbnailImage") handleTextChange("thumbnailImage", url);
      else if (mediaPickerTarget === "makkahImage") handleTextChange("makkahImage", url);
      else if (mediaPickerTarget === "madinahImage") handleTextChange("madinahImage", url);
      else if (mediaPickerTarget === "ogImage") handleTextChange("ogImage", url);
      else if (mediaPickerTarget === "gallery") {
        setForm((prev) => ({ ...prev, gallery: [...prev.gallery, url] }));
      }
    }
    setMediaPickerTarget(null);
  };

  // Inclusions & Exclusions helpers
  const addInclusion = () => {
    setForm((prev) => ({
      ...prev,
      inclusions: [...prev.inclusions, { title: "New Included Service", description: "" }],
    }));
  };

  const updateInclusion = (index: number, field: string, val: string) => {
    const list = [...form.inclusions];
    list[index] = { ...list[index], [field]: val };
    setForm((prev) => ({ ...prev, inclusions: list }));
  };

  const removeInclusion = (index: number) => {
    setForm((prev) => ({
      ...prev,
      inclusions: prev.inclusions.filter((_: any, i: number) => i !== index),
    }));
  };

  const addExclusion = () => {
    setForm((prev) => ({
      ...prev,
      exclusions: [...prev.exclusions, { title: "New Excluded Item", description: "" }],
    }));
  };

  const updateExclusion = (index: number, field: string, val: string) => {
    const list = [...form.exclusions];
    list[index] = { ...list[index], [field]: val };
    setForm((prev) => ({ ...prev, exclusions: list }));
  };

  const removeExclusion = (index: number) => {
    setForm((prev) => ({
      ...prev,
      exclusions: prev.exclusions.filter((_: any, i: number) => i !== index),
    }));
  };

  // Itinerary helpers
  const addItineraryDay = () => {
    const nextDay = form.itineraries.length + 1;
    setForm((prev) => ({
      ...prev,
      itineraries: [
        ...prev.itineraries,
        {
          dayNumber: nextDay,
          title: `Day ${nextDay} Schedule`,
          location: "Makkah",
          activities: "Scheduled spiritual activities and prayers.",
        },
      ],
    }));
  };

  const updateItineraryDay = (index: number, field: string, val: any) => {
    const list = [...form.itineraries];
    list[index] = { ...list[index], [field]: val };
    setForm((prev) => ({ ...prev, itineraries: list }));
  };

  const removeItineraryDay = (index: number) => {
    setForm((prev) => ({
      ...prev,
      itineraries: prev.itineraries.filter((_: any, i: number) => i !== index),
    }));
  };

  // Features helpers
  const addFeature = () => {
    const val = prompt("Enter new package feature / amenity:");
    if (val && val.trim()) {
      setForm((prev) => ({ ...prev, features: [...prev.features, val.trim()] }));
    }
  };

  const removeFeature = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_: any, i: number) => i !== idx),
    }));
  };

  // Save handler
  const handleSave = async (statusOverride?: string) => {
    if (!form.name.trim()) {
      setErrorMessage("Package Name is required.");
      setActiveTab("basic");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      ...form,
      status: statusOverride || form.status,
    };

    try {
      const url = isEditing ? `/api/packages/${initialPackage.id}` : "/api/packages";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save package");
      }

      onSaved(data.package);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving package";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: "basic", label: "1. Basic Info" },
    { id: "pricing", label: "2. Pricing" },
    { id: "duration", label: "3. Duration & Dates" },
    { id: "images", label: "4. Images" },
    { id: "makkah", label: "5. Makkah Hotel" },
    { id: "madinah", label: "6. Madinah Hotel" },
    { id: "flight", label: "7. Flight Info" },
    { id: "itinerary", label: "8. Itinerary" },
    { id: "inclusions", label: "9. Inclusions & Exclusions" },
    { id: "features", label: "10. Features & Amenities" },
    { id: "departure", label: "11. Seats & Departure" },
    { id: "policies", label: "12. Policies & Terms" },
    { id: "seo", label: "13. SEO & Meta" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full h-[92vh] shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header Bar */}
        <div className="bg-forest-950 text-white px-6 py-4 flex items-center justify-between border-b border-gold-500/20 flex-shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
              {isEditing ? "Package Editor" : "New Package Builder"}
            </span>
            <h2 className="text-lg font-serif font-bold text-white truncate max-w-md">
              {form.name || "Untitled Tour Package"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="px-3.5 py-1.5 rounded-xl bg-forest-900 border border-gold-500/40 text-gold-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-forest-800 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-1 overflow-x-auto flex-shrink-0 select-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? "bg-forest-950 text-gold-300 shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* TAB 1: BASIC INFO */}
          {activeTab === "basic" && (
            <div className="space-y-5">
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <FileText className="w-5 h-5 text-gold-600" />
                Package Identification &amp; Category
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => {
                      handleTextChange("name", e.target.value);
                      if (!isEditing && !form.slug) {
                        handleTextChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                      }
                    }}
                    placeholder="e.g. Umrah Platinum Package 2026"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    URL Slug * (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => handleTextChange("slug", e.target.value)}
                    placeholder="umrah-platinum-package-2026"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Package Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => handleTextChange("type", e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="UMRAH">Umrah (Standard)</option>
                    <option value="HAJJ">Hajj (1448 Hijri)</option>
                    <option value="RAMADAN_UMRAH">Ramadan Umrah</option>
                    <option value="GROUP">Group Fixed Departure</option>
                    <option value="PRIVATE">Customized Private VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Badge / Tier
                  </label>
                  <select
                    value={form.badge}
                    onChange={(e) => handleTextChange("badge", e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="PLATINUM">PLATINUM</option>
                    <option value="GOLD">GOLD</option>
                    <option value="DELUXE">DELUXE</option>
                    <option value="ECONOMY">ECONOMY</option>
                    <option value="RAMADAN SPECIAL">RAMADAN SPECIAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Season / Year Tag
                  </label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={(e) => handleTextChange("year", e.target.value)}
                    placeholder="2026 / 1448 Hijri"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Overview &amp; Executive Summary
                </label>
                <textarea
                  rows={4}
                  value={form.overview}
                  onChange={(e) => handleTextChange("overview", e.target.value)}
                  placeholder="Complete overview of pilgrimage experience, scholarly companionship, and logistical comfort..."
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => handleTextChange("status", e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="PUBLISHED">Published (Live on Website)</option>
                    <option value="DRAFT">Draft (Admin Only)</option>
                    <option value="ARCHIVED">Archived (Hidden)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={form.isFeatured}
                    onChange={(e) => handleTextChange("isFeatured", e.target.checked)}
                    className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-800">
                    Featured on Homepage
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={form.isPopular}
                    onChange={(e) => handleTextChange("isPopular", e.target.checked)}
                    className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500"
                  />
                  <label htmlFor="isPopular" className="text-xs font-semibold text-slate-800">
                    High Demand / Popular
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING */}
          {activeTab === "pricing" && (
            <div className="space-y-5">
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <DollarSign className="w-5 h-5 text-gold-600" />
                Room Sharing &amp; Pilgrim Pricing Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Quad Sharing (Base) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      value={form.priceQuad}
                      onChange={(e) => {
                        handleTextChange("priceQuad", e.target.value);
                        handleTextChange("basePrice", e.target.value);
                      }}
                      className="w-full text-sm pl-7 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Triple Sharing
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      value={form.priceTriple}
                      onChange={(e) => handleTextChange("priceTriple", e.target.value)}
                      className="w-full text-sm pl-7 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Double Sharing
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      value={form.priceDouble}
                      onChange={(e) => handleTextChange("priceDouble", e.target.value)}
                      className="w-full text-sm pl-7 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Single Room
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      value={form.priceSingle}
                      onChange={(e) => handleTextChange("priceSingle", e.target.value)}
                      className="w-full text-sm pl-7 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Child with Bed
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      value={form.childPrice}
                      onChange={(e) => handleTextChange("childPrice", e.target.value)}
                      placeholder="e.g. 100000"
                      className="w-full text-sm pl-7 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Infant Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      value={form.infantPrice}
                      onChange={(e) => handleTextChange("infantPrice", e.target.value)}
                      placeholder="e.g. 35000"
                      className="w-full text-sm pl-7 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Original / MRP Price (Crossed out)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      value={form.mrpPrice}
                      onChange={(e) => handleTextChange("mrpPrice", e.target.value)}
                      placeholder="e.g. 140000"
                      className="w-full text-sm pl-7 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Tax / GST Note
                  </label>
                  <input
                    type="text"
                    value={form.taxGst}
                    onChange={(e) => handleTextChange("taxGst", e.target.value)}
                    placeholder="5% GST included in base price"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Additional Charges Note
                  </label>
                  <input
                    type="text"
                    value={form.additionalCharges}
                    onChange={(e) => handleTextChange("additionalCharges", e.target.value)}
                    placeholder="TCS optional with Form 27C, zero hidden charges"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DURATION & DATES */}
          {activeTab === "duration" && (
            <div className="space-y-5">
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <Clock className="w-5 h-5 text-gold-600" />
                Duration, Nights &amp; Flight Dates
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Total Duration (Days) *
                  </label>
                  <input
                    type="number"
                    value={form.durationDays}
                    onChange={(e) => handleTextChange("durationDays", e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Makkah Nights *
                  </label>
                  <input
                    type="number"
                    value={form.makkahNights}
                    onChange={(e) => handleTextChange("makkahNights", e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Madinah Nights *
                  </label>
                  <input
                    type="number"
                    value={form.madinahNights}
                    onChange={(e) => handleTextChange("madinahNights", e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Departure Date *
                  </label>
                  <input
                    type="text"
                    value={form.departureDate}
                    onChange={(e) => handleTextChange("departureDate", e.target.value)}
                    placeholder="31 October 2026"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Return Date *
                  </label>
                  <input
                    type="text"
                    value={form.returnDate}
                    onChange={(e) => handleTextChange("returnDate", e.target.value)}
                    placeholder="19 November 2026"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Departure City / Hub
                  </label>
                  <input
                    type="text"
                    value={form.departureCity}
                    onChange={(e) => handleTextChange("departureCity", e.target.value)}
                    placeholder="Mumbai (BOM)"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IMAGES */}
          {activeTab === "images" && (
            <div className="space-y-5">
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <ImageIcon className="w-5 h-5 text-gold-600" />
                Visual Assets &amp; Poster Media
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Package Image */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase">
                      Main Poster / Featured Image *
                    </label>
                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget("featuredImage")}
                      className="text-xs font-semibold text-gold-700 hover:text-gold-900 underline flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" /> Select from Library
                    </button>
                  </div>
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-200 border flex items-center justify-center">
                    {form.featuredImage ? (
                      <img src={form.featuredImage} alt="Featured" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">No image selected</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={form.featuredImage}
                    onChange={(e) => handleTextChange("featuredImage", e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-900"
                    placeholder="/brand/poster.jpg"
                  />
                </div>

                {/* Hero Banner Image */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase">
                      Hero Banner Image
                    </label>
                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget("heroImage")}
                      className="text-xs font-semibold text-gold-700 hover:text-gold-900 underline flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" /> Select from Library
                    </button>
                  </div>
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-200 border flex items-center justify-center">
                    {form.heroImage ? (
                      <img src={form.heroImage} alt="Hero" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">No image selected</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={form.heroImage}
                    onChange={(e) => handleTextChange("heroImage", e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-900"
                    placeholder="/brand/poster.jpg"
                  />
                </div>
              </div>

              {/* Gallery Images List */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase">
                    Photo Gallery Images ({form.gallery.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("gallery")}
                    className="text-xs font-semibold text-gold-700 hover:text-gold-900 underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add Gallery Photo
                  </button>
                </div>

                {form.gallery.length === 0 ? (
                  <p className="text-xs text-slate-400">No gallery images added yet.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {form.gallery.map((url: string, idx: number) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border bg-slate-200">
                        <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              gallery: prev.gallery.filter((_: any, i: number) => i !== idx),
                            }));
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: MAKKAH HOTEL */}
          {activeTab === "makkah" && (
            <div className="space-y-5">
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <Building className="w-5 h-5 text-gold-600" />
                Makkah Al-Mukarramah Accommodation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Hotel Name *
                  </label>
                  <input
                    type="text"
                    value={form.makkahHotelName}
                    onChange={(e) => handleTextChange("makkahHotelName", e.target.value)}
                    placeholder="Diyafa Jamal or similar"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Distance from Haram *
                  </label>
                  <input
                    type="text"
                    value={form.makkahDistance}
                    onChange={(e) => handleTextChange("makkahDistance", e.target.value)}
                    placeholder="500m walking"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Star Rating
                  </label>
                  <select
                    value={form.makkahHotelRating}
                    onChange={(e) => handleTextChange("makkahHotelRating", parseInt(e.target.value))}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="5">5 Star Luxury</option>
                    <option value="4">4 Star Premium</option>
                    <option value="3">3 Star Standard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Room Types
                  </label>
                  <input
                    type="text"
                    value={form.makkahRoomType}
                    onChange={(e) => handleTextChange("makkahRoomType", e.target.value)}
                    placeholder="Quad, Triple, Double available"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Meal Plan
                  </label>
                  <input
                    type="text"
                    value={form.makkahMealPlan}
                    onChange={(e) => handleTextChange("makkahMealPlan", e.target.value)}
                    placeholder="Indian Buffet 3 Times Daily (Breakfast, Lunch, Dinner)"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Hotel Description
                </label>
                <textarea
                  rows={2}
                  value={form.makkahDescription}
                  onChange={(e) => handleTextChange("makkahDescription", e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Makkah Hotel Image
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("makkahImage")}
                    className="text-xs font-semibold text-gold-700 underline"
                  >
                    Select from Media Library
                  </button>
                </div>
                <input
                  type="text"
                  value={form.makkahImage}
                  onChange={(e) => handleTextChange("makkahImage", e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                />
              </div>
            </div>
          )}

          {/* TAB 6: MADINAH HOTEL */}
          {activeTab === "madinah" && (
            <div className="space-y-5">
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <Building className="w-5 h-5 text-gold-600" />
                Madinah Al-Munawwarah Accommodation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Hotel Name *
                  </label>
                  <input
                    type="text"
                    value={form.madinahHotelName}
                    onChange={(e) => handleTextChange("madinahHotelName", e.target.value)}
                    placeholder="Ilaf Kuba or similar"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Distance from Prophet&apos;s Mosque *
                  </label>
                  <input
                    type="text"
                    value={form.madinahDistance}
                    onChange={(e) => handleTextChange("madinahDistance", e.target.value)}
                    placeholder="400m walking"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Star Rating
                  </label>
                  <select
                    value={form.madinahHotelRating}
                    onChange={(e) => handleTextChange("madinahHotelRating", parseInt(e.target.value))}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="5">5 Star Luxury</option>
                    <option value="4">4 Star Premium</option>
                    <option value="3">3 Star Standard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Room Types
                  </label>
                  <input
                    type="text"
                    value={form.madinahRoomType}
                    onChange={(e) => handleTextChange("madinahRoomType", e.target.value)}
                    placeholder="Quad, Triple, Double available"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Meal Plan
                  </label>
                  <input
                    type="text"
                    value={form.madinahMealPlan}
                    onChange={(e) => handleTextChange("madinahMealPlan", e.target.value)}
                    placeholder="Indian Buffet 3 Times Daily (Breakfast, Lunch, Dinner)"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Hotel Description
                </label>
                <textarea
                  rows={2}
                  value={form.madinahDescription}
                  onChange={(e) => handleTextChange("madinahDescription", e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Madinah Hotel Image
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("madinahImage")}
                    className="text-xs font-semibold text-gold-700 underline"
                  >
                    Select from Media Library
                  </button>
                </div>
                <input
                  type="text"
                  value={form.madinahImage}
                  onChange={(e) => handleTextChange("madinahImage", e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                />
              </div>
            </div>
          )}

          {/* TAB 7: FLIGHT INFO */}
          {activeTab === "flight" && (
            <div className="space-y-5">
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <Plane className="w-5 h-5 text-gold-600" />
                Flight Specifications &amp; Airlines
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Airline *
                  </label>
                  <input
                    type="text"
                    value={form.airline}
                    onChange={(e) => handleTextChange("airline", e.target.value)}
                    placeholder="Saudi Airlines (SV)"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    value={form.flightNumber}
                    onChange={(e) => handleTextChange("flightNumber", e.target.value)}
                    placeholder="SV-771"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 font-mono focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    PNR
                  </label>
                  <input
                    type="text"
                    value={form.pnr}
                    onChange={(e) => handleTextChange("pnr", e.target.value)}
                    placeholder="ALG9872"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 font-mono focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Departure Airport
                  </label>
                  <input
                    type="text"
                    value={form.departureAirport}
                    onChange={(e) => handleTextChange("departureAirport", e.target.value)}
                    placeholder="BOM (Mumbai)"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Arrival Airport
                  </label>
                  <input
                    type="text"
                    value={form.arrivalAirport}
                    onChange={(e) => handleTextChange("arrivalAirport", e.target.value)}
                    placeholder="MED (Madinah)"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Flight Routing
                  </label>
                  <select
                    value={form.flightType}
                    onChange={(e) => handleTextChange("flightType", e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="DIRECT">Direct Non-Stop</option>
                    <option value="CONNECTING">Connecting 1-Stop</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Baggage Allowance
                  </label>
                  <input
                    type="text"
                    value={form.baggage}
                    onChange={(e) => handleTextChange("baggage", e.target.value)}
                    placeholder="2x23kg check-in + 7kg cabin"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Flight Description &amp; Routing
                  </label>
                  <input
                    type="text"
                    value={form.flightDetails}
                    onChange={(e) => handleTextChange("flightDetails", e.target.value)}
                    placeholder="Direct Saudi Airlines BOM to MED, return JED to BOM"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ITINERARY */}
          {activeTab === "itinerary" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold-600" />
                  Day-by-Day Pilgrimage Timeline ({form.itineraries.length} Days)
                </h3>
                <button
                  type="button"
                  onClick={addItineraryDay}
                  className="px-3.5 py-1.5 rounded-xl bg-forest-950 text-gold-300 font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add Day
                </button>
              </div>

              <div className="space-y-4">
                {form.itineraries.map((day: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-gold-500 text-forest-950 text-xs font-extrabold">
                          Day {day.dayNumber || idx + 1}
                        </span>
                        <input
                          type="text"
                          value={day.location || "Makkah"}
                          onChange={(e) => updateItineraryDay(idx, "location", e.target.value)}
                          placeholder="City / Station"
                          className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItineraryDay(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => updateItineraryDay(idx, "title", e.target.value)}
                      placeholder="Day Title"
                      className="w-full text-sm font-semibold rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-900"
                    />

                    <textarea
                      rows={2}
                      value={day.activities}
                      onChange={(e) => updateItineraryDay(idx, "activities", e.target.value)}
                      placeholder="Detailed schedule of prayers, historical visits, and rituals..."
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-900 leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: INCLUSIONS & EXCLUSIONS */}
          {activeTab === "inclusions" && (
            <div className="space-y-6">
              {/* Inclusions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Included Services ({form.inclusions.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addInclusion}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add Inclusion
                  </button>
                </div>

                <div className="space-y-2">
                  {form.inclusions.map((inc: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <input
                        type="text"
                        value={inc.title}
                        onChange={(e) => updateInclusion(idx, "title", e.target.value)}
                        placeholder="Inclusion Title"
                        className="flex-1 text-xs font-semibold rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-900"
                      />
                      <input
                        type="text"
                        value={inc.description || ""}
                        onChange={(e) => updateInclusion(idx, "description", e.target.value)}
                        placeholder="Description (Optional)"
                        className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => removeInclusion(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-bold text-red-800 uppercase flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Excluded Services ({form.exclusions.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addExclusion}
                    className="text-xs font-bold text-red-700 hover:text-red-900 underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add Exclusion
                  </button>
                </div>

                <div className="space-y-2">
                  {form.exclusions.map((exc: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={exc.title}
                        onChange={(e) => updateExclusion(idx, "title", e.target.value)}
                        placeholder="Exclusion Title"
                        className="flex-1 text-xs font-semibold rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-900"
                      />
                      <input
                        type="text"
                        value={exc.description || ""}
                        onChange={(e) => updateExclusion(idx, "description", e.target.value)}
                        placeholder="Description (Optional)"
                        className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => removeExclusion(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: FEATURES & AMENITIES */}
          {activeTab === "features" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold-600" />
                  Key Highlights &amp; Amenities Tags
                </h3>
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-3 py-1.5 rounded-lg bg-forest-950 text-gold-300 font-bold text-xs"
                >
                  + Add Feature
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.features.map((feat: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-900 text-gold-300 text-xs font-semibold"
                  >
                    <span>✓ {feat}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      className="text-gold-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: SEATS & DEPARTURE */}
          {activeTab === "departure" && (
            <div className="space-y-5">
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <Users className="w-5 h-5 text-gold-600" />
                Seat Capacity &amp; Registration Deadline
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Total Capacity (Seats) *
                  </label>
                  <input
                    type="number"
                    value={form.totalSeats}
                    onChange={(e) => handleTextChange("totalSeats", Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Booked Seats
                  </label>
                  <input
                    type="number"
                    value={form.bookedSeats}
                    onChange={(e) => handleTextChange("bookedSeats", Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Available Remaining (Auto)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={availableSeats}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-slate-100 text-emerald-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Registration Deadline
                </label>
                <input
                  type="text"
                  value={form.registrationDeadline}
                  onChange={(e) => handleTextChange("registrationDeadline", e.target.value)}
                  placeholder="15 October 2026"
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
          )}

          {/* TAB 12: POLICIES & TERMS */}
          {activeTab === "policies" && (
            <div className="space-y-5">
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <FileText className="w-5 h-5 text-gold-600" />
                Pilgrim Requirements &amp; Commercial Terms
              </h3>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Documents Required / Travel Requirements
                </label>
                <textarea
                  rows={3}
                  value={form.travelRequirements}
                  onChange={(e) => handleTextChange("travelRequirements", e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Terms &amp; Payment Conditions
                </label>
                <textarea
                  rows={3}
                  value={form.termsAndConditions}
                  onChange={(e) => handleTextChange("termsAndConditions", e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Cancellation Policy
                  </label>
                  <textarea
                    rows={2}
                    value={form.cancellationPolicy}
                    onChange={(e) => handleTextChange("cancellationPolicy", e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Refund Policy
                  </label>
                  <textarea
                    rows={2}
                    value={form.refundPolicy}
                    onChange={(e) => handleTextChange("refundPolicy", e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: SEO */}
          {activeTab === "seo" && (
            <div className="space-y-5">
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <Search className="w-5 h-5 text-gold-600" />
                SEO Search Engine Optimization
              </h3>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(e) => handleTextChange("seoTitle", e.target.value)}
                  placeholder="e.g. Umrah Platinum Package 2026 | Al-Gafur International Tours"
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  SEO Meta Description
                </label>
                <textarea
                  rows={3}
                  value={form.seoDescription}
                  onChange={(e) => handleTextChange("seoDescription", e.target.value)}
                  placeholder="Premium Umrah package from Mumbai with walking distance hotels, scholar guidance, and direct flights."
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Target SEO Keywords (Comma separated)
                </label>
                <input
                  type="text"
                  value={form.seoKeywords}
                  onChange={(e) => handleTextChange("seoKeywords", e.target.value)}
                  placeholder="Umrah 2026, Mumbai direct Umrah, Al-Gafur Tours"
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Status: <strong>{form.status}</strong></span>
            <span>&bull;</span>
            <span>Available Seats: <strong className="text-emerald-700">{availableSeats}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSave("DRAFT")}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSave("PUBLISHED")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-forest-950 font-extrabold text-xs shadow-gold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Saving Package..." : isEditing ? "Save & Publish Changes" : "Create & Publish Package"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={Boolean(mediaPickerTarget)}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={handleMediaSelected}
        title="Select Media Asset"
      />

      {/* Interactive Package Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6">
          <div className="bg-ivory-100 rounded-3xl max-w-5xl w-full h-[90vh] overflow-y-auto shadow-2xl relative border border-gold-500/40">
            <div className="sticky top-0 z-30 bg-forest-950 px-6 py-3 flex items-center justify-between text-white border-b border-gold-500/30">
              <span className="text-xs font-bold text-gold-300">Live Package Preview Mode</span>
              <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Package Detail Page */}
            <div className="p-6 sm:p-10 space-y-8">
              {/* Top Banner */}
              <div className="bg-forest-950 text-white p-8 rounded-3xl space-y-4">
                <div className="flex gap-2">
                  <span className="bg-gold-500 text-forest-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                    {form.badge}
                  </span>
                  <span className="bg-forest-900 text-gold-300 text-xs px-2.5 py-0.5 rounded border border-gold-500/30">
                    {form.year}
                  </span>
                  <span className="bg-emerald-900/60 text-emerald-200 text-xs px-2.5 py-0.5 rounded">
                    {form.departureCity} Direct Flight
                  </span>
                </div>
                <h1 className="text-3xl font-serif font-bold text-white">{form.name}</h1>
                <div className="flex flex-wrap gap-4 text-xs text-emerald-100">
                  <span>Departure: <strong>{form.departureDate}</strong></span>
                  <span>Duration: <strong>{form.durationDays} Days ({form.makkahNights}N Makkah / {form.madinahNights}N Madinah)</strong></span>
                  <span className="text-amber-300 font-bold">{availableSeats} Seats Available</span>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Image */}
                  <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-200">
                    <img src={form.featuredImage} alt={form.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Overview */}
                  <div className="bg-white p-6 rounded-2xl border space-y-2">
                    <h3 className="font-serif font-bold text-forest-950">Package Overview</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{form.overview}</p>
                  </div>

                  {/* Hotels */}
                  <div className="bg-white p-6 rounded-2xl border space-y-4">
                    <h3 className="font-serif font-bold text-forest-950">Hotel Accommodations</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase">Makkah Al-Mukarramah</span>
                        <h4 className="text-sm font-bold text-slate-900">{form.makkahHotelName}</h4>
                        <p className="text-xs text-slate-600">{form.makkahDistance} to Haram</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase">Madinah Al-Munawwarah</span>
                        <h4 className="text-sm font-bold text-slate-900">{form.madinahHotelName}</h4>
                        <p className="text-xs text-slate-600">{form.madinahDistance} to Prophet&apos;s Mosque</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Sidebar */}
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-2xl border border-gold-500/40 shadow-md space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Starting Price</span>
                    <div className="text-3xl font-serif font-bold text-forest-950">
                      ₹{Number(form.basePrice).toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-slate-500"> / pilgrim</span>
                    </div>
                    {form.mrpPrice && (
                      <div className="text-xs text-slate-400 line-through">
                        MRP: ₹{Number(form.mrpPrice).toLocaleString("en-IN")}
                      </div>
                    )}
                    <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-semibold">
                      {availableSeats} seats left out of {form.totalSeats}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

