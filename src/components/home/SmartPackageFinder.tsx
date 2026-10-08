"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, MapPin, Calendar, IndianRupee, Compass } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SmartPackageFinder() {
  const router = useRouter();
  const { t } = useLanguage();

  const [journeyType, setJourneyType] = useState("ALL");
  const [duration, setDuration] = useState("ALL");
  const [city, setCity] = useState("Mumbai");
  const [month, setMonth] = useState("ALL");
  const [budget, setBudget] = useState("ALL");
  const [sortBy, setSortBy] = useState("POPULAR");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (journeyType !== "ALL") params.set("type", journeyType);
    if (duration !== "ALL") params.set("duration", duration);
    if (city !== "ALL") params.set("city", city);
    if (month !== "ALL") params.set("month", month);
    if (budget !== "ALL") params.set("budget", budget);
    if (sortBy !== "POPULAR") params.set("sort", sortBy);

    router.push(`/packages?${params.toString()}`);
  };

  return (
    <div className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gold-500/20 p-5 sm:p-7">
        {/* Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5 pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-forest-950 flex items-center gap-2">
              <Compass className="w-5 h-5 text-gold-600" />
              {t("finder_title")}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">{t("finder_sub")}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              100% Real Database Availability
            </span>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Journey Type */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
              {t("filter_journey")}
            </label>
            <select
              value={journeyType}
              onChange={(e) => setJourneyType(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
            >
              <option value="ALL">All Journeys</option>
              <option value="UMRAH">Umrah (2026)</option>
              <option value="RAMADAN_UMRAH">Ramadan Umrah</option>
              <option value="HAJJ">Hajj (1448 / 2027)</option>
              <option value="GROUP">Group Departure</option>
              <option value="PRIVATE">Private Family</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
              {t("filter_duration")}
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
            >
              <option value="ALL">Any Duration</option>
              <option value="15">15 Days</option>
              <option value="20">20 Days (Recommended)</option>
              <option value="22">22 Days</option>
              <option value="30">30 Days</option>
            </select>
          </div>

          {/* Departure City */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
              {t("filter_departure_city")}
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
            >
              <option value="Mumbai">Mumbai (Direct Flight)</option>
              <option value="Pune">Pune (Bus Transfer to BOM)</option>
              <option value="Aurangabad">Aurangabad (Chh. Sambhajinagar)</option>
              <option value="Ahmednagar">Ahmednagar</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          {/* Travel Month */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
              {t("filter_month")}
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
            >
              <option value="ALL">Any Travel Month</option>
              <option value="October">October 2026 (Platinum)</option>
              <option value="November">November 2026</option>
              <option value="December">December 2026</option>
              <option value="January">January 2027</option>
              <option value="March">March 2027 (Ramadan)</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
              {t("filter_budget")}
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
            >
              <option value="ALL">Any Budget</option>
              <option value="under_100k">Under ₹1,00,000</option>
              <option value="100k_150k">₹1,00,000 – ₹1,50,000</option>
              <option value="above_150k">₹1,50,000+ (Deluxe / Ramadan)</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold py-2.5 px-4 rounded-lg text-xs transition-all shadow-md border border-gold-500/30"
            >
              <Search className="w-3.5 h-3.5" />
              Find Packages
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

