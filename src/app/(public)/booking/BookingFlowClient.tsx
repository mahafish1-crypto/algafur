"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Users,
  MessageCircle,
  Phone,
  Sparkles,
  MapPin,
  BedDouble,
  Send,
  ArrowLeft,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface BookingFlowClientProps {
  packages: any[];
  defaultSlug?: string;
  defaultRoom?: string;
  settings?: Record<string, string>;
}

const DRAFT_STORAGE_KEY = "algafur_booking_enquiry_draft_v2";

export default function BookingFlowClient({
  packages,
  defaultSlug,
  defaultRoom,
  settings = {},
}: BookingFlowClientProps) {
  const { language } = useLanguage();

  const [selectedPkgSlug, setSelectedPkgSlug] = useState(
    defaultSlug || (packages[0]?.slug ?? "")
  );

  const selectedPkg =
    packages.find((p) => p.slug === selectedPkgSlug) || packages[0] || null;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Pune",
    travelDate: selectedPkg?.departureDate || "",
    adults: 2,
    children: 0,
    roomPreference:
      defaultRoom === "TRIPLE" || defaultRoom === "DOUBLE" || defaultRoom === "QUAD"
        ? defaultRoom
        : "QUAD",
    preferredContactMethod: "WHATSAPP" as "WHATSAPP" | "CALL" | "EMAIL",
    notes: "",
    consentAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadResult, setLeadResult] = useState<{
    id: string;
    leadNumber: string;
    packageName: string;
  } | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          phone: parsed.phone || prev.phone,
          email: parsed.email || prev.email,
          city: parsed.city || prev.city,
        }));
      }
    } catch {
      // ignore storage errors
    }

    if (selectedPkg) {
      trackAnalyticsEvent({
        eventType: "BOOKING_START",
        packageId: selectedPkg.id,
        packageSlug: selectedPkg.slug,
        packageTitle: selectedPkg.name,
        category: selectedPkg.type,
        sourcePage: "/booking",
        language,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPkg?.departureDate) {
      setFormData((prev) => ({
        ...prev,
        travelDate: prev.travelDate || selectedPkg.departureDate,
      }));
    }
  }, [selectedPkgSlug, selectedPkg]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [formData.name, formData.phone, formData.email, formData.city]);

  const activeRoomPrice = selectedPkg
    ? formData.roomPreference === "DOUBLE"
      ? selectedPkg.priceDouble || Math.round(selectedPkg.basePrice * 1.25)
      : formData.roomPreference === "TRIPLE"
      ? selectedPkg.priceTriple || Math.round(selectedPkg.basePrice * 1.1)
      : selectedPkg.priceQuad || selectedPkg.basePrice
    : 0;

  const totalTravellers =
    Math.max(1, Number(formData.adults) || 1) +
    Math.max(0, Number(formData.children) || 0);

  const whatsappNum = settings.whatsapp_number || "919890708013";
  const supportPhone = settings.company_phone_1 || "+91 8793939393";
  const companyName =
    settings.company_short_name || settings.company_name || "Al-Gafur Tours";

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("Please enter your full name and mobile / WhatsApp number.");
      return;
    }

    if (!formData.consentAccepted) {
      setError(
        "Please accept the Privacy Policy and Terms to submit your booking enquiry."
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        city: formData.city.trim() || "India",
        packageId: selectedPkg?.id || undefined,
        packageInterest: selectedPkg?.name || "Umrah / Hajj Package Enquiry",
        category: selectedPkg?.type || "UMRAH",
        travelMonth: formData.travelDate || selectedPkg?.departureDate || "",
        travelDate: formData.travelDate || selectedPkg?.departureDate || "",
        adults: Math.max(1, Number(formData.adults) || 1),
        children: Math.max(0, Number(formData.children) || 0),
        travellersCount: totalTravellers,
        roomPreference: formData.roomPreference,
        preferredContactMethod: formData.preferredContactMethod,
        source: "BOOK_NOW_FLOW",
        sourcePage: selectedPkg ? `/packages/${selectedPkg.slug}` : "/booking",
        language,
        notes: formData.notes.trim(),
        consentAccepted: true,
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to submit your booking enquiry.");
      }

      try {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }

      trackAnalyticsEvent({
        eventType: "INQUIRY_SUBMIT",
        packageId: selectedPkg?.id,
        packageSlug: selectedPkg?.slug,
        packageTitle: selectedPkg?.name,
        category: selectedPkg?.type || "UMRAH",
        sourcePage: "/booking",
        language,
        metadata: {
          leadNumber: data.leadNumber,
          travellersCount: totalTravellers,
          roomPreference: formData.roomPreference,
        },
      });

      setLeadResult({
        id: data.id,
        leadNumber: data.leadNumber,
        packageName: selectedPkg?.name || "Hajj & Umrah Package",
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting your enquiry."
      );
    } finally {
      setLoading(false);
    }
  };

  if (leadResult) {
    const waFollowUpMsg = `Assalamualaikum ${companyName}, I have submitted a booking enquiry (Ref: ${leadResult.leadNumber}) for ${leadResult.packageName} (${totalTravellers} travellers, ${formData.roomPreference} room preference). Please assist with availability and confirmation.`;
    const waUrl = buildWhatsAppLink(whatsappNum, waFollowUpMsg);

    return (
      <div className="bg-ivory-100/60 min-h-screen py-14 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gold-500/40 shadow-xl p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-gold-700 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
              Enquiry Reference: {leadResult.leadNumber}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950">
              Booking Enquiry Received
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
              JazakAllah Khair, <strong>{formData.name}</strong>. Your booking
              request for <strong>{leadResult.packageName}</strong> has been
              registered with our pilgrimage desk. Our advisor will contact you
              shortly via{" "}
              <strong>{formData.preferredContactMethod}</strong> to verify seat
              availability, answer your questions, and complete your booking
              confirmation manually.
            </p>
          </div>

          <div className="bg-ivory-50 rounded-2xl p-5 border border-neutral-200 text-left text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-neutral-200/70">
              <span className="text-neutral-500">Enquiry ID:</span>
              <span className="font-mono font-bold text-forest-950">
                {leadResult.leadNumber}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-200/70">
              <span className="text-neutral-500">Selected Package:</span>
              <span className="font-bold text-forest-950">
                {leadResult.packageName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-200/70">
              <span className="text-neutral-500">Travellers:</span>
              <span className="font-semibold text-neutral-800">
                {formData.adults} Adult(s)
                {formData.children > 0
                  ? `, ${formData.children} Child(ren)`
                  : ""}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-200/70">
              <span className="text-neutral-500">Room Preference:</span>
              <span className="font-semibold text-neutral-800">
                {formData.roomPreference} Sharing
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-500">Booking Status:</span>
              <span className="font-bold text-emerald-700">
                Enquiry Logged — Awaiting Advisor Follow-up
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat with Advisor on WhatsApp
            </a>
            <a
              href={`tel:${supportPhone.replace(/\s+/g, "")}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-forest-950 hover:bg-forest-900 text-gold-300 font-bold text-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call Desk: {supportPhone}
            </a>
          </div>

          <div className="pt-2">
            <Link
              href="/packages"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-forest-950"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to All Packages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory-100/50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-gold-700 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            <Sparkles className="w-3.5 h-3.5" />
            Direct Pilgrimage Registration
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-forest-950">
            Submit Your Booking Enquiry
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600">
            No online payment or passport upload is required right now. Share
            your package and room preferences below, and our team will contact
            you directly to confirm seat availability.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Enquiry Form (8 Cols) */}
          <form
            onSubmit={handleSubmitEnquiry}
            className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-9 border border-neutral-200 shadow-lg space-y-6"
          >
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            {/* 1. Package & Room Selection */}
            <div className="space-y-4">
              <h2 className="text-base font-serif font-bold text-forest-950 border-b border-neutral-100 pb-2">
                1. Package &amp; Room Preference
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Selected Package *
                  </label>
                  <select
                    value={selectedPkgSlug}
                    onChange={(e) => setSelectedPkgSlug(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-900"
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.name} ({p.departureDate} • {p.durationDays} Days — From ₹
                        {(p.priceQuad || p.basePrice).toLocaleString("en-IN")})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Preferred Travel Date / Departure
                  </label>
                  <input
                    type="text"
                    value={formData.travelDate}
                    onChange={(e) =>
                      setFormData({ ...formData, travelDate: e.target.value })
                    }
                    placeholder="e.g. October 2026 / Ramadan"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Room Sharing Preference
                  </label>
                  <select
                    value={formData.roomPreference}
                    onChange={(e) =>
                      setFormData({ ...formData, roomPreference: e.target.value })
                    }
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="QUAD">Quad Sharing (4 Beds)</option>
                    <option value="TRIPLE">Triple Sharing (3 Beds)</option>
                    <option value="DOUBLE">Double Sharing (2 Beds)</option>
                    <option value="CUSTOM">Custom / Family Suite</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Pilgrim Contact Information */}
            <div className="space-y-4">
              <h2 className="text-base font-serif font-bold text-forest-950 border-b border-neutral-100 pb-2">
                2. Your Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Mobile / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+91 98XXXXXXXX"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="you@example.com"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="e.g. Pune, Mumbai, Solapur"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Travellers & Contact Preference */}
            <div className="space-y-4">
              <h2 className="text-base font-serif font-bold text-forest-950 border-b border-neutral-100 pb-2">
                3. Number of Travellers &amp; Special Requests
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Adults (12+ Yrs)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.adults}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adults: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Children (Under 12 Yrs)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={formData.children}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        children: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Preferred Contact Method
                  </label>
                  <select
                    value={formData.preferredContactMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferredContactMethod: e.target.value as
                          | "WHATSAPP"
                          | "CALL"
                          | "EMAIL",
                      })
                    }
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="WHATSAPP">WhatsApp Message / Call</option>
                    <option value="CALL">Direct Phone Call</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Special Requirements / Message (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Share any questions, wheelchair assistance needs, or preferred departure dates..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Consent & Submit */}
            <div className="space-y-4 pt-2 border-t border-neutral-100">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-600">
                <input
                  type="checkbox"
                  checked={formData.consentAccepted}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consentAccepted: e.target.checked,
                    })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-forest-900"
                />
                <span>
                  I agree to receive pilgrimage package details and callback
                  assistance from Al-Gafur Tours in accordance with the{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-emerald-700 font-semibold underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/user-agreement"
                    className="text-emerald-700 font-semibold underline"
                  >
                    User Agreement
                  </Link>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-forest-950 font-bold text-sm shadow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {loading
                  ? "Submitting Booking Enquiry..."
                  : "Submit Booking Enquiry"}
              </button>
            </div>
          </form>

          {/* Right Column: Selected Package Summary (4 Cols) */}
          <div className="lg:col-span-4 space-y-5 sticky top-28">
            {selectedPkg && (
              <div className="bg-white rounded-3xl p-6 border border-gold-500/40 shadow-md space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-700 bg-gold-50 px-2.5 py-1 rounded-full border border-gold-200">
                    Selected Package
                  </span>
                  <h3 className="text-lg font-serif font-bold text-forest-950 mt-2">
                    {selectedPkg.name}
                  </h3>
                </div>

                <div className="space-y-2 text-xs text-neutral-600 border-t border-b border-neutral-100 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>
                      Departure: <strong>{selectedPkg.departureDate}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>
                      Duration: <strong>{selectedPkg.durationDays} Days</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>
                      Travellers:{" "}
                      <strong>
                        {totalTravellers} Pilgrim
                        {totalTravellers > 1 ? "s" : ""}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>
                      Room Preference:{" "}
                      <strong>{formData.roomPreference}</strong>
                    </span>
                  </div>
                </div>

                {activeRoomPrice > 0 && (
                  <div className="bg-ivory-50 p-3.5 rounded-2xl border border-neutral-200">
                    <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                      Indicative Package Rate ({formData.roomPreference})
                    </span>
                    <div className="text-xl font-serif font-bold text-forest-950 mt-0.5">
                      ₹{activeRoomPrice.toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-normal text-neutral-500">
                        / person
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-[11px] text-neutral-600">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>How Confirmation Works:</strong> Submitting this
                      form logs your enquiry directly with our advisors. Our
                      team will call or message you to confirm seat availability
                      and guide you through documentation.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
