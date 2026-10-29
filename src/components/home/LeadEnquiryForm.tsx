"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  BedDouble,
  Compass,
  FileText,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { trackMetaLead } from "@/lib/meta-pixel-events";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export interface PackageOption {
  id: string;
  name: string;
  slug?: string;
  type?: string;
}

interface LeadEnquiryFormProps {
  defaultPackage?: string;
  defaultPackageId?: string;
  packages?: PackageOption[];
  settings?: Record<string, string>;
  sourcePage?: string;
}

const FALLBACK_PACKAGES: PackageOption[] = [
  { id: "pkg-platinum", name: "Umrah Platinum Package (20 Days)" },
  { id: "pkg-super-deluxe", name: "Umrah Super Deluxe Package (15 Days)" },
  { id: "pkg-standard", name: "Umrah Standard Package (15 Days)" },
  { id: "pkg-ramadan", name: "Ramadan Blessed Last 15 Days" },
  { id: "pkg-economy", name: "Umrah Classic Economy (15 Days)" },
  { id: "pkg-custom", name: "Customized Private Family Umrah" },
];

const TRAVEL_TIME_OPTIONS = [
  { value: "", label: "Select your preferred travel time" },
  { value: "Upcoming Umrah Season (Next Available Group)", label: "Upcoming Umrah Season (Next Available Group)" },
  { value: "Ramadan 1448 / 2027 (Full Month / 15 Days)", label: "Ramadan 1448 / 2027 (Full Month / 15 Days)" },
  { value: "Hajj 1448 / 2027 Priority Allotment", label: "Hajj 1448 / 2027 Priority Allotment" },
  { value: "Post-Ramadan / Shawwal 1448", label: "Post-Ramadan / Shawwal 1448" },
  { value: "Autumn / Winter 2026-2027", label: "Autumn / Winter 2026-2027" },
  { value: "Custom Travel Dates (Specify in Notes)", label: "Custom Travel Dates (Specify in Notes)" },
];

const ROOM_OPTIONS = [
  { value: "QUAD", label: "Quad Sharing (4 Beds in Room)" },
  { value: "TRIPLE", label: "Triple Sharing (3 Beds in Room)" },
  { value: "DOUBLE", label: "Double Sharing (2 Beds in Room)" },
  { value: "CUSTOM", label: "Private Family Suite / Special Request" },
];

const CONTACT_METHODS = [
  { id: "WHATSAPP", label: "WhatsApp", icon: MessageCircle },
  { id: "CALL", label: "Phone Call", icon: Phone },
  { id: "EMAIL", label: "Email", icon: Mail },
];

