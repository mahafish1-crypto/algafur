"use client";

import React, { useState } from "react";
import {
  Plane,
  Plus,
  Calendar,
  Clock,
  Search,
  X,
  Luggage,
} from "lucide-react";

interface FlightItem {
  id: string;
  airline: string;
  flightNumber: string;
  pnr?: string | null;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  baggage?: string | null;
  cabin?: string | null;
}

interface Props {
  initialFlights: FlightItem[];
}

export default function AdminFlightsClient({ initialFlights }: Props) {
  const [flights, setFlights] = useState<FlightItem[]>(initialFlights);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    airline: "Saudi Airlines",
    flightNumber: "SV-741",
    pnr: "PNR-98213",
    departureAirport: "BOM (Mumbai)",
    arrivalAirport: "JED (Jeddah)",
    departureDate: "2026-10-31",
    departureTime: "08:30",
    arrivalDate: "2026-10-31",
    arrivalTime: "12:45",
    baggage: "2x23kg check-in + 7kg cabin",
    cabin: "Economy",
  });

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const json = await res.json();
        setFlights((prev) => [json.flight, ...prev]);
        setIsAddOpen(false);
      } else {
        alert("Failed to add flight.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding flight.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = flights.filter((f) => {
    const term = search.toLowerCase();
    return (
      !term ||
      f.airline.toLowerCase().includes(term) ||
      f.flightNumber.toLowerCase().includes(term) ||
      (f.pnr && f.pnr.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Plane className="w-7 h-7 text-emerald-700" />
            Flight Schedules & Group PNR Registry
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Charter & group flight blocks, airline baggage allowances, PNR allocations, and departure timings.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Flight Schedule
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <p className="text-xs text-slate-600 font-medium">
          Total Flight Segments: <strong className="text-slate-900">{flights.length}</strong>
        </p>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search flight number, PNR, airline..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent"
          />
        </div>
      </div>

      {/* Flights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((f) => (
          <div
            key={f.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Flight {f.flightNumber}
              </span>
              {f.pnr && (
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                  PNR: {f.pnr}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900">{f.airline}</h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-800 font-semibold">
                <span>From: {f.departureAirport}</span>
                <span>To: {f.arrivalAirport}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  Depart: {f.departureDate} at {f.departureTime}
                </span>
                <span>Arrive: {f.arrivalTime}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-slate-600 flex items-center justify-between">
                <span>
                  Baggage: <strong>{f.baggage}</strong>
                </span>
                <span>Cabin: {f.cabin}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Flight Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Add Flight Schedule</h3>
                <p className="text-xs text-emerald-200">Register airline group flight & PNR</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFlight} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Airline *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Saudi Airlines"
                    value={form.airline}
                    onChange={(e) => setForm({ ...form, airline: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Flight Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SV-741"
                    value={form.flightNumber}
                    onChange={(e) => setForm({ ...form, flightNumber: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Group PNR
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7H82KM"
                    value={form.pnr}
                    onChange={(e) => setForm({ ...form, pnr: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Cabin Class
                  </label>
                  <select
                    value={form.cabin}
                    onChange={(e) => setForm({ ...form, cabin: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Departure Airport *
                  </label>
                  <input
                    type="text"
                    placeholder="BOM (Mumbai)"
                    value={form.departureAirport}
                    onChange={(e) => setForm({ ...form, departureAirport: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Arrival Airport *
                  </label>
                  <input
                    type="text"
                    placeholder="JED (Jeddah)"
                    value={form.arrivalAirport}
                    onChange={(e) => setForm({ ...form, arrivalAirport: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Departure Date & Time
                  </label>
                  <input
                    type="text"
                    placeholder="31 Oct 2026, 08:30"
                    value={form.departureDate}
                    onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="text"
                    placeholder="12:45"
                    value={form.arrivalTime}
                    onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Baggage Quota
                </label>
                <input
                  type="text"
                  placeholder="2x23kg check-in + 7kg cabin"
                  value={form.baggage}
                  onChange={(e) => setForm({ ...form, baggage: e.target.value })}
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
                  {submitting ? "Adding..." : "Add Flight"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

