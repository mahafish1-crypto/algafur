"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquareCode,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Zap,
  Bot,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Code2,
  FileJson,
  Building,
  Plane,
  Star,
  CheckCircle2,
} from "lucide-react";

interface Props {
  initialApiKey: string;
  endpointUrl: string;
  initialWebhookUrl: string;
}

export default function WhatsAppApiSettingsClient({
  initialApiKey,
  endpointUrl,
  initialWebhookUrl,
}: Props) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Regeneration state
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Live JSON Preview State
  const [liveData, setLiveData] = useState<any | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Fetch live preview on mount or when API key changes
  const fetchLivePreview = async (keyToUse = apiKey) => {
    setIsLoadingPreview(true);
    setPreviewError(null);
    try {
      const res = await fetch(`/api/v1/whatsapp/summary?api_key=${encodeURIComponent(keyToUse)}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}: Failed to fetch live data`);
      }
      const data = await res.json();
      setLiveData(data);
    } catch (err: any) {
      setPreviewError(err.message || "Failed to load live payload");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    fetchLivePreview(initialApiKey);
  }, [initialApiKey]);

  const copyToClipboard = (text: string, setCopiedState: (v: boolean) => void) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    }
  };

  const handleRegenerateKey = async () => {
    setIsRegenerating(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/whatsapp-api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to regenerate API key");
      }

      setApiKey(data.apiKey);
      setWebhookUrl(data.webhookUrl);
      setStatusMessage({
        type: "success",
        text: "API Key regenerated successfully. Remember to update your WhatsApp bots with the new token.",
      });
      setConfirmModalOpen(false);

      // Re-fetch preview with new key
      fetchLivePreview(data.apiKey);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to regenerate key",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* 1. Breadcrumbs & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Link href="/admin/settings" className="hover:text-gold-400 transition-colors">
            Settings
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href="/admin/settings?tab=whatsapp"
            className="hover:text-gold-400 transition-colors"
          >
            WhatsApp
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-medium">Bot Automation API</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <MessageSquareCode className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-serif font-bold text-white">
                  WhatsApp Automation &amp; Bot Integration (A to Z API)
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-performance read-only API delivering comprehensive package specifications, verified hotel proximities, and pricing to chatbot engines.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/admin/settings?tab=whatsapp"
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to WhatsApp Settings
          </Link>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/40 border-red-500/30 text-red-300"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Platform Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
          Certified Compatible With:
        </span>
        {["AiSensy", "Wati", "Botpress", "Gallabox", "Interakt", "Make / Zapier", "Custom Webhooks"].map(
          (bot, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium text-[11px]"
            >
              {bot}
            </span>
          )
        )}
      </div>

      {/* 3. Credentials & Endpoints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: API Endpoint, Secret Key, and Ready Webhook (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Endpoint Specification */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-gold-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  1. Public Read-Only Endpoint
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  GET
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  300s Edge Cache
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">
                Summary API Endpoint (All Active Packages &amp; Stays)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={endpointUrl}
                  className="w-full text-xs font-mono bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3.5 py-2.5 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(endpointUrl, setCopiedEndpoint)}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors border border-slate-700"
                >
                  {copiedEndpoint ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card: Secret Key Management */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  2. Active API Secret Token
                </h2>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                WHATSAPP_API_KEY
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Provide this token in requests via header{" "}
              <code className="text-gold-300 bg-slate-950 px-1.5 py-0.5 rounded text-[11px]">
                Authorization: Bearer &lt;key&gt;
              </code>{" "}
              or parameter{" "}
              <code className="text-gold-300 bg-slate-950 px-1.5 py-0.5 rounded text-[11px]">
                ?api_key=&lt;key&gt;
              </code>
              .
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">
                Secret Token
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? "text" : "password"}
                    readOnly
                    value={apiKey}
                    className="w-full text-xs font-mono bg-slate-950 text-gold-300 border border-slate-800 rounded-xl px-3.5 py-2.5 pr-10 select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    title={showKey ? "Hide Secret" : "Reveal Secret"}
                  >
                    {showKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(apiKey, setCopiedKey)}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors border border-slate-700"
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Key
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(true)}
                  className="px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors border border-amber-500/30"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              </div>
            </div>
          </div>

          {/* Card: Ready-to-Use Webhook URL */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  3. Ready-to-Use Bot Webhook URL
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Plug &amp; Play
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Copy this single URL directly into your chatbot platform (AiSensy, Wati, Botpress, Gallabox). It includes your authentication parameter and returns the complete A-to-Z JSON payload automatically.
            </p>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full text-xs font-mono bg-slate-950 text-emerald-300 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(webhookUrl, setCopiedWebhook)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-md"
                >
                  {copiedWebhook ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Webhook
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href={webhookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Test API Response in Browser Tab
              </a>
              <span className="text-[11px] text-slate-400">
                Never exposes private leads or user passwords
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Bot Setup Guide (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bot className="w-4 h-4 text-gold-400" />
              Bot Integration Quickstart
            </h3>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-gold-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <strong className="text-white block">Add HTTP Request Block</strong>
                  <span>In your chatbot flow (e.g. AiSensy or Wati), create an HTTP GET Action.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-gold-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <strong className="text-white block">Paste Ready-to-Use Webhook</strong>
                  <span>Paste the webhook URL above into the request URL field.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-gold-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <strong className="text-white block">Dynamic Response Mapping</strong>
                  <span>
                    Access attributes dynamically in your WhatsApp message template:
                  </span>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 space-y-1 mt-2">
                    <div>• packages[0].title</div>
                    <div>• packages[0].pricing.startingPrice</div>
                    <div>• packages[0].hotels.makkah.name</div>
                    <div>• packages[0].publicUrl</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <strong className="text-slate-300 block">Edge Caching Notice:</strong>
              <span>
                Responses are cached at the edge for 5 minutes. Any updates you make in the Admin Package CMS automatically propagate within 300 seconds.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live JSON Payload Inspector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <FileJson className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                Live JSON Payload Inspector
              </h2>
              <p className="text-xs text-slate-400">
                Real-time output delivered to your WhatsApp bot engine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {liveData?.packages && (
              <span className="text-[11px] font-semibold bg-emerald-950 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30">
                {liveData.packages.length} Active Package(s)
              </span>
            )}
            {liveData?.testimonials && (
              <span className="text-[11px] font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
                {liveData.testimonials.length} Testimonial(s)
              </span>
            )}

            <button
              type="button"
              onClick={() => fetchLivePreview()}
              disabled={isLoadingPreview}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoadingPreview ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            {liveData && (
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(JSON.stringify(liveData, null, 2), setCopiedJson)
                }
                className="px-3.5 py-1.5 bg-gold-500 hover:bg-gold-400 text-forest-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copiedJson ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied JSON
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Payload
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {previewError && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
            {previewError}
          </div>
        )}

        {isLoadingPreview && !liveData && (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gold-400 mb-2" />
            Fetching live payload from /api/v1/whatsapp/summary...
          </div>
        )}

        {liveData && (
          <div className="space-y-4">
            {/* Quick Cards of Packages included in payload */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(liveData.packages || []).map((pkg: any) => (
                <div
                  key={pkg.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                      {pkg.packageType}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ₹{pkg.pricing?.startingPrice?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-white truncate">
                    {pkg.title}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>{pkg.totalDurationDays} Days</span>
                    <span>
                      {pkg.stayBreakdown?.makkahNights}N Makkah • {pkg.stayBreakdown?.madinahNights}N Madinah
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Raw JSON Code Box */}
            <div className="relative">
              <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-[11px] font-mono text-emerald-300 max-h-96 overflow-y-auto overflow-x-auto leading-relaxed select-all">
                {JSON.stringify(liveData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Regenerate */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">
                Regenerate WhatsApp API Secret Key?
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Regenerating this key will immediately revoke the existing token. Any connected WhatsApp chatbots or webhook integrations currently using the old key will stop working until you update them with the new key.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                disabled={isRegenerating}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateKey}
                disabled={isRegenerating}
                className="px-4 py-2 rounded-xl text-xs font-bold text-forest-950 bg-gradient-to-r from-amber-400 to-gold-500 hover:from-amber-300 hover:to-gold-400 transition-all shadow-md flex items-center gap-1.5"
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  "Yes, Regenerate Key"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

