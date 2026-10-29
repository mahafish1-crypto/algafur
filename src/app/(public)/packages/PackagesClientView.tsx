"use client";

import React, { useState, useMemo, useEffect } from "react";
import PackageCard, { PackageCardData } from "@/components/packages/PackageCard";
import { Search, Scale, X } from "lucide-react";
import Link from "next/link";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { useLanguage } from "@/context/LanguageContext";

interface PackagesClientViewProps {
  initialPackages: any[];
  initialCategory?: string;
  initialDuration?: string;
}

const CATEGORY_TABS = [
  { id: "ALL", label: "All Journeys" },
  { id: "DIRECT_FLIGHT", label: "Direct Flight Packages" },
  { id: "UMRAH", label: "Umrah Packages" },
  { id: "RAMADAN_UMRAH", label: "Ramadan Umrah" },
  { id: "HAJJ", label: "Hajj Packages" },
  { id: "ECONOMY", label: "Economy Packages" },
  { id: "PLATINUM_DELUXE", label: "Platinum & Deluxe" },
];

function normalizeCategory(cat?: string): string {
  if (!cat) return "ALL";
  const c = cat.toUpperCase().replace(/-/g, "_");
  if (c === "DIRECT_FLIGHT" || c === "DIRECT") return "DIRECT_FLIGHT";
  if (c === "RAMADAN" || c === "RAMADAN_UMRAH") return "RAMADAN_UMRAH";
  if (c === "HAJJ") return "HAJJ";
  if (c === "ECONOMY" || c === "BUDGET" || c === "BEST_VALUE") return "ECONOMY";
  if (c === "PLATINUM" || c === "DELUXE" || c === "PLATINUM_DELUXE" || c === "PREMIUM") return "PLATINUM_DELUXE";
  if (c === "UMRAH") return "UMRAH";
  return "ALL";
}

