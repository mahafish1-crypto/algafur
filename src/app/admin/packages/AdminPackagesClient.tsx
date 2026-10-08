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
  Search,
  Plane,
  DollarSign,
  Trash2,
  Archive,
  Compass,
} from "lucide-react";
import PackageFormModal from "@/components/admin/PackageFormModal";

interface AdminPackagesClientProps {
  initialPackages: any[];
}

export default function AdminPackagesClient({ initialPackages }: AdminPackagesClientProps) {
  const router = useRouter();
  const [packages, setPackages] = useState(initialPackages);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackageForEdit, setSelectedPackageForEdit] = useState<any | null>(null);

  const handleOpenCreate = () => {
    setSelectedPackageForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: any) => {
    setSelectedPackageForEdit(pkg);
    setIsModalOpen(true);
  };

  const handlePackageSaved = (savedPkg: any) => {
    setPackages((prev) => {
      const exists = prev.some((p) => p.id === savedPkg.id);
      if (exists) {
        return prev.map((p) => (p.id === savedPkg.id ? savedPkg : p));
      }
      return [savedPkg, ...prev];
    });
    router.refresh();
  };

  const handleDeletePackage = async (pkg: any) => {
    if (pkg.slug === "umrah-platinum-package-2026") {
      alert("The default Al-Gafur Platinum 2026 package is protected and cannot be deleted.");
      return;
    }

    if (!confirm(`Are you sure you want to delete or archive package "${pkg.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/packages/${pkg.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete package");
      }

      if (data.package) {
        // Was archived
        setPackages((prev) => prev.map((p) => (p.id === pkg.id ? data.package : p)));
        alert(data.message || "Package archived.");
      } else {
        setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
      }
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting package");
    }
  };

  const filtered = packages.filter((pkg) => {
    const matchesType = filterType === "ALL" ? true : pkg.type === filterType || pkg.status === filterType;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      pkg.name.toLowerCase().includes(term) ||
      pkg.slug.toLowerCase().includes(term) ||
      (pkg.departureDate && pkg.departureDate.toLowerCase().includes(term));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-gold-400" />
            Tour Package Catalog CMS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete management of packages, pricing, hotels, direct flights, day-by-day itineraries, and real-time seat inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/packages"
            target="_blank"
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Public Catalog ↗</span>
          </Link>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-forest-950 font-bold text-xs shadow-gold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Package</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: "ALL", label: `All Packages (${packages.length})` },
            { id: "PUBLISHED", label: "Published" },
            { id: "DRAFT", label: "Drafts" },
            { id: "UMRAH", label: "Umrah" },
            { id: "HAJJ", label: "Hajj" },
            { id: "RAMADAN_UMRAH", label: "Ramadan" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === tab.id
                  ? "bg-gold-500 text-forest-950 shadow-sm"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search packages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-gold-400"
          />
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-slate-950 rounded-2xl border border-dashed border-slate-800 p-8">
            <Compass className="w-12 h-12 mx-auto mb-3 opacity-30 text-gold-400" />
            <p className="text-sm font-semibold text-slate-300">No tour packages match criteria</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;+ Add New Package&quot; to create a new tour package.
            </p>
          </div>
        ) : (
          filtered.map((pkg) => {
            const availableSeats = Math.max(0, pkg.totalSeats - pkg.bookedSeats);
            const percentBooked = Math.min(100, Math.round((pkg.bookedSeats / pkg.totalSeats) * 100));

            return (
              <div
                key={pkg.id}
                className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4 flex flex-col justify-between hover:border-gold-500/40 transition-all"
              >
                <div className="space-y-3">
                  {/* Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                        {pkg.type}
                      </span>
                      {pkg.badge && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-gold-500 text-forest-950 uppercase">
                          {pkg.badge}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        pkg.status === "PUBLISHED"
                          ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                          : pkg.status === "DRAFT"
                          ? "bg-amber-900/60 text-amber-300 border border-amber-700/50"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {pkg.status}
                    </span>
                  </div>

                  {/* Title & Duration */}
                  <div>
                    <h3 className="text-base font-serif font-bold text-white line-clamp-1" title={pkg.name}>
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-gold-400 font-semibold mt-0.5">
                      {pkg.durationDays} Days &bull; {pkg.makkahNights}N Makkah / {pkg.madinahNights}N Madinah
                    </p>
                  </div>

                  {/* Hotel & Flight Snippet */}
                  <div className="space-y-1.5 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-2xl border border-slate-900">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gold-500" /> Departure:
                      </span>
                      <span className="font-semibold text-slate-200">{pkg.departureDate}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-gold-500" /> Makkah:
                      </span>
                      <span className="text-slate-200 truncate max-w-[150px]">
                        {pkg.makkahHotelName || "Diyafa Jamal"} ({pkg.makkahDistance || "500m"})
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-gold-500" /> Madinah:
                      </span>
                      <span className="text-slate-200 truncate max-w-[150px]">
                        {pkg.madinahHotelName || "Ilaf Kuba"} ({pkg.madinahDistance || "400m"})
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Plane className="w-3.5 h-3.5 text-gold-500" /> Flight:
                      </span>
                      <span className="text-slate-200">
                        {pkg.airline || "Saudi Airlines"} ({pkg.departureCity || "Mumbai"})
                      </span>
                    </div>
                  </div>

                  {/* Seat Capacity Bar */}
                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Seat Inventory:</span>
                      <span className="font-bold text-white">
                        {pkg.bookedSeats} / {pkg.totalSeats} Booked
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentBooked}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">{percentBooked}% Confirmed</span>
                      <span className="text-emerald-400 font-bold">{availableSeats} Seats Left</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Base Quad Price</span>
                    <span className="text-lg font-bold font-serif text-gold-400">
                      ₹{pkg.basePrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Edit Entire Package"
                    >
                      <Edit className="w-3.5 h-3.5 text-gold-400" />
                      <span>Edit</span>
                    </button>

                    <Link
                      href={`/packages/${pkg.slug}`}
                      target="_blank"
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
                      title="View Live Public Page"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>

                    {pkg.slug !== "umrah-platinum-package-2026" && (
                      <button
                        onClick={() => handleDeletePackage(pkg)}
                        className="p-2 bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-xl border border-slate-800 transition-colors"
                        title="Archive or Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Create / Edit Modal */}
      <PackageFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handlePackageSaved}
        initialPackage={selectedPackageForEdit}
      />
    </div>
  );
}
