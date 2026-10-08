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
  Key,
} from "lucide-react";

interface Props {
  initialSettings: Record<string, string>;
}

export default function AdminSettingsClient({ initialSettings }: Props) {
  const [activeTab, setActiveTab] = useState<
    "company" | "whatsapp" | "ai" | "payment" | "localization"
  >("company");
  const [settings, setSettings] = useState<Record<string, string>>({
    company_name: initialSettings.company_name || "AL-GAFUR International Tours And Travels",
    company_tagline: initialSettings.company_tagline || "Your Sacred Journey, Handled With Care",
    company_phone_1: initialSettings.company_phone_1 || "+91 9890708013",
    company_phone_2: initialSettings.company_phone_2 || "+91 8793939393",
    company_email: initialSettings.company_email || "info@algafurtours.com",
    company_address:
      initialSettings.company_address ||
      "Head Office: Mumbai / Latur, Maharashtra, India",
    company_license: initialSettings.company_license || "Hajj & Umrah Tour Operator Lic #MH-2026-9812",
    company_gstin: initialSettings.company_gstin || "27AABCA1234F1Z5",
    company_pan: initialSettings.company_pan || "AABCA1234F",
    bank_name: initialSettings.bank_name || "HDFC Bank Limited",
    bank_account_name:
      initialSettings.bank_account_name || "AL GAFUR INTERNATIONAL TOURS AND TRAVELS",
    bank_account_number: initialSettings.bank_account_number || "50200088991234",
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
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-emerald-700" />
            System Administration & Integrations
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Configure agency details, WhatsApp Cloud API tokens, Google Gemini credentials, and banking remittances.
          </p>
        </div>
        <button
          onClick={handleSave}
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
              Save Settings
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Navigation Tabs */}
        <div className="lg:col-span-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1 h-fit">
          {[
            { id: "company", label: "Agency & Banking", icon: Building },
            { id: "whatsapp", label: "WhatsApp Cloud API", icon: MessageCircle },
            { id: "ai", label: "AI Marketing Studio", icon: Sparkles },
            { id: "payment", label: "Payment Gateways", icon: CreditCard },
            { id: "localization", label: "Languages & Currency", icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
            {/* Company & Banking Tab */}
            {activeTab === "company" && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b pb-2 border-slate-100 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-700" />
                  Official Agency Profile & Banking Remittance
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Agency Name
                    </label>
                    <input
                      type="text"
                      value={settings.company_name}
                      onChange={(e) => handleChange("company_name", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Brand Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.company_tagline}
                      onChange={(e) => handleChange("company_tagline", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Primary Phone
                    </label>
                    <input
                      type="text"
                      value={settings.company_phone_1}
                      onChange={(e) => handleChange("company_phone_1", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Secondary Helpline
                    </label>
                    <input
                      type="text"
                      value={settings.company_phone_2}
                      onChange={(e) => handleChange("company_phone_2", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={settings.company_email}
                      onChange={(e) => handleChange("company_email", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Tour Operator License
                    </label>
                    <input
                      type="text"
                      value={settings.company_license}
                      onChange={(e) => handleChange("company_license", e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
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
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
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
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Head Office Registered Address
                  </label>
                  <textarea
                    rows={2}
                    value={settings.company_address}
                    onChange={(e) => handleChange("company_address", e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                  />
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
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
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
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-semibold"
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
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
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
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp Tab */}
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
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
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
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
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
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
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

            {/* AI Marketing Studio Tab */}
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
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Obtained from Google AI Studio (console.cloud.google.com / aistudio.google.com)
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
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
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
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="true">Enabled (Guarantees zero downtime)</option>
                      <option value="false">Disabled</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Gateways Tab */}
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
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
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
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Localization Tab */}
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
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-semibold"
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
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
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
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

