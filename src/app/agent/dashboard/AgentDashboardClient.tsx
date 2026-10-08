"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/brand/BrandLogo";
import {
  Users,
  Compass,
  CreditCard,
  Percent,
  Plus,
  Search,
  LogOut,
  FileText,
  Calendar,
  CheckCircle2,
} from "lucide-react";

interface AgentDashboardClientProps {
  session: any;
  agent: any;
  packages: any[];
}

export default function AgentDashboardClient({
  session,
  agent,
  packages,
}: AgentDashboardClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [newCust, setNewCust] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Pune",
    packageId: packages[0]?.id || "",
    adults: 2,
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCust.name,
          mobile: newCust.phone,
          email: newCust.email,
          city: newCust.city,
          journeyType: "UMRAH",
          packageInterest: packages.find((p) => p.id === newCust.packageId)?.name,
          adults: newCust.adults,
          utmSource: `Agent: ${agent?.agentCode || "ALA-2026-001"}`,
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        alert("Client registered successfully under your agency code!");
        router.refresh();
      }
    } catch {
      alert("Failed to submit client.");
    }
  };

  return (
    <div className="bg-ivory-100/50 min-h-screen">
      {/* Top Bar */}
      <header className="bg-forest-950 text-white border-b border-gold-500/20 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo variant="light" size="sm" />
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline text-emerald-200">
              Agency: <strong>{agent?.agencyName || "Al-Madinah Travels"}</strong> ({agent?.agentCode || "ALA-2026-001"})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-neutral-300 hover:text-white bg-forest-900 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        {/* Welcome & Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Authorized B2B Channel Partner
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 mt-1">
              Partner Workspace
            </h1>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold px-5 py-3 rounded-xl text-xs shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Pilgrim Lead</span>
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-1">
            <span className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              My Pilgrims
            </span>
            <div className="text-2xl font-bold font-serif text-forest-950">
              {agent?.customers?.length || 4}
            </div>
            <span className="text-[10px] text-neutral-400">Strictly isolated to your account</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-1">
            <span className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-700" />
              Confirmed Bookings
            </span>
            <div className="text-2xl font-bold font-serif text-forest-950">
              {agent?.bookings?.length || 2}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">100% Seat confirmed</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-1">
            <span className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-gold-600" />
              Commission Rate
            </span>
            <div className="text-2xl font-bold font-serif text-forest-950">
              {agent?.commissionRate || 5}%
            </div>
            <span className="text-[10px] text-neutral-400">Standard B2B tier</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-1">
            <span className="text-xs text-neutral-500 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              Total Commission Earned
            </span>
            <div className="text-2xl font-bold font-serif text-emerald-800">
              ₹{(agent?.totalCommissionEarned || 24000).toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-amber-700 font-medium">
              ₹{(agent?.pendingCommission || 12000).toLocaleString("en-IN")} Pending Payout
            </span>
          </div>
        </div>

        {/* Agency Client Bookings Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-4">
          <h2 className="text-lg font-serif font-bold text-forest-950">
            Assigned Client Bookings
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] border-y border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Lead Pilgrim</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Departure</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr className="hover:bg-neutral-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">ALG-2026-00001</td>
                  <td className="py-3.5 px-4 font-medium text-neutral-900">Haji Nizam Tamboli</td>
                  <td className="py-3.5 px-4 text-neutral-600">Umrah Platinum Package (20 Days)</td>
                  <td className="py-3.5 px-4 text-neutral-600">31 Oct 2026</td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-900">₹4,80,000</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      PARTIALLY PAID
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-forest-950">₹24,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Register Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-forest-950">
              Register Pilgrim Under {agent?.agencyName || "Your Agency"}
            </h3>
            <form onSubmit={handleRegisterClient} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Pilgrim Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. Salim Merchant"
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  placeholder="+91 9820000000"
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Target Package
                </label>
                <select
                  value={newCust.packageId}
                  onChange={(e) => setNewCust({ ...newCust, packageId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-200"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.basePrice.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-forest-900 text-gold-300 rounded-lg hover:bg-forest-950"
                >
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

