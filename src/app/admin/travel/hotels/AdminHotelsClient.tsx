"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building,
  Star,
  MapPin,
  Plus,
  X,
  Search,
  Edit3,
  Trash2,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Package as PackageIcon,
} from "lucide-react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import {
  parseHotelImages,
  parseHotelAmenities,
} from "@/lib/hotel-helpers";

interface LinkedPackageSummary {
  id: string;
  name: string;
  slug: string;
  type?: string;
  status?: string;
}

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
  mapLocation?: string | null;
  description?: string | null;
  images?: string | null;
  isAvailable?: boolean;
  makkahPackages?: LinkedPackageSummary[];
  madinahPackages?: LinkedPackageSummary[];
}

interface Props {
  initialHotels: HotelItem[];
  allPackages?: LinkedPackageSummary[];
}

interface HotelFormState {
  id?: string;
  name: string;
  city: string;
  starRating: string;
  distanceFromHaram: string;
  walkingTime: string;
  roomTypes: string;
  amenities: string;
  address: string;
  mapLocation: string;
  description: string;
  mainImage: string;
  gallery: string[];
  contactPhone: string;
  contactEmail: string;
  isAvailable: boolean;
  linkedPackageIds: string[];
}

const emptyFormState: HotelFormState = {
  name: "",
  city: "MAKKAH",
  starRating: "4",
  distanceFromHaram: "",
  walkingTime: "",
  roomTypes: "Quad, Triple, Double",
  amenities: "",
  address: "",
  mapLocation: "",
  description: "",
  mainImage: "",
  gallery: [],
  contactPhone: "",
  contactEmail: "",
  isAvailable: true,
  linkedPackageIds: [],
};

