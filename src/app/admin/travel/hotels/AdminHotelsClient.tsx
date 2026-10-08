"use client";

import React, { useState } from "react";
import {
  Building,
  Star,
  MapPin,
  Plus,
  X,
  Search,
  CheckCircle,
} from "lucide-react";

interface HotelItem {
  id: string;
  name: string;
  city: string;
  starRating: number;
  distanceFromHaram: string;
  walkingTime?: string | null;
  roomTypes?: string | null;
  amenities?: string | null;
  address?: string | null;
  description?: string | null;
}

interface Props {
  initialHotels: HotelItem[];
}

export default function AdminHotelsClient({ initialHotels }: Props) {
  const [hotels, setHotels] = useState<HotelItem[]>(initialHotels);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    city: "MAKKAH",
    starRating: 4,
    distanceFromHaram: "450m",
    walkingTime: "5 mins walking",
    roomTypes: "Quad, Triple, Double",
    amenities: "Wi-Fi, 24/7 Room Service, Restaurant, Lifts",
    address: "",
    description: "",
  });

  const handleAddHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const json = await res.json();
        setHotels((prev) => [json.hotel, ...prev]);
        setIsAddOpen(false);
        setForm({
          name: "",
          city: "MAKKAH",
          starRating: 4,
          distanceFromHaram: "450m",
          walkingTime: "5 mins walking",
          roomTypes: "Quad, Triple, Double",
          amenities: "Wi-Fi, 24/7 Room Service, Restaurant, Lifts",
          address: "",
          description: "",
        });
      } else {
        alert("Failed to add hotel.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding hotel.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = hotels.filter((h) => {
    const matchesCity = cityFilter === "ALL" ? true : h.city === cityFilter;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      h.name.toLowerCase().includes(term) ||
      h.address?.toLowerCase().includes(term);

    return matchesCity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-7 h-7 text-emerald-700" />
            Hotel Inventory & Haram Proximity Manager
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Contracted properties, walking distances to Masjid Al-Haram and Masjid An-Nabawi, room layouts, and amenities.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Contracted Hotel
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {["ALL", "MAKKAH", "MADINAH", "JEDDAH"].map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                cityFilter === c
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c === "ALL" ? "All Cities" : c}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hotel name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent"
          />
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((h) => (
          <div
            key={h.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {h.city} &bull; {h.distanceFromHaram}
                </span>
                <div className="flex gap-0.5 text-amber-500">
                  {[...Array(h.starRating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{h.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {h.description || "Comfortable and convenient hospitality close to Haram."}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
              {h.walkingTime && (
                <p>
                  <strong className="text-slate-800">Walk:</strong> {h.walkingTime}
                </p>
              )}
              {h.address && (
                <p className="truncate">
                  <strong className="text-slate-800">Address:</strong> {h.address}
                </p>
              )}
              {h.amenities && (
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  {h.amenities}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Hotel Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Add Contracted Hotel</h3>
                <p className="text-xs text-emerald-200">Register property into accommodation pool</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHotel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diyafa Jamal Makkah"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    City *
                  </label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="MAKKAH">Makkah</option>
                    <option value="MADINAH">Madinah</option>
                    <option value="JEDDAH">Jeddah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Star Rating
                  </label>
                  <select
                    value={form.starRating}
                    onChange={(e) => setForm({ ...form, starRating: parseInt(e.target.value) })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="5">5 Star Luxury</option>
                    <option value="4">4 Star Premium</option>
                    <option value="3">3 Star Standard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Distance from Haram *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500m"
                    value={form.distanceFromHaram}
                    onChange={(e) => setForm({ ...form, distanceFromHaram: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Walking Route
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5 mins walk"
                    value={form.walkingTime}
                    onChange={(e) => setForm({ ...form, walkingTime: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Amenities
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wi-Fi, 24/7 Room Service, Buffet Restaurant"
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ibrahim Al Khalil Rd, Makkah"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

