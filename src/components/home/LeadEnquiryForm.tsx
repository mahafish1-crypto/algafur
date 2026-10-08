"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Phone, MessageCircle, Sparkles } from "lucide-react";

interface LeadEnquiryFormProps {
  defaultPackage?: string;
}

export default function LeadEnquiryForm({ defaultPackage }: LeadEnquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    whatsapp: "",
    email: "",
    city: "Pune",
    journeyType: "UMRAH",
    packageInterest: defaultPackage || "Umrah Platinum Package (20 Days)",
    travelDate: "October 2026",
    adults: 2,
    children: 0,
    budget: "₹1,20,000 – ₹2,50,000",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [leadNumber, setLeadNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Capture UTMs if available in window.location
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get("utm_source") || "Website";
      const utmMedium = urlParams.get("utm_medium") || "Direct";
      const utmCampaign = urlParams.get("utm_campaign") || undefined;

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry");
      }

      setSuccess(true);
      setLeadNumber(data.leadNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="lead-form" className="py-20 bg-forest-950 text-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="bg-forest-900/90 rounded-3xl p-6 sm:p-12 border border-gold-500/30 shadow-2xl backdrop-blur-md">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-950 border border-gold-500/30 text-gold-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Personalized Consultation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Plan Your Sacred Journey With Us
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/70 mt-2">
              Fill in your details and our senior Umrah advisors will contact you with full package itinerary, seat reservation options, and visa requirements.
            </p>
          </div>

          {success ? (
            <div className="bg-forest-950 p-8 rounded-2xl border border-emerald-500/40 text-center space-y-4 animate-scaleUp">
              <div className="w-14 h-14 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                JazakAllah Khair! Enquiry Received.
              </h3>
              <p className="text-xs text-emerald-200/80 max-w-md mx-auto">
                Your enquiry reference is <strong className="text-gold-300 font-mono">{leadNumber}</strong>. Our pilgrimage coordinator will call or WhatsApp you shortly.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <a
                  href={`https://wa.me/919890708013?text=Assalamualaikum,%20my%20enquiry%20reference%20is%20${leadNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat Directly on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-emerald-100 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Haji Nizam Tamboli"
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-700"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-medium text-emerald-100 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="e.g. +91 9890708013"
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-700"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-medium text-emerald-100 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Same as mobile or different"
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-700"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-emerald-100 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-700"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-medium text-emerald-100 mb-1">
                    Your City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Pune, Mumbai, Aurangabad, etc."
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-700"
                  />
                </div>

                {/* Package Interest */}
                <div>
                  <label className="block text-xs font-medium text-emerald-100 mb-1">
                    Package of Interest
                  </label>
                  <select
                    value={formData.packageInterest}
                    onChange={(e) => setFormData({ ...formData, packageInterest: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white"
                  >
                    <option value="Umrah Platinum Package (20 Days)">
                      Umrah Platinum Package (20 Days - 31 Oct)
                    </option>
                    <option value="Umrah Classic Economy (15 Days)">
                      Umrah Classic Economy (15 Days)
                    </option>
                    <option value="Ramadan Blessed Last 15 Days">
                      Ramadan Blessed Last 15 Days & Eid
                    </option>
                    <option value="Executive Hajj 2027">
                      Executive Hajj 2027
                    </option>
                    <option value="Custom Private Family Umrah">
                      Customized Private Family Umrah
                    </option>
                  </select>
                </div>

                {/* Travellers */}
                <div>
                  <label className="block text-xs font-medium text-emerald-100 mb-1">
                    Adult Pilgrims (12+ Yrs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.adults}
                    onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white"
                  />
                </div>

                {/* Children */}
                <div>
                  <label className="block text-xs font-medium text-emerald-100 mb-1">
                    Children (Below 12)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.children}
                    onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white"
                  />
                </div>

                {/* Travel Date / Month */}
                <div>
                  <label className="block text-xs font-medium text-emerald-100 mb-1">
                    Intended Travel Month
                  </label>
                  <input
                    type="text"
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    placeholder="e.g. October 2026"
                    className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-emerald-100 mb-1">
                  Specific Requests (Elderly wheelchair, Quad room sharing, etc.)
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share any special preferences for room types or dates..."
                  className="w-full text-xs p-3 rounded-xl bg-forest-950/80 border border-emerald-800/60 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-700"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-forest-950 font-bold py-3.5 px-8 rounded-xl text-xs sm:text-sm shadow-gold transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-forest-950" />
                  <span>{loading ? "Submitting to CRM..." : "Submit Travel Enquiry"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

