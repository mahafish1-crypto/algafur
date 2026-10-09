"use client";

import React, { useState } from "react";
import {
  Settings,
  Building,
  MessageCircle,
  Sparkles,
  CreditCard,
  Mail,
  Shield,
  Save,
  CheckCircle,
  AlertTriangle,
  Globe,
  Image as ImageIcon,
  LayoutTemplate,
  Phone,
  Trash2,
  ExternalLink,
  FileText,
  Award,
} from "lucide-react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

interface Props {
  initialSettings: Record<string, string>;
}

type TabType =
  | "branding"
  | "header_footer"
  | "about"
  | "contact"
  | "company"
  | "whatsapp"
  | "ai"
  | "payment"
  | "localization";

export default function AdminSettingsClient({ initialSettings }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("branding");
  const [settings, setSettings] = useState<Record<string, string>>({
    site_logo: initialSettings.site_logo || "",
    header_logo: initialSettings.header_logo || "",
    footer_logo: initialSettings.footer_logo || "",
    favicon: initialSettings.favicon || "",

    company_name:
      initialSettings.company_name || "AL-GAFUR International Tours And Travels",
    company_short_name: initialSettings.company_short_name || "Al-Gafur Tours",
    company_tagline:
      initialSettings.company_tagline || "Your Sacred Journey, Handled With Care",

    header_topbar_enabled: initialSettings.header_topbar_enabled || "true",
    header_announcement_text:
      initialSettings.header_announcement_text ||
      "🕋 Bookings Open for 2026 Umrah & Hajj Fixed Departure Groups — Direct Flights & Near Haram Stays",
    header_cta_text: initialSettings.header_cta_text || "Book Umrah 2026",
    header_cta_link: initialSettings.header_cta_link || "/packages",

    footer_description:
      initialSettings.footer_description ||
      "Al-Gafur International Tours And Travels is dedicated to facilitating serene, spiritually uplifting, and meticulously organized Hajj & Umrah pilgrimages with authentic Indian hospitality.",
    footer_copyright:
      initialSettings.footer_copyright ||
      "© 2026 AL-GAFUR International Tours And Travels. All Rights Reserved. Govt. Approved Tour Operator.",
    social_facebook: initialSettings.social_facebook || "https://facebook.com",
    social_instagram: initialSettings.social_instagram || "https://instagram.com",
    social_youtube: initialSettings.social_youtube || "https://youtube.com",
    social_twitter: initialSettings.social_twitter || "https://twitter.com",

    company_phone_1: initialSettings.company_phone_1 || "+91 8793939393",
    company_phone_2: initialSettings.company_phone_2 || "+91 9890708013",
    company_phone_3: initialSettings.company_phone_3 || "+91 9764444044",
    whatsapp_number: initialSettings.whatsapp_number || "919890708013",
    company_email: initialSettings.company_email || "contact@algafurtours.com",
    company_address:
      initialSettings.company_address ||
      "183, M.G. Road, 15 August Chowk, Khadda Market, Near Camp, Pune - 411001, Maharashtra, India.",
    company_city: initialSettings.company_city || "Pune",
    company_state: initialSettings.company_state || "Maharashtra",
    company_country: initialSettings.company_country || "India",
    working_hours:
      initialSettings.working_hours ||
      "Monday – Saturday: 10:00 AM – 8:30 PM (IST)",
    google_maps_url: initialSettings.google_maps_url || "https://maps.google.com",

    company_license:
      initialSettings.company_license ||
      "Hajj & Umrah Tour Operator Lic #MH-2026-9812",
    company_gstin: initialSettings.company_gstin || "27AABCA1234F1Z5",
    company_pan: initialSettings.company_pan || "AABCA1234F",
    bank_name: initialSettings.bank_name || "HDFC Bank Limited",
    bank_account_name:
      initialSettings.bank_account_name ||
      "AL GAFUR INTERNATIONAL TOURS AND TRAVELS",
    bank_account_number:
      initialSettings.bank_account_number || "50200088991234",
    bank_ifsc: initialSettings.bank_ifsc || "HDFC0000123",
    bank_upi: initialSettings.bank_upi || "algafurtours@hdfcbank",

    whatsapp_api_token: initialSettings.whatsapp_api_token || "",
    whatsapp_phone_number_id: initialSettings.whatsapp_phone_number_id || "",
    whatsapp_webhook_token: initialSettings.whatsapp_webhook_token || "",

    ai_gemini_api_key: initialSettings.ai_gemini_api_key || "",
    ai_model_name: initialSettings.ai_model_name || "gemini-1.5-flash",
    ai_fallback_enabled: initialSettings.ai_fallback_enabled || "true",

    payment_provider: initialSettings.payment_provider || "BANK_AND_UPI",
    razorpay_key_id: initialSettings.razorpay_key_id || "",
    razorpay_key_secret: initialSettings.razorpay_key_secret || "",

    default_currency: initialSettings.default_currency || "INR (₹)",
    default_language: initialSettings.default_language || "en",
    timezone: initialSettings.timezone || "Asia/Kolkata",

    // About Page CMS
    about_badge: initialSettings.about_badge || "About Al-Gafur Tours",
    about_title: initialSettings.about_title || "Serving the Guests of Allah with Honor and Care",
    about_subtitle:
      initialSettings.about_subtitle ||
      "A premier international Hajj & Umrah travel organization founded on devotion, transparency, and scholarly guidance.",
    about_mandate_title: initialSettings.about_mandate_title || "Our Spiritual Mandate",
    about_mandate_description_1:
      initialSettings.about_mandate_description_1 ||
      "At Al-Gafur International Tours And Travels, we believe embarking on Hajj or Umrah is not merely an itinerary — it is the milestone pilgrimage of a lifetime. Every detail, from selecting hotels with level walking pathways to the Haram courtyards, to preparing fresh Indian meals that nourish tired worshippers, is managed with intense responsibility.",
    about_mandate_description_2:
      initialSettings.about_mandate_description_2 ||
      'Our slogan reflects our devotion: "एक सफर जिंदगी में तब्दीली लानेवाला... इन्शाअल्लाह" — A journey destined to transform your heart and life.',
    about_image: initialSettings.about_image || "/brand/img2.jpeg",
    about_feature_1: initialSettings.about_feature_1 || "Ministry of Hajj & Umrah Recognized Operations",
    about_feature_2: initialSettings.about_feature_2 || "Over 1,500+ Satisfied Pilgrims Guided Across Maharashtra",
    about_feature_3: initialSettings.about_feature_3 || "Direct Mumbai Return Flights Guaranteed",
    about_leader_1_name: initialSettings.about_leader_1_name || "Dr. Mudassir Rafique Sayyad",
    about_leader_1_role: initialSettings.about_leader_1_role || "Managing Director",
    about_leader_1_desc: initialSettings.about_leader_1_desc || "Oversees institutional partnerships, airline charters, and pilgrim welfare.",
    about_leader_1_phone: initialSettings.about_leader_1_phone || "+91 8793939393",
    about_leader_2_name: initialSettings.about_leader_2_name || "Hafiz Asrar Sahab (S.B.)",
    about_leader_2_role: initialSettings.about_leader_2_role || "Religious Director & International Naat Khwan",
    about_leader_2_desc: initialSettings.about_leader_2_desc || "Leads spiritual discourses, lectures on Umrah virtues, and Madinah salam sessions.",
    about_leader_2_phone: initialSettings.about_leader_2_phone || "+91 9890708013",
    about_leader_3_name: initialSettings.about_leader_3_name || "Zahir Ali Pathan",
    about_leader_3_role: initialSettings.about_leader_3_role || "Director of Operations",
    about_leader_3_desc: initialSettings.about_leader_3_desc || "Directs hotel contracting in Makkah & Madinah and airport transfer operations.",
    about_leader_3_phone: initialSettings.about_leader_3_phone || "+91 9764444044",
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Media Picker state
  const [mediaTarget, setMediaTarget] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const isWhatsAppConfigured = Boolean(
    settings.whatsapp_api_token && settings.whatsapp_phone_number_id
  );
  const isAIConfigured = Boolean(settings.ai_gemini_api_key);
  const isPaymentGatewayConfigured = Boolean(
    settings.razorpay_key_id && settings.razorpay_key_secret
  );

  return (
    <div className="space-y-6">
      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={Boolean(mediaTarget)}
        onClose={() => setMediaTarget(null)}
        categoryFilter={mediaTarget === "about_image" ? "ALL" : "LOGO"}
        title={
          mediaTarget === "favicon"
            ? "Select Favicon Icon"
            : mediaTarget === "header_logo"
            ? "Select Header Logo"
            : mediaTarget === "footer_logo"
            ? "Select Footer Logo"
            : mediaTarget === "about_image"
            ? "Select About Page Story Image"
            : "Select Site Logo"
        }
        onSelect={(url) => {
          if (mediaTarget) {
            handleChange(mediaTarget, url);
          }
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-emerald-700" />
            Website & System CMS Settings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage live website logos, branding, header announcements, contact information, banking remittances, and external integrations.
          </p>
        </div>
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? (
            "Saving..."
          ) : savedSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              Saved Successfully!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All Settings
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Navigation Tabs */}
        <div className="lg:col-span-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1 h-fit">
          {[
            { id: "branding", label: "Logos & Branding", icon: ImageIcon },
            { id: "header_footer", label: "Header & Footer CMS", icon: LayoutTemplate },
            { id: "about", label: "About Us Page CMS", icon: FileText },
            { id: "contact", label: "Contact & Offices", icon: Phone },
            { id: "company", label: "Agency Profile & Banking", icon: Building },
            { id: "whatsapp", label: "WhatsApp Cloud API", icon: MessageCircle },
            { id: "ai", label: "AI Marketing Studio", icon: Sparkles },
            { id: "payment", label: "Payment Gateways", icon: CreditCard },
            { id: "localization", label: "Languages & Currency", icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                  activeTab === tab.id
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Form Pane */}
        <div className="lg:col-span-9 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. Logos & Branding Tab */}
            {activeTab === "branding" && (
              <div className="space-y-6">
                <div className="border-b pb-3 border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-700" />
                    Website Branding & Logo Management
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload official logos and icons from your computer or pick from the Media Library. These actively update the navigation bar, footer, and branding components.
                  </p>
                </div>

                {/* Logo Pickers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Site / Primary Logo */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Primary Logo
                      </label>
                      {settings.site_logo && (
                        <button
                          type="button"
                          onClick={() => handleChange("site_logo", "")}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="h-28 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                      {settings.site_logo ? (
                        <img
                          src={settings.site_logo}
                          alt="Primary Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-slate-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <span className="text-[11px]">Using default vector brandmark</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMediaTarget("site_logo")}
                        className="flex-1 py-1.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        + Choose / Upload Logo
                      </button>
                    </div>
                  </div>

                  {/* Header / Dark Navbar Logo */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Header / Navbar Logo
                      </label>
                      {settings.header_logo && (
                        <button
                          type="button"
                          onClick={() => handleChange("header_logo", "")}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="h-28 bg-forest-950 border border-dashed border-emerald-800 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                      {settings.header_logo ? (
                        <img
                          src={settings.header_logo}
                          alt="Header Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-emerald-400/60">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <span className="text-[11px]">Using primary logo or vector brandmark</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMediaTarget("header_logo")}
                        className="flex-1 py-1.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        + Choose / Upload Header Logo
                      </button>
                    </div>
                  </div>

                  {/* Footer Logo */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Footer Logo
                      </label>
                      {settings.footer_logo && (
                        <button
                          type="button"
                          onClick={() => handleChange("footer_logo", "")}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="h-28 bg-forest-950 border border-dashed border-emerald-800 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                      {settings.footer_logo ? (
                        <img
                          src={settings.footer_logo}
                          alt="Footer Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-emerald-400/60">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <span className="text-[11px]">Using primary logo or vector brandmark</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMediaTarget("footer_logo")}
                        className="flex-1 py-1.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        + Choose / Upload Footer Logo
                      </button>
                    </div>
                  </div>

                  {/* Favicon */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Favicon / Browser Icon
                      </label>
                      {settings.favicon && (
                        <button
                          type="button"
                          onClick={() => handleChange("favicon", "")}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="h-28 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                      {settings.favicon ? (
                        <img
                          src={settings.favicon}
                          alt="Favicon"
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <div className="text-center text-slate-400">
                          <Globe className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <span className="text-[11px]">Default favicon</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMediaTarget("favicon")}
                        className="flex-1 py-1.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        + Choose / Upload Favicon
                      </button>
                    </div>
                  </div>
                </div>

                {/* Company Name & Brand Names */}
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Brand Names & Taglines</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Full Company Name
                      </label>
                      <input
                        type="text"
                        value={settings.company_name}
                        onChange={(e) => handleChange("company_name", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Short Brand Name (for Navbar & Mobile)
                      </label>
                      <input
                        type="text"
                        value={settings.company_short_name}
                        onChange={(e) => handleChange("company_short_name", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Official Brand Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.company_tagline}
                      onChange={(e) => handleChange("company_tagline", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Header & Footer CMS Tab */}
            {activeTab === "header_footer" && (
              <div className="space-y-6">
                <div className="border-b pb-3 border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-emerald-700" />
                    Header & Footer Content Management
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Control top announcement bars, header action buttons, footer copyright notices, and social links.
                  </p>
                </div>

                {/* Header Announcement Bar */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Header Top Announcement Bar</h3>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.header_topbar_enabled === "true"}
                        onChange={(e) =>
                          handleChange("header_topbar_enabled", e.target.checked ? "true" : "false")
                        }
                        className="rounded text-emerald-700 focus:ring-emerald-600"
                      />
                      Enable Top Bar
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Announcement Text
                    </label>
                    <input
                      type="text"
                      value={settings.header_announcement_text}
                      onChange={(e) => handleChange("header_announcement_text", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Header CTA Button Label
                      </label>
                      <input
                        type="text"
                        value={settings.header_cta_text}
                        onChange={(e) => handleChange("header_cta_text", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Header CTA Button URL Link
                      </label>
                      <input
                        type="text"
                        value={settings.header_cta_link}
                        onChange={(e) => handleChange("header_cta_link", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Content */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Footer Text & Policies</h3>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Footer About / Description
                    </label>
                    <textarea
                      rows={3}
                      value={settings.footer_description}
                      onChange={(e) => handleChange("footer_description", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Footer Copyright Text
                    </label>
                    <input
                      type="text"
                      value={settings.footer_copyright}
                      onChange={(e) => handleChange("footer_copyright", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Social Media URLs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        value={settings.social_facebook}
                        onChange={(e) => handleChange("social_facebook", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        value={settings.social_instagram}
                        onChange={(e) => handleChange("social_instagram", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        value={settings.social_youtube}
                        onChange={(e) => handleChange("social_youtube", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Twitter / X URL
                      </label>
                      <input
                        type="url"
                        value={settings.social_twitter}
                        onChange={(e) => handleChange("social_twitter", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* About Us Page CMS Tab */}
            {activeTab === "about" && (
              <div className="space-y-6">
                <div className="border-b pb-3 border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    About Us Page Dynamic CMS
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage the public About Us page narrative, spiritual mandate, statistics, scholar leadership portraits, and credentials.
                  </p>
                </div>

                {/* Hero / Header Section */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Header & Title</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Top Badge Tagline
                      </label>
                      <input
                        type="text"
                        value={settings.about_badge}
                        onChange={(e) => handleChange("about_badge", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Main Heading Title
                      </label>
                      <input
                        type="text"
                        value={settings.about_title}
                        onChange={(e) => handleChange("about_title", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Header Subtitle
                    </label>
                    <textarea
                      rows={2}
                      value={settings.about_subtitle}
                      onChange={(e) => handleChange("about_subtitle", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                {/* Spiritual Mandate & Story */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Spiritual Mandate & Narrative</h3>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={settings.about_mandate_title}
                      onChange={(e) => handleChange("about_mandate_title", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Narrative Paragraph 1
                    </label>
                    <textarea
                      rows={3}
                      value={settings.about_mandate_description_1}
                      onChange={(e) => handleChange("about_mandate_description_1", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Slogan / Paragraph 2
                    </label>
                    <textarea
                      rows={2}
                      value={settings.about_mandate_description_2}
                      onChange={(e) => handleChange("about_mandate_description_2", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  {/* About Feature Points */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Key Trust Bullet Points
                    </label>
                    <input
                      type="text"
                      value={settings.about_feature_1}
                      onChange={(e) => handleChange("about_feature_1", e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="Bullet 1"
                    />
                    <input
                      type="text"
                      value={settings.about_feature_2}
                      onChange={(e) => handleChange("about_feature_2", e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="Bullet 2"
                    />
                    <input
                      type="text"
                      value={settings.about_feature_3}
                      onChange={(e) => handleChange("about_feature_3", e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="Bullet 3"
                    />
                  </div>

                  {/* About Image with Media Picker */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      About Story Image
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={settings.about_image}
                        onChange={(e) => handleChange("about_image", e.target.value)}
                        className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                        placeholder="/brand/img2.jpeg or image URL"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaTarget("about_image")}
                        className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
                      >
                        Select from Media Library
                      </button>
                    </div>
                    {settings.about_image && (
                      <div className="mt-2 relative h-28 w-44 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                        <img
                          src={settings.about_image}
                          alt="About Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Scholarly Leadership */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Scholarly Leadership & Directorship</h3>

                  {/* Leader 1 */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-extrabold text-gold-700 uppercase">Director 1</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={settings.about_leader_1_name}
                          onChange={(e) => handleChange("about_leader_1_name", e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Designation / Role</label>
                        <input
                          type="text"
                          value={settings.about_leader_1_role}
                          onChange={(e) => handleChange("about_leader_1_role", e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] text-slate-600 mb-1">Bio / Responsibilities</label>
                        <input
                          type="text"
                          value={settings.about_leader_1_desc}
                          onChange={(e) => handleChange("about_leader_1_desc", e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Direct Phone</label>
                        <input
                          type="text"
                          value={settings.about_leader_1_phone}
                          onChange={(e) => handleChange("about_leader_1_phone", e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Leader 2 */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-extrabold text-gold-700 uppercase">Director 2 (Religious Scholar)</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={settings.about_leader_2_name}
                          onChange={(e) => handleChange("about_leader_2_name", e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Designation / Role</label>
                        <input
                          type="text"
                          value={settings.about_leader_2_role}
                          onChange={(e) => handleChange("about_leader_2_role", e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] text-slate-600 mb-1">Bio / Responsibilities</label>
                        <input
                          type="text"
                          value={settings.about_leader_2_desc}
                          onChange={(e) => handleChange("about_leader_2_desc", e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Direct Phone</label>
                        <input
                          type="text"
                          value={settings.about_leader_2_phone}
                          onChange={(e) => handleChange("about_leader_2_phone", e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Leader 3 */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-extrabold text-gold-700 uppercase">Director 3 (Operations)</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={settings.about_leader_3_name}
                          onChange={(e) => handleChange("about_leader_3_name", e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Designation / Role</label>
                        <input
                          type="text"
                          value={settings.about_leader_3_role}
                          onChange={(e) => handleChange("about_leader_3_role", e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] text-slate-600 mb-1">Bio / Responsibilities</label>
                        <input
                          type="text"
                          value={settings.about_leader_3_desc}
                          onChange={(e) => handleChange("about_leader_3_desc", e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Direct Phone</label>
                        <input
                          type="text"
                          value={settings.about_leader_3_phone}
                          onChange={(e) => handleChange("about_leader_3_phone", e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Contact & Office Info Tab */}
            {activeTab === "contact" && (
              <div className="space-y-4">
                <div className="border-b pb-3 border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    Contact & Booking Office Helplines
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    These phone numbers, emails, WhatsApp contact, and head office address appear in the public navigation, contact page, and footer.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Primary Phone (Dr. Mudassir)
                    </label>
                    <input
                      type="text"
                      value={settings.company_phone_1}
                      onChange={(e) => handleChange("company_phone_1", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Secondary Helpline (Hafiz Asrar)
                    </label>
                    <input
                      type="text"
                      value={settings.company_phone_2}
                      onChange={(e) => handleChange("company_phone_2", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Third Helpline (Zahir Ali)
                    </label>
                    <input
                      type="text"
                      value={settings.company_phone_3}
                      onChange={(e) => handleChange("company_phone_3", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      WhatsApp Number (digits only, e.g. 919890708013)
                    </label>
                    <input
                      type="text"
                      value={settings.whatsapp_number}
                      onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Official Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.company_email}
                      onChange={(e) => handleChange("company_email", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    HEAD OFFICE ADDRESS
                  </label>
                  <textarea
                    rows={2}
                    value={settings.company_address}
                    onChange={(e) => handleChange("company_address", e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={settings.company_city}
                      onChange={(e) => handleChange("company_city", e.target.value)}
                      placeholder="Pune"
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={settings.company_state}
                      onChange={(e) => handleChange("company_state", e.target.value)}
                      placeholder="Maharashtra"
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={settings.company_country}
                      onChange={(e) => handleChange("company_country", e.target.value)}
                      placeholder="India"
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Office Working Hours
                    </label>
                    <input
                      type="text"
                      value={settings.working_hours}
                      onChange={(e) => handleChange("working_hours", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Google Maps Location URL
                    </label>
                    <input
                      type="url"
                      value={settings.google_maps_url}
                      onChange={(e) => handleChange("google_maps_url", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Company & Banking Tab */}
            {activeTab === "company" && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b pb-2 border-slate-100 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-700" />
                  Official Agency Profile & Banking Remittance
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Tour Operator License
                    </label>
                    <input
                      type="text"
                      value={settings.company_license}
                      onChange={(e) => handleChange("company_license", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      GSTIN Number
                    </label>
                    <input
                      type="text"
                      value={settings.company_gstin}
                      onChange={(e) => handleChange("company_gstin", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      PAN Card Number
                    </label>
                    <input
                      type="text"
                      value={settings.company_pan}
                      onChange={(e) => handleChange("company_pan", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    Bank Account for Customer Invoices & Receipts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={settings.bank_name}
                        onChange={(e) => handleChange("bank_name", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        value={settings.bank_account_name}
                        onChange={(e) => handleChange("bank_account_name", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={settings.bank_account_number}
                        onChange={(e) => handleChange("bank_account_number", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={settings.bank_ifsc}
                        onChange={(e) => handleChange("bank_ifsc", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        UPI VPA
                      </label>
                      <input
                        type="text"
                        value={settings.bank_upi}
                        onChange={(e) => handleChange("bank_upi", e.target.value)}
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. WhatsApp Tab */}
            {activeTab === "whatsapp" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-700" />
                    WhatsApp Cloud API & Automations
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      isWhatsAppConfigured
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {isWhatsAppConfigured ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Connected & Active
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Integration not configured
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Connect your official Meta WhatsApp Business Cloud API account to send automated booking confirmations, visa updates, and payment receipts.
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    System User Permanent Access Token
                  </label>
                  <input
                    type="password"
                    placeholder="EAAG..."
                    value={settings.whatsapp_api_token}
                    onChange={(e) => handleChange("whatsapp_api_token", e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Generated from Meta Business Manager &gt; System Users
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 102938475610293"
                      value={settings.whatsapp_phone_number_id}
                      onChange={(e) =>
                        handleChange("whatsapp_phone_number_id", e.target.value)
                      }
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Webhook Verification Token
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. algafur_verify_token_2026"
                      value={settings.whatsapp_webhook_token}
                      onChange={(e) =>
                        handleChange("whatsapp_webhook_token", e.target.value)
                      }
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
                  <p className="font-bold text-slate-800">Direct Webhook Endpoint:</p>
                  <p className="font-mono text-emerald-800">
                    https://algafurtours.com/api/webhooks/whatsapp
                  </p>
                </div>
              </div>
            )}

            {/* 6. AI Studio Tab */}
            {activeTab === "ai" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    AI Marketing Studio & Google Gemini API
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      isAIConfigured
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {isAIConfigured ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Gemini Pro Active
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Integration not configured
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Powers the multilingual copywriting engine, social poster copy, and automated WhatsApp broadcasts. If key is empty, the platform seamlessly uses the built-in Islamic travel copy engine.
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={settings.ai_gemini_api_key}
                    onChange={(e) => handleChange("ai_gemini_api_key", e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Obtained from Google AI Studio (aistudio.google.com)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Preferred Model
                    </label>
                    <select
                      value={settings.ai_model_name}
                      onChange={(e) => handleChange("ai_model_name", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Low Cost)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Multilingual Nuance)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Built-in High-Fidelity Fallback
                    </label>
                    <select
                      value={settings.ai_fallback_enabled}
                      onChange={(e) => handleChange("ai_fallback_enabled", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="true">Enabled (Guarantees zero downtime)</option>
                      <option value="false">Disabled</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Payment Gateways Tab */}
            {activeTab === "payment" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    Payment Gateway (Razorpay / Stripe)
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      isPaymentGatewayConfigured
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {isPaymentGatewayConfigured
                      ? "Gateway Connected"
                      : "Direct Bank & UPI Active"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Key ID
                    </label>
                    <input
                      type="text"
                      placeholder="rzp_live_..."
                      value={settings.razorpay_key_id}
                      onChange={(e) => handleChange("razorpay_key_id", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Key Secret
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={settings.razorpay_key_secret}
                      onChange={(e) => handleChange("razorpay_key_secret", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 8. Localization Tab */}
            {activeTab === "localization" && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b pb-2 border-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  Multilingual & Currency Configuration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Default Currency
                    </label>
                    <select
                      value={settings.default_currency}
                      onChange={(e) => handleChange("default_currency", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="INR (₹)">Indian Rupee (INR ₹)</option>
                      <option value="SAR (ر.س)">Saudi Riyal (SAR)</option>
                      <option value="USD ($)">US Dollar (USD $)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Default Language
                    </label>
                    <select
                      value={settings.default_language}
                      onChange={(e) => handleChange("default_language", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi (हिंदी)</option>
                      <option value="mr">Marathi (मराठी)</option>
                      <option value="ur">Urdu (اردو)</option>
                      <option value="ar">Arabic (العربية)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Timezone
                    </label>
                    <input
                      type="text"
                      value={settings.timezone}
                      onChange={(e) => handleChange("timezone", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Action */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  "Saving Settings..."
                ) : savedSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-300" />
                    Saved Successfully!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