export default function PackagesClientView({
  initialPackages,
  initialCategory = "ALL",
  initialDuration = "ALL",
}: PackagesClientViewProps) {
  const { t, formatPrice } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(() => normalizeCategory(initialCategory));
  const [selectedDuration, setSelectedDuration] = useState(initialDuration);
  const [sortBy, setSortBy] = useState("POPULAR");

  // Comparison State (Max 3 packages)
  const [compareList, setCompareList] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  useEffect(() => {
    trackAnalyticsEvent({
      eventType: "PACKAGE_LIST_VIEW",
      sourcePage: "/packages",
    });
  }, []);

  const toggleCompare = (slug: string) => {
    if (compareList.includes(slug)) {
      setCompareList(compareList.filter((s) => s !== slug));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare up to 3 packages at a time.");
        return;
      }
      setCompareList([...compareList, slug]);
    }
  };

  const isDirectFlight = (pkg: any) => {
    return (
      pkg.flightType === "DIRECT" ||
      (Boolean(pkg.airline) && pkg.flightType !== "CONNECTING") ||
      (typeof pkg.flightDetails === "string" && pkg.flightDetails.toLowerCase().includes("direct")) ||
      (typeof pkg.features === "string" && pkg.features.toLowerCase().includes("direct"))
    );
  };

  const isEconomy = (pkg: any) => {
    const badge = (pkg.badge || "").toUpperCase();
    return (
      badge.includes("ECONOMY") ||
      badge.includes("VALUE") ||
      pkg.basePrice < 90000 ||
      pkg.name.toLowerCase().includes("economy") ||
      pkg.name.toLowerCase().includes("standard")
    );
  };

  const isPlatinumDeluxe = (pkg: any) => {
    const badge = (pkg.badge || "").toUpperCase();
    return (
      badge.includes("PLATINUM") ||
      badge.includes("DELUXE") ||
      badge.includes("PREMIUM") ||
      pkg.basePrice >= 95000
    );
  };

  const filteredPackages = useMemo(() => {
    return initialPackages
      .filter((pkg) => {
        const matchesSearch =
          pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pkg.overview && pkg.overview.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (pkg.makkahHotelName && pkg.makkahHotelName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (pkg.madinahHotelName && pkg.madinahHotelName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (pkg.badge && pkg.badge.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (pkg.airline && pkg.airline.toLowerCase().includes(searchTerm.toLowerCase()));

        let matchesCat = true;
        if (selectedCategory === "UMRAH") matchesCat = pkg.type === "UMRAH";
        else if (selectedCategory === "RAMADAN_UMRAH") matchesCat = pkg.type === "RAMADAN_UMRAH";
        else if (selectedCategory === "HAJJ") matchesCat = pkg.type === "HAJJ";
        else if (selectedCategory === "DIRECT_FLIGHT") matchesCat = isDirectFlight(pkg);
        else if (selectedCategory === "ECONOMY") matchesCat = isEconomy(pkg);
        else if (selectedCategory === "PLATINUM_DELUXE") matchesCat = isPlatinumDeluxe(pkg);

        const matchesDuration =
          selectedDuration === "ALL" || pkg.durationDays.toString() === selectedDuration;

        return matchesSearch && matchesCat && matchesDuration;
      })
      .sort((a, b) => {
        if (sortBy === "PRICE_LOW") return a.basePrice - b.basePrice;
        if (sortBy === "PRICE_HIGH") return b.basePrice - a.basePrice;
        if (sortBy === "DURATION") return b.durationDays - a.durationDays;
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [initialPackages, searchTerm, selectedCategory, selectedDuration, sortBy]);

  const comparedPackages = initialPackages.filter((p) => compareList.includes(p.slug));

  return (
    <div className="bg-ivory-100/50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            Hajj & Umrah Season 1448 / 2026
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-3">
            All Pilgrimage Packages
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            Explore meticulously designed packages with verified hotel distances, scholarly guidance, and direct flight options.
          </p>
        </div>

        {/* Category Tabs Strip */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-forest-900 text-gold-300 border-forest-900 shadow-sm"
                    : "bg-white text-neutral-700 border-neutral-200 hover:border-gold-500/50 hover:bg-neutral-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search packages, hotels, airlines..."
                className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-900"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none text-neutral-800"
              >
                {CATEGORY_TABS.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none text-neutral-800"
              >
                <option value="ALL">All Durations</option>
                <option value="15">15 Days</option>
                <option value="20">20 Days (Recommended)</option>
                <option value="30">30 Days</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none text-neutral-800"
              >
                <option value="POPULAR">Sort by: Popularity</option>
                <option value="PRICE_LOW">Price: Low to High</option>
                <option value="PRICE_HIGH">Price: High to Low</option>
                <option value="DURATION">Longest Duration</option>
              </select>
            </div>
          </div>

          {/* Active Filter Indicators */}
          <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-neutral-500 border-t border-neutral-100">
            <span>
              Showing <strong className="text-forest-950 font-semibold">{filteredPackages.length}</strong> verified package(s)
            </span>
            {(selectedCategory !== "ALL" || selectedDuration !== "ALL" || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedDuration("ALL");
                  setSearchTerm("");
                }}
                className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Compare Toolbar Alert */}
          {compareList.length > 0 && (
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs bg-emerald-50/60 p-3 rounded-xl">
              <span className="font-semibold text-emerald-900">
                {compareList.length} package(s) selected for comparison (Max 3)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCompareModalOpen(true)}
                  className="bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Scale className="w-3.5 h-3.5" />
                  Compare Now
                </button>
                <button
                  onClick={() => setCompareList([])}
                  className="text-neutral-500 hover:text-neutral-800 px-2 py-1.5"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Packages Grid */}
        {filteredPackages.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-3">
            <h3 className="text-lg font-serif font-bold text-neutral-800">
              {selectedCategory === "HAJJ"
                ? "Hajj 1448 Hijri Advance Registration Open"
                : "No Packages Match Your Criteria"}
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              {selectedCategory === "HAJJ"
                ? "Official Hajj 1448 quota packages are undergoing seat allotment. Contact our pilgrimage advisors to reserve your priority booking."
                : "Try adjusting your category selection, duration, or search keywords."}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("ALL");
                  setSelectedDuration("ALL");
                }}
                className="text-xs font-bold bg-forest-900 text-gold-300 px-4 py-2 rounded-xl hover:bg-forest-950 transition-colors"
              >
                Show All Packages
              </button>
              <Link
                href="/contact"
                className="text-xs font-semibold border border-neutral-300 text-neutral-700 px-4 py-2 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                Custom Package Enquiry
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="relative">
                <PackageCard pkg={pkg as PackageCardData} />
                <button
                  onClick={() => toggleCompare(pkg.slug)}
                  className={`mt-2 w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    compareList.includes(pkg.slug)
                      ? "bg-forest-900 text-gold-300 border-forest-900"
                      : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  <Scale className="w-3 h-3" />
                  <span>{compareList.includes(pkg.slug) ? "Remove from Comparison" : "Add to Comparison"}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Modal (Part 67) */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-gold-600" />
                <h3 className="text-xl font-serif font-bold text-forest-950">Package Comparison</h3>
              </div>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-${comparedPackages.length} gap-4`}>
              {comparedPackages.map((p) => (
                <div key={p.id} className="border border-neutral-200 rounded-2xl p-5 space-y-4 bg-ivory-50">
                  <h4 className="text-base font-serif font-bold text-forest-950">{p.name}</h4>
                  <div className="text-xl font-bold text-emerald-800">
                    ₹{p.basePrice.toLocaleString("en-IN")}
                  </div>

                  <div className="space-y-3 text-xs border-t border-neutral-200 pt-3">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Duration</span>
                      <span className="font-semibold">{p.durationDays} Days</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Stays Breakdown</span>
                      <span>{p.makkahNights} Nights Makkah • {p.madinahNights} Nights Madinah</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Makkah Hotel</span>
                      <span>{p.makkahHotelName || "Diyafa Jamal"} ({p.makkahDistance || "500m"})</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Madinah Hotel</span>
                      <span>{p.madinahHotelName || "Ilaf Kuba"} ({p.madinahDistance || "400m"})</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Food</span>
                      <span className="text-emerald-700 font-medium">3 Times Daily Indian Buffet</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Flights</span>
                      <span>Direct Return Flight Included</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Zamzam</span>
                      <span className="text-emerald-700 font-medium">Free 5L Sealed Can</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/packages/${p.slug}`}
                      className="w-full block text-center py-2 bg-forest-900 text-gold-300 font-bold rounded-xl text-xs hover:bg-forest-950"
                    >
                      View & Book
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

