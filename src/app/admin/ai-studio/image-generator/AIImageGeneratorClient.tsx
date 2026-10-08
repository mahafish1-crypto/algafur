"use client";

import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Download,
  Share2,
  Sparkles,
  Smartphone,
  Square,
  Monitor,
  Check,
  Palette,
  Phone,
  Layers,
} from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";

export default function AIImageGeneratorClient() {
  const [aspectRatio, setAspectRatio] = useState<"square" | "story" | "landscape">("square");
  const [theme, setTheme] = useState<"emerald" | "charcoal" | "royal" | "ivory">("emerald");

  // Poster fields
  const [headline, setHeadline] = useState("UMRAH PLATINUM PACKAGE");
  const [hijriYear, setHijriYear] = useState("2026 / 1448 Hijri");
  const [duration, setDuration] = useState("20 Days (12N Makkah &bull; 7N Madinah)");
  const [departureDate, setDepartureDate] = useState("31 Oct – 19 Nov 2026");
  const [price, setPrice] = useState("₹1,20,000");
  const [hotelInfo, setHotelInfo] = useState("Diyafa Jamal (500m) & Ilaf Kuba (400m)");
  const [scholars, setScholars] = useState("Guided by Hafiz Asrar Sahab & Hafiz Sameer Madani");
  const [contactNumber, setContactNumber] = useState("+91 9890708013 / +91 8793939393");
  const [downloading, setDownloading] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);

  const themeStyles = {
    emerald: {
      bg: "bg-gradient-to-b from-[#064e3b] via-[#02261b] to-[#01140e]",
      cardBorder: "border-[#c59b27]/60",
      accentText: "text-[#e6ca65]",
      badgeBg: "bg-[#c59b27] text-slate-950",
      boxBg: "bg-black/40 border-[#c59b27]/30",
    },
    charcoal: {
      bg: "bg-gradient-to-b from-[#18181b] via-[#09090b] to-[#000000]",
      cardBorder: "border-[#c59b27]/80",
      accentText: "text-[#fbbf24]",
      badgeBg: "bg-[#fbbf24] text-slate-950",
      boxBg: "bg-white/5 border-amber-500/30",
    },
    royal: {
      bg: "bg-gradient-to-b from-[#0f2e24] via-[#0a1f18] to-[#05110d]",
      cardBorder: "border-amber-400/50",
      accentText: "text-amber-300",
      badgeBg: "bg-amber-400 text-slate-950",
      boxBg: "bg-emerald-950/60 border-amber-400/30",
    },
    ivory: {
      bg: "bg-gradient-to-b from-[#fcfbf7] via-[#f5f2e9] to-[#ece5d4]",
      cardBorder: "border-[#064e3b]/30",
      accentText: "text-[#064e3b]",
      badgeBg: "bg-[#064e3b] text-white",
      boxBg: "bg-white/90 border-[#064e3b]/20 text-slate-800",
    },
  };

  const currentTheme = themeStyles[theme];

  const handleDownloadImage = () => {
    setDownloading(true);
    // Alert user that SVG/PNG render is prepared
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ImageIcon className="w-7 h-7 text-emerald-700" />
          AI Creative Graphic Studio & Social Poster Generator
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Generate pixel-perfect branded social media creatives, WhatsApp status cards, and package posters featuring the official Al-Gafur identity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Design Controls */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b pb-3 border-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            Poster Customizer
          </h2>

          {/* Format Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Select Creative Size / Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio("square")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  aspectRatio === "square"
                    ? "border-emerald-800 bg-emerald-50 text-emerald-900 font-bold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                1:1 Post
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("story")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  aspectRatio === "story"
                    ? "border-emerald-800 bg-emerald-50 text-emerald-900 font-bold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                9:16 Story
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("landscape")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  aspectRatio === "landscape"
                    ? "border-emerald-800 bg-emerald-50 text-emerald-900 font-bold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                16:9 Banner
              </button>
            </div>
          </div>

          {/* Theme Palette */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Color Palette & Style
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: "emerald", label: "Emerald & Gold (Royal)" },
                { id: "charcoal", label: "Charcoal & Kaaba Glow" },
                { id: "royal", label: "Forest Green Classic" },
                { id: "ivory", label: "Ivory Luxury Light" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as any)}
                  className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                    theme === t.id
                      ? "border-emerald-800 bg-emerald-50 font-semibold text-emerald-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>{t.label}</span>
                  {theme === t.id && <Check className="w-3.5 h-3.5 text-emerald-800" />}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Headline Title
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Hijri Year / Tag
                </label>
                <input
                  type="text"
                  value={hijriYear}
                  onChange={(e) => setHijriYear(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Price Starting From
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 font-bold text-emerald-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Duration & Stays
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Departure Dates
                </label>
                <input
                  type="text"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Hotel Stays & Distance
              </label>
              <input
                type="text"
                value={hotelInfo}
                onChange={(e) => setHotelInfo(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Scholarly Guidance
              </label>
              <input
                type="text"
                value={scholars}
                onChange={(e) => setScholars(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Contact Numbers
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 hover:to-slate-900 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4 text-amber-300" />
              Download High-Res Creative
            </button>
          </div>
        </div>

        {/* Live Canvas / Poster Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-100 p-6 rounded-2xl border border-slate-200 min-h-[500px]">
          <div
            ref={posterRef}
            className={`relative overflow-hidden transition-all duration-300 shadow-2xl border-2 ${
              currentTheme.cardBorder
            } ${currentTheme.bg} ${
              aspectRatio === "square"
                ? "w-full max-w-[460px] aspect-square"
                : aspectRatio === "story"
                ? "w-full max-w-[340px] aspect-[9/16]"
                : "w-full max-w-[560px] aspect-video"
            } p-6 flex flex-col justify-between text-white`}
          >
            {/* Top Bar with Brand Logo and Badge */}
            <div className="flex items-center justify-between border-b border-amber-400/30 pb-3 z-10">
              <div className="bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                <BrandLogo variant={theme === "ivory" ? "default" : "light"} size="sm" />
              </div>
              <div
                className={`text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm ${currentTheme.badgeBg}`}
              >
                Govt. Approved
              </div>
            </div>

            {/* Spiritual Watermark Silhouette */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="w-64 h-64 border-4 border-amber-400 rotate-45 rounded-3xl" />
            </div>

            {/* Poster Main Content */}
            <div className="space-y-3 z-10 my-auto py-2">
              <div className="text-center">
                <span className={`text-[10px] tracking-widest uppercase font-semibold ${currentTheme.accentText}`}>
                  {hijriYear}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5 uppercase drop-shadow-md">
                  {headline}
                </h3>
                <p className="text-[11px] opacity-80 mt-0.5">{duration}</p>
              </div>

              {/* Price Banner */}
              <div className="flex justify-center">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-lg ${
                    theme === "ivory"
                      ? "bg-emerald-900 text-amber-300 border-amber-400"
                      : "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-black border-amber-300"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider">All-Inclusive:</span>
                  <span className="text-lg font-black">{price}/-</span>
                </div>
              </div>

              {/* Features Grid */}
              <div
                className={`p-3 rounded-xl border text-[10px] backdrop-blur-sm space-y-1.5 ${currentTheme.boxBg}`}
              >
                <div className="flex items-center justify-between">
                  <span className="opacity-80">Departure Date:</span>
                  <span className="font-bold">{departureDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-80">Hotels:</span>
                  <span className="font-bold truncate max-w-[200px]">{hotelInfo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-80">Scholars:</span>
                  <span className={`font-semibold ${currentTheme.accentText} truncate max-w-[190px]`}>
                    {scholars}
                  </span>
                </div>
                <div className="pt-1 border-t border-white/10 flex items-center justify-around text-[9px] opacity-90 font-medium">
                  <span>✔ Direct Flight</span>
                  <span>✔ Umrah Visa</span>
                  <span>✔ 5 Umrahs</span>
                  <span>✔ Indian Buffet</span>
                </div>
              </div>
            </div>

            {/* Footer with Contact and CTA */}
            <div className="border-t border-amber-400/30 pt-2.5 flex items-center justify-between z-10 text-[10px]">
              <div>
                <p className="text-[9px] uppercase tracking-wider opacity-75">Booking Helpline:</p>
                <p className="font-bold tracking-wide font-mono flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5 text-amber-400" />
                  {contactNumber}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${currentTheme.badgeBg}`}
              >
                Book Now
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4 text-center">
            Preview is live and rendered to scale. Click "Download High-Res Creative" to export for social media.
          </p>
        </div>
      </div>
    </div>
  );
}
