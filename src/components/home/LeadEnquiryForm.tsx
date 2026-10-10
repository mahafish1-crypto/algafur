"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2, AlertCircle, MessageCircle, Sparkles, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface PackageOption {
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

export default function LeadEnquiryForm({
  defaultPackage,
  defaultPackageId,
  packages = [],
  settings = {},
  sourcePage,
}: LeadEnquiryFormProps) {
  const { t, language } = useLanguage();

  const packageOptions: PackageOption[] =
    packages.length > 0
      ? packages
      : [
          { id: "pkg-platinum", name: "Umrah Platinum Package (20 Days)" },
          { id: "pkg-economy", name: "Umrah Classic Economy (15 Days)" },
          { id: "pkg-ramadan", name: "Ramadan Blessed Last 15 Days" },
          { id: "pkg-hajj", name: "Executive Hajj 2027" },
          { id: "pkg-custom", name: "Custom Private Family Umrah" },
        ];

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    whatsapp: "",
    email: "",
    city: "Pune",
    journeyType: "UMRAH",
    packageInterest: defaultPackage || packageOptions[0]?.name || "Umrah Platinum Package (20 Days)",
    packageId: defaultPackageId || "",
    travelDate: "October 2026",
    adults: 2,
    children: 0,
    preferredContact: "WHATSAPP",
    budget: "₹1,20,000 – ₹2,50,000",
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
      const matchedPkg = packages.find((p) => p.name === formData.packageInterest);
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
      setError("Please enter a valid 10 to 12 digit mobile number.");
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!formData.consentAccepted) {
      setError("Please accept the Privacy Policy and User Agreement to submit your inquiry.");
      return;
    }

    setLoading(true);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get("utm_source") || "Website";
      const utmMedium = urlParams.get("utm_medium") || "Direct";
      const utmCampaign = urlParams.get("utm_campaign") || undefined;
      const currentPath = sourcePage || window.location.pathname;
      const matchedPkg = packages.find((p) => p.name === formData.packageInterest);

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
        throw new Error(data.error || "Failed to submit enquiry");
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

      setSuccess(true);
      setLeadNumber(data.leadNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const whatsappNum = settings.whatsapp_number || "919890708013";
  const whatsappHref = buildWhatsAppLink(
    whatsappNum,
    `Assalamualaikum, my enquiry reference is ${leadNumber || "Pending"} for ${formData.packageInterest}.`
  );

  return (
    <section id="lead-form" className="py-20 bg-forest-950 text-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="bg-forest-900/90 rounded-3xl p-6 sm:p-12 border border-gold-500/30 shadow-2xl backdrop-blur-md">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-950 border border-gold-500/30 text-gold-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>{t("form_badge")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {t("form_title")}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/70 mt-2">
              {t("form_sub")}
            </p>
          </div>

          {success ? (
            <div
              role="status"
              aria-live="polite"
              className="bg-forest-950 p-8 rounded-2xl border border-emerald-500/40 text-center space-y-4 animate-scaleUp"
            >
              <div className="w-14 h-14 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                {t("form_success_title")}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200/80 max-w-md mx-auto">
                Your enquiry reference is{" "}
                <strong className="text-gold-300 font-mono">{leadNumber}</strong>. Our pilgrimage
                coordinator will call or WhatsApp you shortly.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat Directly on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setFormData((prev) => ({ ...prev, message: "", consentAccepted: false }));
                  }}
                  className="inline-flex items-center gap-2 border border-gold-500/30 hover:bg-forest-900 text-gold-300 text-xs font-semibold py-2.5 px-5 rounded-xl transition-all"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              onFocus={handleFirstInteraction}
              className="space-y-4"
              noValidate
            >
              {error && (
                <div
                  role="alert"
                  className="p-3.5 bg-red-950/70 border border-red-500/50 text-red-200 rounded-xl text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Honeypot field hidden from users */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="lead-name" className="block text-xs font-medium text-emerald-100 mb-1">
                    {t("form_full_name")} *
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Haji Nizam Tamboli"
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-600/80"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label htmlFor="lead-mobile" className="block text-xs font-medium text-emerald-100 mb-1">
                    {t("form_mobile")} *
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
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-600/80"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label htmlFor="lead-whatsapp" className="block text-xs font-medium text-emerald-100 mb-1">
                    {t("form_whatsapp")}
                  </label>
                  <input
                    id="lead-whatsapp"
                    type="tel"
                    inputMode="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Same as mobile or different"
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-600/80"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="lead-email" className="block text-xs font-medium text-emerald-100 mb-1">
                    {t("form_email")}
                  </label>
                  <input
                    id="lead-email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-600/80"
                  />
                </div>

                {/* City */}
                <div>
                  <label htmlFor="lead-city" className="block text-xs font-medium text-emerald-100 mb-1">
                    {t("form_city")} *
                  </label>
                  <input
                    id="lead-city"
                    type="text"
                    required
                    autoComplete="address-level2"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Pune, Mumbai, Aurangabad, etc."
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-600/80"
                  />
                </div>

                {/* Package Interest */}
                <div>
                  <label htmlFor="lead-package" className="block text-xs font-medium text-emerald-100 mb-1">
                    {t("form_package")}
                  </label>
                  <select
                    id="lead-package"
                    value={formData.packageInterest}
                    onChange={(e) => setFormData({ ...formData, packageInterest: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white"
                  >
                    {packageOptions.map((opt) => (
                      <option key={opt.id || opt.name} value={opt.name} className="bg-forest-950 text-white">
                        {opt.name}
                      </option>
                    ))}
                    {!packageOptions.some((o) => o.name === "Custom Private Family Umrah") && (
                      <option value="Custom Private Family Umrah" className="bg-forest-950 text-white">
                        Customized Private Family Umrah
                      </option>
                    )}
                  </select>
                </div>

                {/* Travellers */}
                <div>
                  <label htmlFor="lead-adults" className="block text-xs font-medium text-emerald-100 mb-1">
                    {t("form_adults")}
                  </label>
                  <input
                    id="lead-adults"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.adults}
                    onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value, 10) || 1 })}
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white"
                  />
                </div>

                {/* Children */}
                <div>
                  <label htmlFor="lead-children" className="block text-xs font-medium text-emerald-100 mb-1">
                    {t("form_children")}
                  </label>
                  <input
                    id="lead-children"
                    type="number"
                    min="0"
                    max="20"
                    value={formData.children}
                    onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value, 10) || 0 })}
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white"
                  />
                </div>

                {/* Travel Date / Month */}
                <div>
                  <label htmlFor="lead-travel-date" className="block text-xs font-medium text-emerald-100 mb-1">
                    {t("form_travel_month")}
                  </label>
                  <input
                    id="lead-travel-date"
                    type="text"
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    placeholder="e.g. October 2026"
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white"
                  />
                </div>
              </div>

              {/* Preferred Contact Method */}
              <div>
                <span className="block text-xs font-medium text-emerald-100 mb-2">
                  {t("form_preferred_contact")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "WHATSAPP", label: "WhatsApp" },
                    { id: "CALL", label: "Phone Call" },
                    { id: "EMAIL", label: "Email" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredContact: mode.id })}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        formData.preferredContact === mode.id
                          ? "bg-gold-500 text-forest-950 border-gold-400 shadow-sm"
                          : "bg-forest-950/70 text-emerald-100 border-emerald-800/60 hover:border-gold-500/40"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="lead-message" className="block text-xs font-medium text-emerald-100 mb-1">
                  {t("form_notes")}
                </label>
                <textarea
                  id="lead-message"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share any special preferences for room types, wheelchair assistance, or dates..."
                  className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-600/80"
                />
              </div>

              {/* Consent Checkbox (Not pre-checked) */}
              <div className="bg-forest-950/60 p-3.5 rounded-xl border border-emerald-800/50">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-emerald-100/90 leading-relaxed">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consentAccepted}
                    onChange={(e) => setFormData({ ...formData, consentAccepted: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-emerald-600 text-gold-500 focus:ring-gold-400"
                  />
                  <span>
                    {t("form_consent_label")} ({" "}
                    <Link href="/privacy-policy" className="text-gold-300 underline hover:text-white">
                      {t("footer_privacy")}
                    </Link>{" "}
                    &amp;{" "}
                    <Link href="/user-agreement" className="text-gold-300 underline hover:text-white">
                      {t("footer_user_agreement")}
                    </Link>
                    ) *
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-forest-950 font-bold py-3.5 px-8 rounded-xl text-xs sm:text-sm shadow-gold transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-forest-950" />
                  <span>{loading ? t("form_submitting") : t("form_submit")}</span>
                </button>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-emerald-300/70">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                  <span>100% Confidential • Direct Pilgrimage Desk Response</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

