"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/brand/BrandLogo";
import type { FormQuestion } from "@/lib/youtube-leads";
import LocationInputModule from "./LocationInputModule";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Lock,
  Phone,
  MessageCircle,
  Send,
} from "lucide-react";
import { trackMetaLead } from "@/lib/meta-pixel-events";

export interface PublicLeadFormData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  campaignName: string | null;
  packageId: string | null;
  packageName: string | null;
  successTitle: string;
  successMessage: string;
  submitButtonText: string;
  showLogo: boolean;
  status: string;
  isActive: boolean;
  version: number;
  questions: FormQuestion[];
}

export default function PublicLeadFormClient({
  form,
  siteLogo,
  supportPhone = "+91 8793939393",
  whatsappNumber = "919890708013",
  isPreview = false,
}: {
  form: PublicLeadFormData;
  siteLogo?: string;
  supportPhone?: string;
  whatsappNumber?: string;
  isPreview?: boolean;
}) {
  const searchParams = useSearchParams();

  // Initialize answers state
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    for (const q of form.questions) {
      if (q.type === "CHECKBOXES") {
        init[q.id] = [];
      } else if (q.type === "CONSENT") {
        init[q.id] = false;
      } else if (q.type === "LOCATION") {
        init[q.id] = { locationSource: "MANUAL" };
      } else {
        init[q.id] = "";
      }
    }
    return init;
  });

  const [honeypot, setHoneypot] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    submissionCode: string;
    successTitle: string;
    successMessage: string;
  } | null>(null);

  // Stable idempotency token per form session
  const [submissionToken, setSubmissionToken] = useState<string>(() => {
    return `ytl_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  });

  const isFormOpen = form.status === "PUBLISHED" && form.isActive;

  // Read URL tracking params without fabricating anything
  const trackingParams = useMemo(() => {
    return {
      utm_source: searchParams?.get("utm_source") || null,
      utm_medium: searchParams?.get("utm_medium") || null,
      utm_campaign: searchParams?.get("utm_campaign") || null,
      utm_content: searchParams?.get("utm_content") || null,
      utm_term: searchParams?.get("utm_term") || null,
      videoId:
        searchParams?.get("v") ||
        searchParams?.get("video_id") ||
        searchParams?.get("yt_video") ||
        null,
      videoUrl: searchParams?.get("video") || searchParams?.get("video_url") || null,
      campaignName: searchParams?.get("campaign") || null,
      source: searchParams?.get("source") || null,
    };
  }, [searchParams]);

  const handleValueChange = (qId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    if (fieldErrors[qId]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[qId];
        return copy;
      });
    }
    if (formError) setFormError(null);
  };

  const handleCheckboxToggle = (qId: string, option: string) => {
    const current: string[] = Array.isArray(answers[qId]) ? answers[qId] : [];
    const next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    handleValueChange(qId, next);
  };

  const validateClientSide = (): boolean => {
    const nextErrors: Record<string, string> = {};
    for (const q of form.questions) {
      const val = answers[q.id];
      if (q.type === "CONSENT") {
        if (q.required && val !== true) {
          nextErrors[q.id] = "Please check this box to proceed.";
        }
        continue;
      }
      if (q.type === "CHECKBOXES") {
        const arr = Array.isArray(val) ? val : [];
        if (q.required && arr.length === 0) {
          nextErrors[q.id] = "Please select at least one option.";
        }
        continue;
      }
      if (q.type === "LOCATION") {
        let city = "";
        if (typeof val === "object" && val !== null) {
          city = String(val.city || val.address || val.state || "").trim();
        } else if (typeof val === "string") {
          city = val.trim();
        }
        if (q.required && !city) {
          nextErrors[q.id] = `"${q.label}" is required. Please detect your location or enter your city.`;
        }
        continue;
      }

      const strVal = String(val ?? "").trim();
      if (q.required && !strVal) {
        nextErrors[q.id] = `"${q.label}" is required.`;
      } else if (strVal) {
        if (q.type === "PHONE") {
          const digits = strVal.replace(/\D/g, "");
          if (digits.length < 10 || digits.length > 15) {
            nextErrors[q.id] = "Please enter a valid 10 to 15 digit phone number.";
          }
        } else if (q.type === "EMAIL") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) {
            nextErrors[q.id] = "Please enter a valid email address.";
          }
        } else if (q.type === "NUMBER") {
          const num = Number(strVal);
          if (!Number.isFinite(num)) {
            nextErrors[q.id] = "Please enter a valid number.";
          }
        }
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      if (validateClientSide()) {
        setSubmittedResult({
          submissionCode: "YTL-PREVIEW-0001",
          successTitle: form.successTitle,
          successMessage: form.successMessage,
        });
      }
      return;
    }

    if (submitting || !isFormOpen) return;

    if (!validateClientSide()) {
      setFormError("Please review the highlighted fields below.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const landingPage =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : `/lead/${form.slug}`;
      const referrer =
        typeof document !== "undefined" && document.referrer
          ? document.referrer
          : null;

      const res = await fetch("/api/youtube-leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: form.id,
          formSlug: form.slug,
          answers,
          website_url: honeypot,
          submissionToken,
          utm_source: trackingParams.utm_source,
          utm_medium: trackingParams.utm_medium,
          utm_campaign: trackingParams.utm_campaign,
          utm_content: trackingParams.utm_content,
          utm_term: trackingParams.utm_term,
          videoId: trackingParams.videoId,
          videoUrl: trackingParams.videoUrl,
          campaignName: trackingParams.campaignName,
          leadSource: trackingParams.source,
          landingPage,
          referrer,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.fieldErrors && typeof data.fieldErrors === "object") {
          setFieldErrors(data.fieldErrors);
        }
        throw new Error(
          data.error || "Unable to submit your enquiry. Please check your details."
        );
      }

      trackMetaLead({
        leadType: "youtube_lead",
        formTitle: form.title,
        packageName: form.packageName || undefined,
        campaignName: trackingParams.campaignName || form.campaignName || undefined,
      });

      setSubmittedResult({
        submissionCode: data.submissionCode,
        successTitle: data.successTitle || form.successTitle,
        successMessage: data.successMessage || form.successMessage,
      });
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Network error. Please try submitting again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedResult(null);
    setSubmissionToken(
      `ytl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
    );
  };

  if (!isFormOpen && !isPreview) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-lg p-8 sm:p-10 text-center space-y-5">
          {form.showLogo && (
            <div className="flex justify-center">
              <BrandLogo variant="default" size="md" href="/" customLogoUrl={siteLogo} />
            </div>
          )}
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#0D3B2E]">
            {form.title}
          </h1>
          <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            This campaign form is currently closed and no longer accepting new
            online responses. You can still reach our Hajj &amp; Umrah advisors
            directly below.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/packages"
              className="px-5 py-2.5 rounded-xl bg-[#0D3B2E] text-white text-xs font-bold hover:bg-[#165543] transition-colors"
            >
              Explore Current Packages
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (submittedResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-[#0D3B2E] via-emerald-700 to-[#C8A45D]" />
          <div className="p-8 sm:p-10 text-center space-y-5">
            {form.showLogo && (
              <div className="flex justify-center pb-2">
                <BrandLogo
                  variant="default"
                  size="md"
                  href="/"
                  customLogoUrl={siteLogo}
                />
              </div>
            )}

            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                Reference ID: {submittedResult.submissionCode}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0D3B2E]">
                {submittedResult.successTitle}
              </h2>
              <p className="text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
                {submittedResult.successMessage}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Assalamu Alaikum! I just submitted the form "${form.title}" (Ref: ${submittedResult.submissionCode}). Please share the package details.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Connect Instantly on WhatsApp
              </a>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#0D3B2E] text-xs font-bold transition-colors"
              >
                View 2026–2027 Packages
              </Link>
              {isPreview && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Back to Preview Form
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-5">
      {/* Google Forms-Style Header Card */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-md overflow-hidden">
        <div className="h-3.5 bg-gradient-to-r from-[#0D3B2E] via-emerald-700 to-[#C8A45D]" />
        <div className="p-6 sm:p-8 space-y-4">
          {form.showLogo && (
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-neutral-100">
              <BrandLogo
                variant="default"
                size="sm"
                href="/"
                customLogoUrl={siteLogo}
              />
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-[#C8A45D]" />
                Official Pilgrim Registration Form
              </span>
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0D3B2E] leading-tight">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {form.description}
              </p>
            )}
          </div>

          {form.packageName && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  Featured Package
                </span>
                <span className="font-bold text-[#0D3B2E]">
                  {form.packageName}
                </span>
              </div>
              <Link
                href="/packages"
                className="text-xs font-bold text-emerald-800 hover:underline shrink-0"
              >
                View Details →
              </Link>
            </div>
          )}

          <p className="text-xs text-rose-600 font-semibold pt-1">
            * Indicates required question
          </p>
        </div>
      </div>

      {/* Form Error Banner */}
      {formError && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-start gap-3 text-xs font-medium"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* Questions Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Honeypot field (hidden from real users) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website_url_hp">Website</label>
          <input
            id="website_url_hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {form.questions.map((q) => {
          const errorMsg = fieldErrors[q.id];
          const inputId = `field_${q.id}`;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs transition-all space-y-2.5 ${
                errorMsg
                  ? "border-rose-400 ring-1 ring-rose-200"
                  : "border-neutral-200 focus-within:border-[#0D3B2E]"
              }`}
            >
              {/* LOCATION */}
              {q.type === "LOCATION" && (
                <LocationInputModule
                  id={inputId}
                  label={q.label}
                  required={q.required}
                  helperText={q.helperText}
                  placeholder={
                    q.placeholder ||
                    "Click 'Detect My Location' or type city/district"
                  }
                  value={answers[q.id]}
                  onChange={(val) => handleValueChange(q.id, val)}
                  error={errorMsg}
                />
              )}

              {q.type !== "CONSENT" && q.type !== "LOCATION" && (
                <div>
                  <label
                    htmlFor={inputId}
                    className="block text-sm font-bold text-neutral-900"
                  >
                    {q.label}
                    {q.required && (
                      <span className="text-rose-600 ml-1" aria-hidden="true">
                        *
                      </span>
                    )}
                  </label>
                  {q.helperText && (
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {q.helperText}
                    </p>
                  )}
                </div>
              )}

              {/* SHORT_TEXT */}
              {q.type === "SHORT_TEXT" && (
                <input
                  id={inputId}
                  type="text"
                  required={q.required}
                  value={answers[q.id] || ""}
                  onChange={(e) => handleValueChange(q.id, e.target.value)}
                  placeholder={q.placeholder || "Your answer"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0D3B2E] focus:ring-2 focus:ring-emerald-900/10"
                />
              )}

              {/* PARAGRAPH */}
              {q.type === "PARAGRAPH" && (
                <textarea
                  id={inputId}
                  rows={3}
                  required={q.required}
                  value={answers[q.id] || ""}
                  onChange={(e) => handleValueChange(q.id, e.target.value)}
                  placeholder={q.placeholder || "Your detailed answer"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0D3B2E] focus:ring-2 focus:ring-emerald-900/10"
                />
              )}

              {/* PHONE */}
              {q.type === "PHONE" && (
                <input
                  id={inputId}
                  type="tel"
                  inputMode="tel"
                  required={q.required}
                  value={answers[q.id] || ""}
                  onChange={(e) => handleValueChange(q.id, e.target.value)}
                  placeholder={q.placeholder || "+91 98XXXXXXXX"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0D3B2E] focus:ring-2 focus:ring-emerald-900/10"
                />
              )}

              {/* EMAIL */}
              {q.type === "EMAIL" && (
                <input
                  id={inputId}
                  type="email"
                  inputMode="email"
                  required={q.required}
                  value={answers[q.id] || ""}
                  onChange={(e) => handleValueChange(q.id, e.target.value)}
                  placeholder={q.placeholder || "name@example.com"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0D3B2E] focus:ring-2 focus:ring-emerald-900/10"
                />
              )}

              {/* NUMBER */}
              {q.type === "NUMBER" && (
                <input
                  id={inputId}
                  type="number"
                  inputMode="numeric"
                  min={q.validation?.min ?? 1}
                  max={q.validation?.max ?? 100}
                  required={q.required}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => handleValueChange(q.id, e.target.value)}
                  placeholder={q.placeholder || "e.g. 2"}
                  className="w-full sm:w-56 px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0D3B2E] focus:ring-2 focus:ring-emerald-900/10"
                />
              )}

              {/* DATE */}
              {q.type === "DATE" && (
                <input
                  id={inputId}
                  type="date"
                  required={q.required}
                  value={answers[q.id] || ""}
                  onChange={(e) => handleValueChange(q.id, e.target.value)}
                  className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0D3B2E] focus:ring-2 focus:ring-emerald-900/10"
                />
              )}

              {/* DROPDOWN */}
              {q.type === "DROPDOWN" && (
                <select
                  id={inputId}
                  required={q.required}
                  value={answers[q.id] || ""}
                  onChange={(e) => handleValueChange(q.id, e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:border-[#0D3B2E] focus:ring-2 focus:ring-emerald-900/10"
                >
                  <option value="">Choose an option...</option>
                  {(q.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {/* RADIO */}
              {q.type === "RADIO" && (
                <div className="space-y-2 pt-1" role="radiogroup" aria-label={q.label}>
                  {(q.options || []).map((opt) => {
                    const checked = answers[q.id] === opt;
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-sm transition-all ${
                          checked
                            ? "bg-emerald-50/80 border-[#0D3B2E] text-[#0D3B2E] font-semibold"
                            : "bg-neutral-50/60 border-neutral-200 text-neutral-800 hover:bg-neutral-100/70"
                        }`}
                      >
                        <input
                          type="radio"
                          name={inputId}
                          value={opt}
                          checked={checked}
                          onChange={() => handleValueChange(q.id, opt)}
                          className="w-4 h-4 accent-[#0D3B2E]"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* CHECKBOXES */}
              {q.type === "CHECKBOXES" && (
                <div className="space-y-2 pt-1" role="group" aria-label={q.label}>
                  {(q.options || []).map((opt) => {
                    const selectedList: string[] = Array.isArray(answers[q.id])
                      ? answers[q.id]
                      : [];
                    const checked = selectedList.includes(opt);
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-sm transition-all ${
                          checked
                            ? "bg-emerald-50/80 border-[#0D3B2E] text-[#0D3B2E] font-semibold"
                            : "bg-neutral-50/60 border-neutral-200 text-neutral-800 hover:bg-neutral-100/70"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleCheckboxToggle(q.id, opt)}
                          className="w-4 h-4 accent-[#0D3B2E] rounded"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* YES_NO */}
              {q.type === "YES_NO" && (
                <div className="flex items-center gap-3 pt-1">
                  {["Yes", "No"].map((opt) => {
                    const checked = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleValueChange(q.id, opt)}
                        className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                          checked
                            ? "bg-[#0D3B2E] text-white border-[#0D3B2E] shadow-xs"
                            : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* CONSENT */}
              {q.type === "CONSENT" && (
                <div className="space-y-1.5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={Boolean(answers[q.id])}
                      onChange={(e) => handleValueChange(q.id, e.target.checked)}
                      className="w-4 h-4 mt-1 accent-[#0D3B2E] rounded shrink-0"
                    />
                    <span className="text-sm font-semibold text-neutral-800 leading-snug">
                      {q.label}
                      {q.required && (
                        <span className="text-rose-600 ml-1" aria-hidden="true">
                          *
                        </span>
                      )}
                    </span>
                  </label>
                  {q.helperText && (
                    <p className="text-xs text-neutral-500 pl-7">
                      {q.helperText}
                    </p>
                  )}
                </div>
              )}

              {errorMsg && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errorMsg}
                </p>
              )}
            </div>
          );
        })}

        {/* Submit Bar */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              No online payment or passport number required. Direct advisor
              callback.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0D3B2E] hover:bg-[#155240] disabled:opacity-60 text-white text-sm font-bold transition-all shadow-md shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#C8A45D]" />
                <span>Submitting enquiry…</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#C8A45D]" />
                <span>{form.submitButtonText || "Submit Enquiry"}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Direct Support Footer */}
      <div className="text-center text-xs text-neutral-500 pt-2 flex flex-wrap items-center justify-center gap-4">
        <a
          href={`tel:${supportPhone.replace(/\s+/g, "")}`}
          className="inline-flex items-center gap-1.5 hover:text-[#0D3B2E] font-medium"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-700" />
          Helpline: {supportPhone}
        </a>
        <span>•</span>
        <Link href="/privacy-policy" className="hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