export default function LeadEnquiryForm({
  defaultPackage,
  defaultPackageId,
  packages = [],
  settings = {},
  sourcePage,
}: LeadEnquiryFormProps) {
  const { t, language } = useLanguage();

  const packageOptions: PackageOption[] =
    packages.length > 0 ? packages : FALLBACK_PACKAGES;

  const initialPackageInterest =
    defaultPackage || packageOptions[0]?.name || "Umrah Platinum Package (20 Days)";

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    whatsapp: "",
    email: "",
    city: "",
    journeyType: "UMRAH",
    packageInterest: initialPackageInterest,
    packageId: defaultPackageId || "",
    travelDate: "",
    adults: 2,
    children: 0,
    roomPreference: "QUAD",
    preferredContact: "WHATSAPP",
    budget: "",
    message: "",
    consentAccepted: false,
    website_url: "", // Honeypot field
  });

  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [leadNumber, setLeadNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFirstInteraction = () => {
    if (!started) {
      setStarted(true);
      const matchedPkg = packageOptions.find((p) => p.name === formData.packageInterest);
      trackAnalyticsEvent({
        eventType: "INQUIRY_START",
        packageId: matchedPkg?.id || defaultPackageId,
        packageSlug: matchedPkg?.slug,
        packageTitle: formData.packageInterest,
        sourcePage,
        language,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const trimmedName = formData.name.trim();
    if (trimmedName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    const digitsOnly = formData.mobile.replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      setError("Please enter a valid 10 to 15 digit mobile number.");
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!formData.city.trim()) {
      setError("Please enter your city / town.");
      return;
    }

    if (!formData.consentAccepted) {
      setError("Please accept the Privacy Policy and User Agreement to submit your enquiry.");
      return;
    }

    setLoading(true);

    try {
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const utmSource = urlParams?.get("utm_source") || "Website";
      const utmMedium = urlParams?.get("utm_medium") || "Direct";
      const utmCampaign = urlParams?.get("utm_campaign") || undefined;
      const currentPath = sourcePage || (typeof window !== "undefined" ? window.location.pathname : "/");
      const matchedPkg = packageOptions.find((p) => p.name === formData.packageInterest);

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          packageId: matchedPkg?.id || defaultPackageId || undefined,
          sourcePage: currentPath,
          language,
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry. Please try again.");
      }

      trackAnalyticsEvent({
        eventType: "INQUIRY_SUBMIT",
        packageId: matchedPkg?.id || defaultPackageId,
        packageSlug: matchedPkg?.slug,
        packageTitle: formData.packageInterest,
        sourcePage: currentPath,
        language,
        metadata: { leadNumber: data.leadNumber },
      });

      trackMetaLead({
        leadType: "website_enquiry",
        packageName: formData.packageInterest,
      });

      setSuccess(true);
      setLeadNumber(data.leadNumber || "AGF-CONFIRMED");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong while submitting. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const whatsappNum = settings.whatsapp_number || "919890708013";
  const whatsappHref = buildWhatsAppLink(
    whatsappNum,
    `Assalamualaikum, my enquiry reference is ${leadNumber || "Pending"} for ${formData.packageInterest}. Please share details.`
  );

  return (
    <section id="lead-form" className="py-20 bg-forest-950 text-white relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-forest-950 to-forest-950 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="bg-forest-900/90 rounded-3xl p-6 sm:p-10 lg:p-12 border border-gold-500/30 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-950 border border-gold-500/30 text-gold-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>{t("form_badge", "PERSONALIZED PILGRIMAGE ASSISTANCE")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              {t("form_title", "Plan Your Hajj or Umrah Journey")}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-2.5 leading-relaxed">
              {t("form_sub", "Share your travel preferences and our experienced advisors will contact you with complete package details and verified seat availability.")}
            </p>
          </div>

          {success ? (
            /* Success confirmation card */
            <div
              role="status"
              aria-live="polite"
              className="bg-forest-950/90 p-8 sm:p-10 rounded-2xl border border-emerald-500/50 text-center space-y-5 animate-scaleUp shadow-xl"
            >
              <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {t("form_success_title", "Enquiry Submitted Successfully!")}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/80 max-w-lg mx-auto leading-relaxed">
                  JazakAllah Khair! Your official pilgrimage enquiry reference is:
                </p>
                <div className="inline-block mt-2 px-4 py-2 bg-forest-900 border border-gold-500/40 rounded-xl text-gold-300 font-mono text-base font-bold tracking-wider">
                  {leadNumber}
                </div>
              </div>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Our senior pilgrimage advisor will contact you by phone or WhatsApp within business hours with complete departure schedules and pricing.
              </p>
              <div className="pt-3 flex flex-wrap justify-center gap-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat Directly on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setFormData({
                      name: "",
                      mobile: "",
                      whatsapp: "",
                      email: "",
                      city: "",
                      journeyType: "UMRAH",
                      packageInterest: initialPackageInterest,
                      packageId: defaultPackageId || "",
                      travelDate: "",
                      adults: 2,
                      children: 0,
                      roomPreference: "QUAD",
                      preferredContact: "WHATSAPP",
                      budget: "",
                      message: "",
                      consentAccepted: false,
                      website_url: "",
                    });
                  }}
                  className="inline-flex items-center gap-2 border border-gold-500/40 hover:bg-forest-900 text-gold-300 text-xs font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Submit Another Enquiry
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              onFocus={handleFirstInteraction}
              className="space-y-6"
              noValidate
            >
              {error && (
                <div
                  role="alert"
                  className="p-4 bg-red-950/80 border border-red-500/60 text-red-200 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 shadow-md"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Honeypot field hidden from real visitors */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="lead-website-url">Website URL</label>
                <input
                  id="lead-website-url"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                />
              </div>

              {/* SECTION 1: Pilgrim Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-emerald-900/60 pb-2">
                  <User className="w-4 h-4 text-gold-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gold-300">
                    1. Pilgrim Contact Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="lead-name" className="flex items-center justify-between text-xs font-semibold text-emerald-100 mb-1.5">
                      <span>{t("form_full_name", "Full Name")} <span className="text-gold-400">*</span></span>
                      <span className="text-[10px] text-emerald-400/60 uppercase font-normal">Required</span>
                    </label>
                    <input
                      id="lead-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Haji Nizam Tamboli"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-forest-950/90 border border-emerald-800/70 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none text-white placeholder-emerald-600/70 transition-all"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="lead-mobile" className="flex items-center justify-between text-xs font-semibold text-emerald-100 mb-1.5">
                      <span>{t("form_mobile", "Mobile Number")} <span className="text-gold-400">*</span></span>
                      <span className="text-[10px] text-emerald-400/60 uppercase font-normal">Required</span>
                    </label>
                    <input
                      id="lead-mobile"
                      type="tel"
                      inputMode="tel"
                      required
                      autoComplete="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="e.g. +91 9890708013"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-forest-950/90 border border-emerald-800/70 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none text-white placeholder-emerald-600/70 transition-all"
                    />
                  </div>

                  {/* WhatsApp Number (Optional) */}
                  <div>
                    <label htmlFor="lead-whatsapp" className="flex items-center justify-between text-xs font-semibold text-emerald-100 mb-1.5">
                      <span>{t("form_whatsapp", "WhatsApp Number (Optional)")}</span>
                      <span className="text-[10px] text-emerald-400/60 uppercase font-normal">Optional</span>
                    </label>
                    <input
                      id="lead-whatsapp"
                      type="tel"
                      inputMode="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="Same as mobile or enter different"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-forest-950/90 border border-emerald-800/70 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none text-white placeholder-emerald-600/70 transition-all"
                    />
                  </div>

                  {/* Email Address (Optional) */}
                  <div>
                    <label htmlFor="lead-email" className="flex items-center justify-between text-xs font-semibold text-emerald-100 mb-1.5">
                      <span>{t("form_email", "Email Address (Optional)")}</span>
                      <span className="text-[10px] text-emerald-400/60 uppercase font-normal">Optional</span>
                    </label>
                    <input
                      id="lead-email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. name@example.com"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-forest-950/90 border border-emerald-800/70 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none text-white placeholder-emerald-600/70 transition-all"
                    />
                  </div>

                  {/* City / Town */}
                  <div className="md:col-span-2">
                    <label htmlFor="lead-city" className="flex items-center justify-between text-xs font-semibold text-emerald-100 mb-1.5">
                      <span>{t("form_city", "City / Town")} <span className="text-gold-400">*</span></span>
                      <span className="text-[10px] text-emerald-400/60 uppercase font-normal">Required</span>
                    </label>
                    <input
                      id="lead-city"
                      type="text"
                      required
                      autoComplete="address-level2"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Enter your city or district (e.g. Pune, Mumbai, Aurangabad, Ahmednagar)"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-forest-950/90 border border-emerald-800/70 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none text-white placeholder-emerald-600/70 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Travel & Pilgrimage Preferences */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-emerald-900/60 pb-2">
                  <Compass className="w-4 h-4 text-gold-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gold-300">
                    2. Pilgrimage &amp; Room Preferences
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Package Interest */}
                  <div>
                    <label htmlFor="lead-package" className="block text-xs font-semibold text-emerald-100 mb-1.5">
                      {t("form_package", "Interested Package")}
                    </label>
                    <select
                      id="lead-package"
                      value={formData.packageInterest}
                      onChange={(e) => setFormData({ ...formData, packageInterest: e.target.value })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-forest-950/90 border border-emerald-800/70 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none text-white"
                    >
                      {packageOptions.map((opt) => (
                        <option key={opt.id || opt.name} value={opt.name} className="bg-forest-950 text-white">
                          {opt.name}
                        </option>
                      ))}
                      {!packageOptions.some((o) => o.name === "Customized Private Family Umrah") && (
                        <option value="Customized Private Family Umrah" className="bg-forest-950 text-white">
                          Customized Private Family Umrah
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Travel Time */}
                  <div>
                    <label htmlFor="lead-travel-date" className="block text-xs font-semibold text-emerald-100 mb-1.5">
                      {t("form_travel_month", "Preferred Travel Time")}
                    </label>
                    <select
                      id="lead-travel-date"
                      value={formData.travelDate}
                      onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-forest-950/90 border border-emerald-800/70 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none text-white"
                    >
                      {TRAVEL_TIME_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-forest-950 text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Room Preference */}
                  <div>
                    <label htmlFor="lead-room-pref" className="block text-xs font-semibold text-emerald-100 mb-1.5">
                      {t("form_room_pref", "Room Preference")}
                    </label>
                    <select
                      id="lead-room-pref"
                      value={formData.roomPreference}
                      onChange={(e) => setFormData({ ...formData, roomPreference: e.target.value })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-forest-950/90 border border-emerald-800/70 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none text-white"
                    >
                      {ROOM_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-forest-950 text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Adults and Children Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="lead-adults" className="block text-xs font-semibold text-emerald-100 mb-1.5">
                        {t("form_adults", "Number of Adults (12+ Yrs)")}
                      </label>
                      <input
                        id="lead-adults"
                        type="number"
                        min="1"
                        max="50"
                        value={formData.adults}
                        onChange={(e) => setFormData({ ...formData, adults: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                        className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl bg-forest-950/90 border border-emerald-800/70 focus:border-gold-400 focus:outline-none text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="lead-children" className="block text-xs font-semibold text-emerald-100 mb-1.5">
                        {t("form_children", "Children (Under 12 Yrs)")}
                      </label>
                      <input
                        id="lead-children"
                        type="number"
                        min="0"
                        max="20"
                        value={formData.children}
                        onChange={(e) => setFormData({ ...formData, children: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl bg-forest-950/90 border border-emerald-800/70 focus:border-gold-400 focus:outline-none text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferred Contact Method */}
                <div className="pt-1">
                  <span className="block text-xs font-semibold text-emerald-100 mb-2">
                    {t("form_preferred_contact", "Preferred Contact Method")}
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {CONTACT_METHODS.map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = formData.preferredContact === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, preferredContact: mode.id })}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-gold-500 text-forest-950 border-gold-400 shadow-md font-bold"
                              : "bg-forest-950/80 text-emerald-100 border-emerald-800/70 hover:border-gold-500/40 hover:bg-forest-950"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Special Requests / Notes */}
              <div className="space-y-2 pt-2">
                <label htmlFor="lead-message" className="block text-xs font-semibold text-emerald-100">
                  {t("form_notes", "Special Requests / Notes")}
                </label>
                <textarea
                  id="lead-message"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share any special preferences for room types, wheelchair assistance, airline preference, or elderly care..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-forest-950/90 border border-emerald-800/70 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none text-white placeholder-emerald-600/70 leading-relaxed transition-all"
                />
              </div>

              {/* SECTION 4: Consent Checkbox */}
              <div className="bg-forest-950/70 p-4 rounded-xl border border-emerald-800/60 shadow-xs">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-emerald-100/90 leading-relaxed select-none">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consentAccepted}
                    onChange={(e) => setFormData({ ...formData, consentAccepted: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-emerald-600 text-gold-500 focus:ring-gold-400 focus:ring-offset-forest-900"
                  />
                  <span>
                    {t("form_consent_label", "I agree to the Privacy Policy and User Agreement and consent to be contacted regarding my pilgrimage inquiry.")}{" "}
                    (
                    <Link href="/privacy-policy" className="text-gold-300 underline hover:text-white transition-colors">
                      {t("footer_privacy", "Privacy Policy")}
                    </Link>{" "}
                    &amp;{" "}
                    <Link href="/user-agreement" className="text-gold-300 underline hover:text-white transition-colors">
                      {t("footer_user_agreement", "User Agreement")}
                    </Link>
                    ) <span className="text-gold-400 font-bold">*</span>
                  </span>
                </label>
              </div>

              {/* SECTION 5: Submit CTA */}
              <div className="pt-2 text-center space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-forest-950 font-bold py-3.5 px-10 rounded-xl text-sm shadow-gold transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-forest-950" />
                      <span>{t("form_submitting", "Submitting...")}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-forest-950" />
                      <span>{t("form_submit", "Submit Enquiry")}</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-300/80">
                  <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>100% Confidential • Official AL GAFUR Pilgrimage Desk Response</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
