"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Calendar,
  Clock,
  Building,
  Users,
  Plus,
  Edit,
  Eye,
  CheckCircle2,
  X,
} from "lucide-react";

interface AdminPackagesClientProps {
  initialPackages: any[];
}

export default function AdminPackagesClient({ initialPackages }: AdminPackagesClientProps) {
  const router = useRouter();
  const [packages, setPackages] = useState(initialPackages);
  const [editingPkg, setEditingPkg] = useState<any | null>(null);

  const [seatEdit, setSeatEdit] = useState({
    totalSeats: 45,
    bookedSeats: 28,
    basePrice: 120000,
  });

  const handleOpenEdit = (pkg: any) => {
    setEditingPkg(pkg);
    setSeatEdit({
      totalSeats: pkg.totalSeats,
      bookedSeats: pkg.bookedSeats,
      basePrice: pkg.basePrice,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    try {
      const res = await fetch(`/api/packages/${editingPkg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seatEdit),
      });

      if (res.ok) {
        setPackages(
          packages.map((p) =>
            p.id === editingPkg.id ? { ...p, ...seatEdit } : p
          )
        );
        setEditingPkg(null);
        router.refresh();
      }
    } catch {
      alert("Failed to update package.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Package Catalog Manager</h1>
          <p className="text-xs text-slate-400">
            Control package prices, duration, hotel allocations, and real database seat availability.
          </p>
        </div>

        <Link
          href="/packages"
          target="_blank"
          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs"
        >
          <Eye className="w-4 h-4" />
          <span>View Public Catalog ↗</span>
        </Link>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                  {pkg.type}
                </span>
                <span className="text-xs font-semibold text-gold-400">
                  {pkg.durationDays} Days Tour
                </span>
              </div>

              <h3 className="text-base font-serif font-bold text-white">{pkg.name}</h3>

              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Departure:</span>
                  <span className="font-semibold text-slate-200">{pkg.departureDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Makkah Hotel:</span>
                  <span className="text-slate-200">{pkg.makkahHotelName || "Diyafa Jamal"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Madinah Hotel:</span>
                  <span className="text-slate-200">{pkg.madinahHotelName || "Ilaf Kuba"}</span>
                </div>
              </div>

              {/* Seat Capacity Bar */}
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Capacity:</span>
                  <span className="font-bold text-white">
                    {pkg.bookedSeats} / {pkg.totalSeats} Booked
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (pkg.bookedSeats / pkg.totalSeats) * 100)}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-gold-400 text-right">
                  {pkg.totalSeats - pkg.bookedSeats} Seats Remaining
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Base Price</span>
                <span className="text-lg font-bold font-serif text-gold-400">
                  ₹{pkg.basePrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEdit(pkg)}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 text-xs font-semibold flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5 text-gold-400" />
                  <span>Edit</span>
                </button>
                <Link
                  href={`/packages/${pkg.slug}`}
                  target="_blank"
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800"
                  title="View Public Page"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Seats & Price Modal */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-serif font-bold text-white">
                Edit Package: {editingPkg.name}
              </h3>
              <button
                onClick={() => setEditingPkg(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Base Price (₹ INR)</label>
                <input
                  type="number"
                  required
                  value={seatEdit.basePrice}
                  onChange={(e) =>
                    setSeatEdit({ ...seatEdit, basePrice: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Total Seats</label>
                  <input
                    type="number"
                    required
                    value={seatEdit.totalSeats}
                    onChange={(e) =>
                      setSeatEdit({ ...seatEdit, totalSeats: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Booked Seats</label>
                  <input
                    type="number"
                    required
                    value={seatEdit.bookedSeats}
                    onChange={(e) =>
                      setSeatEdit({ ...seatEdit, bookedSeats: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

