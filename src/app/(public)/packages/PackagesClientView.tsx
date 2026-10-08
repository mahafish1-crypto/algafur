"use client";

import React, { useState, useMemo } from "react";
import PackageCard, { PackageCardData } from "@/components/packages/PackageCard";
import { Search, SlidersHorizontal, Scale, X, Check, CheckCircle2, Building, Clock, IndianRupee } from "lucide-react";
import Link from "next/link";

interface PackagesClientViewProps {
  initialPackages: any[];
}

export default function PackagesClientView({ initialPackages }: PackagesClientViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedDuration, setSelectedDuration] = useState("ALL");
  const [sortBy, setSortBy] = useState("POPULAR");

  // Comparison State (Max 3 packages)
  const [compareList, setCompareList] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

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

  const filteredPackages = useMemo(() => {
    return initialPackages
      .filter((pkg) => {
        const matchesSearch =
          pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pkg.overview && pkg.overview.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (pkg.makkahHotelName && pkg.makkahHotelName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = selectedType === "ALL" || pkg.type === selectedType;
        const matchesDuration =
          selectedDuration === "ALL" || pkg.durationDays.toString() === selectedDuration;

        return matchesSearch && matchesType && matchesDuration;
      })
      .sort((a, b) => {
        if (sortBy === "PRICE_LOW") return a.basePrice - b.basePrice;
        if (sortBy === "PRICE_HIGH") return b.basePrice - a.basePrice;
        if (sortBy === "DURATION") return b.durationDays - a.durationDays;
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [initialPackages, searchTerm, selectedType, selectedDuration, sortBy]);

  const comparedPackages = initialPackages.filter((p) => compareList.includes(p.slug));

  return (
    <div className="bg-ivory-100/50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
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
                placeholder="Search packages, hotels, tours..."
                className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-900"
              />
            </div>

            {/* Journey Type */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none text-neutral-800"
              >
                <option value="ALL">All Journeys</option>
                <option value="UMRAH">Umrah Tours</option>
                <option value="RAMADAN_UMRAH">Ramadan Umrah</option>
                <option value="HAJJ">Hajj Packages</option>
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
            <h3 className="text-lg font-serif font-bold text-neutral-800">No Packages Match Your Criteria</h3>
            <p className="text-xs text-neutral-500">Try adjusting your filters or search keywords.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedType("ALL");
                setSelectedDuration("ALL");
              }}
              className="mt-2 text-xs font-bold text-forest-950 underline"
            >
              Reset All Filters
            </button>
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

