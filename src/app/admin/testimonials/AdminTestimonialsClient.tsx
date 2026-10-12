"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Quote,
  Star,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

interface TestimonialRecord {
  id: string;
  customerName: string;
  photo?: string | null;
  city: string;
  packageTitle: string;
  rating: number;
  reviewText: string;
  videoUrl?: string | null;
  isFeatured: boolean;
  status: string;
  createdAt?: string;
}

interface PackageOption {
  id: string;
  name: string;
  slug: string;
}

interface AdminTestimonialsClientProps {
  initialTestimonials: TestimonialRecord[];
  allPackages: PackageOption[];
}

const emptyForm = {
  id: "",
  customerName: "",
  photo: "",
  city: "",
  packageTitle: "",
  rating: 5,
  reviewText: "",
  isFeatured: true,
  status: "PUBLISHED",
};

export default function AdminTestimonialsClient({
  initialTestimonials,
  allPackages,
}: AdminTestimonialsClientProps) {
  const [testimonials, setTestimonials] =
    useState<TestimonialRecord[]>(initialTestimonials);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PUBLISHED" | "DRAFT"
  >("ALL");
  const [showPreview, setShowPreview] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  const openAddModal = () => {
    setErrorMsg(null);
    setForm({
      ...emptyForm,
      packageTitle: allPackages[0]?.name || "Umrah Platinum Package (15 Days)",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: TestimonialRecord) => {
    setErrorMsg(null);
    setForm({
      id: t.id,
      customerName: t.customerName || "",
      photo: t.photo || "",
      city: t.city || "",
      packageTitle: t.packageTitle || "",
      rating: t.rating ?? 5,
      reviewText: t.reviewText || "",
      isFeatured: Boolean(t.isFeatured),
      status: t.status || "PUBLISHED",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const isEditing = Boolean(form.id);
      const url = isEditing
        ? `/api/testimonials/${form.id}`
        : "/api/testimonials";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          photo: form.photo.trim() || null,
          city: form.city.trim(),
          packageTitle: form.packageTitle.trim(),
          rating: Number(form.rating),
          reviewText: form.reviewText.trim(),
          isFeatured: form.isFeatured,
          status: form.status,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || "Failed to save testimonial.");
        return;
      }

      if (isEditing) {
        setTestimonials((prev) =>
          prev.map((item) => (item.id === form.id ? json.testimonial : item))
        );
      } else {
        setTestimonials((prev) => [json.testimonial, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Error saving testimonial."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (t: TestimonialRecord) => {
    const nextStatus = t.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/testimonials/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setTestimonials((prev) =>
          prev.map((item) => (item.id === t.id ? json.testimonial : item))
        );
      }
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (t: TestimonialRecord) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the testimonial from "${t.customerName}"?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/testimonials/${t.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTestimonials((prev) => prev.filter((item) => item.id !== t.id));
      } else {
        alert("Failed to delete testimonial.");
      }
    } catch {
      alert("Error deleting testimonial.");
    }
  };

  const filtered = testimonials.filter((t) =>
    statusFilter === "ALL" ? true : t.status === statusFilter
  );

  const publishedForPreview = testimonials.filter(
    (t) => t.status === "PUBLISHED"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Quote className="w-7 h-7 text-emerald-700" />
            Voices of Blessed Pilgrims (Testimonials)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Add, edit, publish, or unpublish pilgrim testimonials displayed on
            the public homepage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
          >
            <Eye className="w-4 h-4 text-emerald-700" />
            {showPreview ? "Hide Homepage Preview" : "Preview Homepage Section"}
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Pilgrim Testimonial
          </button>
        </div>
      </div>

      {/* Live Homepage Preview */}
      {showPreview && (
        <div className="bg-ivory-100 p-6 sm:p-8 rounded-2xl border-2 border-amber-400/50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Live Homepage Preview — Voices of Blessed Pilgrims (
              {publishedForPreview.length} Published)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {publishedForPreview.map((r) => {
              const initials = r.customerName
                .split(" ")
                .map((w) => w[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <div
                  key={r.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      {r.rating > 0 ? (
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(r.rating)].map((_, idx) => (
                            <Star
                              key={idx}
                              className="w-3.5 h-3.5 fill-amber-400"
                            />
                          ))}
                        </div>
                      ) : (
                        <span />
                      )}
                      <Quote className="w-5 h-5 text-emerald-200" />
                    </div>
                    <p className="text-xs text-slate-700 italic leading-relaxed mb-4">
                      &ldquo;{r.reviewText}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    {r.photo ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-900 shrink-0">
                        <Image
                          src={r.photo}
                          alt={r.customerName}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-950 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {r.customerName}
                      </h4>
                      <p className="text-[10px] text-slate-500">{r.city}</p>
                      <p className="text-[10px] text-amber-700 font-semibold">
                        {r.packageTitle}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
        {(["ALL", "PUBLISHED", "DRAFT"] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === st
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {st === "ALL"
              ? `All (${testimonials.length})`
              : st === "PUBLISHED"
              ? `Published (${
                  testimonials.filter((i) => i.status === "PUBLISHED").length
                })`
              : `Draft / Unpublished (${
                  testimonials.filter((i) => i.status === "DRAFT").length
                })`}
          </button>
        ))}
      </div>

      {/* Testimonials Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t) => {
          const initials = t.customerName
            .split(" ")
            .map((w) => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {t.rating > 0 &&
                      [...Array(t.rating)].map((_, idx) => (
                        <Star
                          key={idx}
                          className="w-3.5 h-3.5 fill-amber-400"
                        />
                      ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {t.isFeatured && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Featured
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(t)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        t.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {t.status === "PUBLISHED" ? (
                        <>
                          <Eye className="w-3 h-3" /> Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> Draft
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;{t.reviewText}&rdquo;
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  {t.photo ? (
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-300 bg-slate-900 shrink-0">
                      <Image
                        src={t.photo}
                        alt={t.customerName}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-emerald-900 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {t.customerName}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{t.city}</p>
                    <p className="text-[11px] font-semibold text-amber-700 truncate">
                      {t.packageTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openEditModal(t)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 px-2.5 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {form.id
                    ? `Edit Testimonial: ${form.customerName}`
                    : "Add Pilgrim Testimonial"}
                </h3>
                <p className="text-xs text-emerald-200">
                  Manage review text, package association, and publication
                  status
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

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Pilgrim Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Haji Nizam Tamboli"
                    value={form.customerName}
                    onChange={(e) =>
                      setForm({ ...form, customerName: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Camp, Pune, Maharashtra"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Package / Group Name
                  </label>
                  <input
                    type="text"
                    list="package-suggestions"
                    placeholder="e.g. Umrah Platinum Group 2026"
                    value={form.packageTitle}
                    onChange={(e) =>
                      setForm({ ...form, packageTitle: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                  <datalist id="package-suggestions">
                    {allPackages.map((p) => (
                      <option key={p.id} value={p.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Rating
                  </label>
                  <select
                    value={form.rating}
                    onChange={(e) =>
                      setForm({ ...form, rating: Number(e.target.value) })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={0}>No Star Rating</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Testimonial Review Text *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter the pilgrim's review..."
                  value={form.reviewText}
                  onChange={(e) =>
                    setForm({ ...form, reviewText: e.target.value })
                  }
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                />
              </div>

              {/* Photo Picker */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Pilgrim Photo (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Upload / Select Photo
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Photo URL (or leave blank for initials avatar)"
                    value={form.photo}
                    onChange={(e) =>
                      setForm({ ...form, photo: e.target.value })
                    }
                    className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                  {form.photo && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, photo: "" })}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  >
                    <option value="PUBLISHED">Published (Visible)</option>
                    <option value="DRAFT">Draft (Unpublished)</option>
                  </select>
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) =>
                        setForm({ ...form, isFeatured: e.target.checked })
                      }
                      className="rounded text-emerald-800 w-4 h-4"
                    />
                    <span>Feature at top of section</span>
                  </label>
                </div>
              </div>

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
                  {submitting ? "Saving..." : "Save Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        categoryFilter="CUSTOMERS"
        title="Select Pilgrim Testimonial Photo"
        onSelect={(url) => {
          setForm((prev) => ({ ...prev, photo: url }));
          setIsMediaPickerOpen(false);
        }}
      />
    </div>
  );
}