export default function AdminHotelsClient({
  initialHotels,
  allPackages = [],
}: Props) {
  const [hotels, setHotels] = useState<HotelItem[]>(initialHotels);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState<HotelFormState>(emptyFormState);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // Media Picker target: "MAIN" or "GALLERY"
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    "MAIN" | "GALLERY" | null
  >(null);

  const openAddModal = () => {
    setEditingHotelId(null);
    setErrorMessage(null);
    setForm(emptyFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (hotel: HotelItem) => {
    const parsedMedia = parseHotelImages(hotel.images, hotel.city);
    const linked = [
      ...(hotel.makkahPackages || []),
      ...(hotel.madinahPackages || []),
    ].map((p) => p.id);

    setEditingHotelId(hotel.id);
    setErrorMessage(null);
    setForm({
      id: hotel.id,
      name: hotel.name || "",
      city: hotel.city || "MAKKAH",
      starRating:
        hotel.starRating !== undefined && hotel.starRating !== null
          ? String(hotel.starRating)
          : "4",
      distanceFromHaram: hotel.distanceFromHaram || "",
      walkingTime: hotel.walkingTime || "",
      roomTypes: hotel.roomTypes || "Quad, Triple, Double",
      amenities: hotel.amenities || "",
      address: hotel.address || "",
      mapLocation: hotel.mapLocation || "",
      description: hotel.description || "",
      mainImage: hotel.images ? parsedMedia.mainImage : "",
      gallery: parsedMedia.gallery || [],
      contactPhone: parsedMedia.contactPhone || "",
      contactEmail: parsedMedia.contactEmail || "",
      isAvailable: hotel.isAvailable !== false,
      linkedPackageIds: linked,
    });
    setIsModalOpen(true);
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const url = editingHotelId
        ? `/api/hotels/${editingHotelId}`
        : "/api/hotels";
      const method = editingHotelId ? "PATCH" : "POST";

      const payload = {
        name: form.name.trim(),
        city: form.city,
        starRating: form.starRating === "" ? 0 : Number(form.starRating),
        distanceFromHaram: form.distanceFromHaram.trim(),
        walkingTime: form.walkingTime.trim(),
        roomTypes: form.roomTypes.trim(),
        amenities: form.amenities.trim(),
        address: form.address.trim(),
        mapLocation: form.mapLocation.trim(),
        description: form.description.trim(),
        mainImage: form.mainImage.trim(),
        gallery: form.gallery,
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim(),
        isAvailable: form.isAvailable,
        linkedPackageIds: form.linkedPackageIds,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error || "Failed to save hotel.");
        return;
      }

      if (editingHotelId) {
        setHotels((prev) =>
          prev.map((h) => (h.id === editingHotelId ? json.hotel : h))
        );
      } else {
        setHotels((prev) => [json.hotel, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error saving hotel."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHotel = async (hotel: HotelItem) => {
    const linked = [
      ...(hotel.makkahPackages || []),
      ...(hotel.madinahPackages || []),
    ];
    if (linked.length > 0) {
      alert(
        `Cannot delete "${hotel.name}" because it is linked to ${linked
          .map((p) => p.name)
          .join(", ")}. Please unlink it in Edit Hotel first, or mark it as Inactive.`
      );
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete "${hotel.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/hotels/${hotel.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to delete hotel.");
        return;
      }
      setHotels((prev) => prev.filter((h) => h.id !== hotel.id));
    } catch {
      alert("Network error while deleting hotel.");
    }
  };

  const togglePackageLink = (pkgId: string) => {
    setForm((prev) => {
      const exists = prev.linkedPackageIds.includes(pkgId);
      return {
        ...prev,
        linkedPackageIds: exists
          ? prev.linkedPackageIds.filter((id) => id !== pkgId)
          : [...prev.linkedPackageIds, pkgId],
      };
    });
  };

  const moveGalleryItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= form.gallery.length) return;
    const copy = [...form.gallery];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setForm((prev) => ({ ...prev, gallery: copy }));
  };

  const removeGalleryItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== index),
    }));
  };

  const addGalleryUrlManual = () => {
    const trimmed = newGalleryUrl.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      gallery: [...prev.gallery, trimmed],
    }));
    setNewGalleryUrl("");
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
            Hotel Inventory &amp; Haram Proximity Manager
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Add and edit Makkah &amp; Madinah hotels, photos, galleries,
            verified amenities, map links, and package associations.
          </p>
        </div>
        <button
          onClick={openAddModal}
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
            placeholder="Search hotel name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((h) => {
          const media = parseHotelImages(h.images, h.city);
          const amenities = parseHotelAmenities(h.amenities);
          const linkedPkgs = [
            ...(h.makkahPackages || []),
            ...(h.madinahPackages || []),
          ];
          const stars =
            typeof h.starRating === "number" && h.starRating > 0
              ? Math.min(5, h.starRating)
              : 0;

          return (
            <div
              key={h.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-44 w-full bg-slate-900">
                  <Image
                    src={media.mainImage}
                    alt={h.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white bg-emerald-900/90 px-2.5 py-0.5 rounded-md border border-emerald-400/30">
                      {h.city}
                    </span>
                    {h.distanceFromHaram && (
                      <span className="text-[11px] font-bold text-amber-300 bg-slate-950/85 px-2.5 py-0.5 rounded-md">
                        {h.distanceFromHaram}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        h.isAvailable !== false
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-600 text-slate-200"
                      }`}
                    >
                      {h.isAvailable !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {h.name}
                    </h3>
                    {stars > 0 && (
                      <div className="flex gap-0.5 text-amber-500 shrink-0 mt-0.5">
                        {[...Array(stars)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-amber-400"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {h.description && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {h.description}
                    </p>
                  )}

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
                    {h.walkingTime && (
                      <p>
                        <strong className="text-slate-800">Walk:</strong>{" "}
                        {h.walkingTime}
                      </p>
                    )}
                    {h.address && (
                      <p className="truncate">
                        <strong className="text-slate-800">Address:</strong>{" "}
                        {h.address}
                      </p>
                    )}
                    {amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-200/70">
                        {amenities.slice(0, 5).map((am, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded"
                          >
                            {am}
                          </span>
                        ))}
                        {amenities.length > 5 && (
                          <span className="text-[10px] text-slate-400">
                            +{amenities.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Linked Packages */}
                  {linkedPkgs.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <PackageIcon className="w-3 h-3" />
                        Linked Packages ({linkedPkgs.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {linkedPkgs.map((p) => (
                          <Link
                            key={p.id}
                            href={`/packages/${p.slug}`}
                            target="_blank"
                            className="text-[11px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded inline-flex items-center gap-1"
                          >
                            <span className="truncate max-w-[180px]">
                              {p.name}
                            </span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openEditModal(h)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white border border-slate-300 hover:border-emerald-600 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Hotel
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteHotel(h)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Hotel"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Hotel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingHotelId
                    ? `Edit Hotel: ${form.name}`
                    : "Add Contracted Hotel"}
                </h3>
                <p className="text-xs text-emerald-200">
                  Changes immediately update linked package pages and the public
                  hotels directory
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveHotel}
              className="p-6 space-y-5 max-h-[82vh] overflow-y-auto"
            >
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Hotel Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diyafa Jamal Hotel"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.isAvailable ? "ACTIVE" : "INACTIVE"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isAvailable: e.target.value === "ACTIVE",
                      })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  >
                    <option value="ACTIVE">Active (Visible)</option>
                    <option value="INACTIVE">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    City *
                  </label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
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
                    onChange={(e) =>
                      setForm({ ...form, starRating: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  >
                    <option value="5">5 Star</option>
                    <option value="4">4 Star</option>
                    <option value="3">3 Star</option>
                    <option value="0">Not Specified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Distance from Haram
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500m (or leave blank)"
                    value={form.distanceFromHaram}
                    onChange={(e) =>
                      setForm({ ...form, distanceFromHaram: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Walking Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5-7 mins walk"
                    value={form.walkingTime}
                    onChange={(e) =>
                      setForm({ ...form, walkingTime: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Address & Map URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Full Address / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ibrahim Al Khalil Rd, Makkah"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Google Maps URL / Coordinates (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://maps.google.com/..."
                    value={form.mapLocation}
                    onChange={(e) =>
                      setForm({ ...form, mapLocation: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Description & Amenities */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the hotel rooms, dining facilities, and proximity to the sanctuary..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Verified Amenities (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Wi-Fi, Elevators, Indian Buffet Dining, Wheelchair Access"
                    value={form.amenities}
                    onChange={(e) =>
                      setForm({ ...form, amenities: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Contact Details (Optional Phone / Email)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Hotel Phone"
                      value={form.contactPhone}
                      onChange={(e) =>
                        setForm({ ...form, contactPhone: e.target.value })
                      }
                      className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-2 bg-white text-slate-900"
                    />
                    <input
                      type="email"
                      placeholder="Hotel Email"
                      value={form.contactEmail}
                      onChange={(e) =>
                        setForm({ ...form, contactEmail: e.target.value })
                      }
                      className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-2 bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Main Featured Image */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Main Featured Hotel Image
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("MAIN")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Upload / Select from Media Library
                  </button>
                </div>

                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Image URL or select from Media Library..."
                    value={form.mainImage}
                    onChange={(e) =>
                      setForm({ ...form, mainImage: e.target.value })
                    }
                    className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                  {form.mainImage && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, mainImage: "" })}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {form.mainImage && (
                  <div className="relative h-36 w-56 rounded-xl overflow-hidden border border-slate-300 bg-slate-900">
                    <Image
                      src={form.mainImage}
                      alt="Main hotel preview"
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Hotel Photo Gallery ({form.gallery.length} images)
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("GALLERY")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Image from Media Library
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Or paste gallery image URL..."
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={addGalleryUrlManual}
                    className="px-3 py-2 text-xs font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                  >
                    Add URL
                  </button>
                </div>

                {form.gallery.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {form.gallery.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-2 rounded-xl border border-slate-200 space-y-2"
                      >
                        <div className="relative h-20 w-full rounded-lg overflow-hidden bg-slate-900">
                          <Image
                            src={imgUrl}
                            alt={`Gallery ${idx + 1}`}
                            fill
                            sizes="140px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveGalleryItem(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                              title="Move Left"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveGalleryItem(idx, 1)}
                              disabled={idx === form.gallery.length - 1}
                              className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                              title="Move Right"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeGalleryItem(idx)}
                            className="text-[10px] font-bold text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Package Associations */}
              {(form.city === "MAKKAH" || form.city === "MADINAH") &&
                allPackages.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Link as {form.city} Hotel for Packages
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pt-1">
                      {allPackages.map((pkg) => {
                        const checked = form.linkedPackageIds.includes(pkg.id);
                        return (
                          <label
                            key={pkg.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                              checked
                                ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold"
                                : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePackageLink(pkg.id)}
                              className="rounded text-emerald-800"
                            />
                            <span className="truncate">{pkg.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-sm font-bold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {submitting
                    ? "Saving Changes..."
                    : editingHotelId
                    ? "Save Hotel Changes"
                    : "Create Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal for Main / Gallery Images */}
      <MediaPickerModal
        isOpen={mediaPickerTarget !== null}
        onClose={() => setMediaPickerTarget(null)}
        categoryFilter="HOTELS"
        title={
          mediaPickerTarget === "MAIN"
            ? "Select Main Hotel Image"
            : "Add Image to Hotel Gallery"
        }
        onSelect={(url) => {
          if (mediaPickerTarget === "MAIN") {
            setForm((prev) => ({ ...prev, mainImage: url }));
          } else if (mediaPickerTarget === "GALLERY") {
            setForm((prev) => ({
              ...prev,
              gallery: [...prev.gallery, url],
            }));
          }
          setMediaPickerTarget(null);
        }}
      />
    </div>
  );
}
