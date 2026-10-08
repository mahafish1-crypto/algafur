"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Send,
  MessageCircle,
  Video,
  FileText,
  Share2,
  RefreshCw,
  Globe,
  Layers,
} from "lucide-react";

interface PackageOption {
  id: string;
  name: string;
  durationDays: number;
  basePrice: number;
  departureDate?: string | null;
}

interface Props {
  packages: PackageOption[];
}

export default function AIContentGeneratorClient({ packages }: Props) {
  const [selectedPkg, setSelectedPkg] = useState(packages[0]?.name || "Umrah Platinum Package 2026");
  const [language, setLanguage] = useState<"English" | "Hindi" | "Marathi" | "Urdu" | "Arabic">("English");
  const [tone, setTone] = useState<
    "Spiritual & Reverent" | "Urgent & High Energy" | "Premium & Luxurious" | "Family Centric"
  >("Spiritual & Reverent");
  const [customNotes, setCustomNotes] = useState(
    "Direct flights from Mumbai, 500m walking distance to Haram, 5 guided Umrahs, Indian buffet meals."
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"caption" | "whatsapp" | "reel" | "short">("caption");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [generatedData, setGeneratedData] = useState<{
    headline: string;
    caption: string;
    cta: string;
    hashtags: string[];
    shortVersion: string;
    longVersion: string;
    whatsappVersion: string;
    reelScript?: string;
    provider?: string;
  }>({
    headline: "Your Sacred Journey, Handled With Care — Umrah Platinum Package 2026",
    caption:
      "Labbaik Allahumma Labbaik! ✨ Experience the blessed courtyards of Masjid Al-Haram and Masjid An-Nabawi with Al-Gafur International Tours And Travels. Complete peace of mind with direct flights, 4-star stays within walking distance, fresh Indian buffet, and scholarly guidance by Hafiz Asrar Sahab & Hafiz Sameer Madani.",
    cta: "Reserve Your Seat Today — Call +91 9890708013 / +91 8793939393",
    hashtags: ["#AlGafurTours", "#Umrah2026", "#HajjAndUmrah", "#Makkah", "#Madinah", "#SacredJourney"],
    shortVersion:
      "✨ Umrah Platinum Package 2026 | 20 Days | Direct Flights | Walking Distance to Haram | ₹1,20,000. Book now: +91 9890708013",
    longVersion:
      "Labbaik Allahumma Labbaik! ✨\n\nExperience the blessed courtyards of Masjid Al-Haram and Masjid An-Nabawi with Al-Gafur International Tours And Travels.\n\n🌟 Inclusions:\n✔ Direct Flight Return\n✔ Umrah Visa & Insurance\n✔ 12 Nights Makkah & 7 Nights Madinah\n✔ 5 Guided Umrahs & Historic Ziyarat\n✔ 3 Times Indian Buffet Meals\n✔ Complimentary 5L Zamzam & Complete Luggage Kit\n\n📞 Inquire Now: +91 8793939393 / +91 9890708013",
    whatsappVersion:
      "*Assalamualaikum wa Rahmatullahi wa Barakatuhu!* 🕋\n\nSpecial booking open for *Umrah Platinum Package 2026*:\n\n📅 *Duration:* 20 Days\n💰 *Price:* ₹1,20,000/- onwards\n🏨 *Hotels:* Walking distance to Haram\n🍽️ *Meals:* 3 Times Indian Food\n👳 *Guide:* Scholarly supervision & 5 Umrahs\n\nTap below to claim your seat with Al-Gafur Tours:\nwa.me/919890708013",
    reelScript:
      `[0:00 - 0:03] Drone shot of the Holy Kaaba under golden twilight. Voiceover: "Kya aap is saal Khana-e-Kaba ke samne aansu bahane ka irada kar rahe hain?"\n[0:03 - 0:08] Cut to Green Dome of Masjid An-Nabawi. Voiceover: "Al-Gafur International Tours lekar aaya hai aapke liye Umrah Platinum Package."\n[0:08 - 0:15] Quick montage: Luxury walking distance hotels, fresh Indian buffet, Hafiz Asrar Sahab guiding pilgrims. Voiceover: "Direct flight, 5 Umrahs, 4-star hotel haram ke kareeb aur mukammal aasan safar."\n[0:15 - 0:20] Al-Gafur Gold Logo reveal on screen with phone numbers. Voiceover: "Abhi call karein 9890708013 par aur apni seat book karein."`,
    provider: "Local-Studio-Engine",
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "caption",
          packageTitle: selectedPkg,
          language,
          tone,
          customNotes,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setGeneratedData({ ...json.data, provider: json.provider });
        }
      } else {
        alert("Could not generate content. Using offline studio fallback.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-amber-500" />
          AI Marketing Studio & Copy Generator
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Generate high-converting, spiritually aligned multilingual marketing copy for WhatsApp broadcasts, social media, and video reels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Generator Controls */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b pb-3 border-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            Campaign Parameters
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Select Package
            </label>
            <select
              value={selectedPkg}
              onChange={(e) => setSelectedPkg(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-700"
            >
              {packages.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.durationDays} Days &bull; ₹{p.basePrice.toLocaleString("en-IN")})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Target Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Urdu">Urdu (اردو)</option>
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="Arabic">Arabic (العربية)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Brand Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="Spiritual & Reverent">Spiritual & Reverent</option>
                <option value="Urgent & High Energy">Urgent & Limited Seats</option>
                <option value="Premium & Luxurious">Premium & VIP Stays</option>
                <option value="Family Centric">Family & Senior Friendly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Key Highlights & Custom Notes
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. 5 Umrahs included, Hafiz Asrar Sahab guidance, 500m to Haram, Direct flights..."
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 hover:to-slate-900 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Crafting Multilingual Copy...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Generate Marketing Assets
              </>
            )}
          </button>

          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600" /> Engine Provider:
              </span>
              <span className="font-semibold text-slate-800">
                {generatedData.provider || "Gemini 1.5 Flash / Local"}
              </span>
            </div>
          </div>
        </div>

        {/* Generated Copy Output Tabs */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-slate-50 px-4 pt-3 border-b border-slate-200 flex flex-wrap gap-2">
            {[
              { id: "caption", label: "Instagram & Meta Post", icon: FileText },
              { id: "whatsapp", label: "WhatsApp Broadcast", icon: MessageCircle },
              { id: "reel", label: "Reel / Video Script", icon: Video },
              { id: "short", label: "SMS & Telegram", icon: Send },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-semibold rounded-t-lg flex items-center gap-1.5 transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-emerald-900 border-t-2 border-emerald-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
            {activeTab === "caption" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Headline Hook:
                  </label>
                  <div className="text-base font-bold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {generatedData.headline}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Full Instagram / Facebook Caption:
                  </label>
                  <div className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed font-sans max-h-72 overflow-y-auto">
                    {generatedData.caption}
                    {"\n\n"}
                    {generatedData.cta}
                    {"\n\n"}
                    {generatedData.hashtags.join(" ")}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-wrap gap-1">
                    {generatedData.hashtags.map((h, i) => (
                      <span key={i} className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                        {h}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${generatedData.headline}\n\n${generatedData.caption}\n\n${generatedData.cta}\n\n${generatedData.hashtags.join(
                          " "
                        )}`,
                        "caption"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-sm"
                  >
                    {copiedKey === "caption" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === "caption" ? "Copied!" : "Copy Full Caption"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "whatsapp" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Formatted WhatsApp Broadcast Message:
                  </label>
                  <div className="text-sm text-slate-800 whitespace-pre-line bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 font-mono leading-relaxed">
                    {generatedData.whatsappVersion}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(generatedData.whatsappVersion)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Open in WhatsApp
                  </a>
                  <button
                    onClick={() => copyToClipboard(generatedData.whatsappVersion, "whatsapp")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm"
                  >
                    {copiedKey === "whatsapp" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === "whatsapp" ? "Copied!" : "Copy Message"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "reel" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    30-Second Video Reel Script & Direction:
                  </label>
                  <div className="text-xs text-slate-800 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed font-mono max-h-72 overflow-y-auto">
                    {generatedData.reelScript}
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={() => copyToClipboard(generatedData.reelScript || "", "reel")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-sm"
                  >
                    {copiedKey === "reel" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === "reel" ? "Copied!" : "Copy Script"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "short" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Short SMS / Telegram Alert (Under 160 chars):
                  </label>
                  <div className="text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans">
                    {generatedData.shortVersion}
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={() => copyToClipboard(generatedData.shortVersion, "short")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-sm"
                  >
                    {copiedKey === "short" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === "short" ? "Copied!" : "Copy SMS"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

