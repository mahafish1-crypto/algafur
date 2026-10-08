"use client";

import React, { useState } from "react";
import {
  Image as ImageIcon,
  Search,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Filter,
  Folder,
  X,
  UploadCloud,
} from "lucide-react";

interface MediaItem {
  id: string;
  name: string;
  category: string;
  url: string;
  fileType: string;
  fileSize: number;
  dimensions?: string | null;
  createdAt: string;
}

interface Props {
  initialMedia: MediaItem[];
}

export default function AdminMediaClient({ initialMedia }: Props) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [addForm, setAddForm] = useState({
    name: "",
    category: "MARKETING",
    url: "",
    dimensions: "1080x1080",
  });

  const categories = [
    { id: "ALL", label: "All Assets" },
    { id: "LOGO", label: "Brand Logos" },
    { id: "MARKETING", label: "Marketing Posters" },
    { id: "MAKKAH", label: "Makkah & Haram" },
    { id: "MADINAH", label: "Madinah & Nabawi" },
    { id: "HOTELS", label: "Hotels & Stays" },
    { id: "PACKAGES", label: "Package Banners" },
    { id: "AI_GENERATED", label: "AI Generated" },
  ];

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.url) {
      alert("Name and URL are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });

      if (res.ok) {
        const json = await res.json();
        setMediaList((prev) => [json.media, ...prev]);
        setIsAddOpen(false);
        setAddForm({
          name: "",
          category: "MARKETING",
          url: "",
          dimensions: "1080x1080",
        });
      } else {
        alert("Failed to add media.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding asset.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const filtered = mediaList.filter((m) => {
    const matchesCat =
      selectedCategory === "ALL" ? true : m.category === selectedCategory;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      m.name.toLowerCase().includes(term) ||
      m.category.toLowerCase().includes(term);

    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-emerald-700" />
            Media & Creative Asset Library
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Centralized repository for official branding, high-resolution Haram photos, hotel imagery, and marketing posters.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Media Asset
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedCategory === c.id
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assets by name or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No assets found in this category. Click "Add Media Asset" to upload one.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedAsset(item)}
              className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to placeholder if url fails
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/90 text-slate-900 text-xs font-semibold shadow">
                    View
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm uppercase">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {item.dimensions || "Asset"} &bull;{" "}
                  {new Date(item.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Asset Preview Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base truncate max-w-sm">{selectedAsset.name}</h3>
                <p className="text-xs text-emerald-200 uppercase tracking-wider">
                  Category: {selectedAsset.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="max-h-80 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.name}
                  className="max-h-80 w-auto object-contain"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono">
                <span className="truncate max-w-md text-slate-600">{selectedAsset.url}</span>
                <button
                  onClick={() => copyUrl(selectedAsset.url)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-800 text-white rounded text-xs font-sans font-medium hover:bg-emerald-900 ml-2 shrink-0"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl ? "Copied" : "Copy URL"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800">Dimensions: </span>
                  {selectedAsset.dimensions || "High Resolution"}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Format: </span>
                  {selectedAsset.fileType}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Media Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Add Digital Asset</h3>
                <p className="text-xs text-emerald-200">Register image in Al-Gafur Media Library</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Asset Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kaaba Twilight Sunset High-Res"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="MARKETING">Marketing & Social Posters</option>
                  <option value="LOGO">Official Logos & Emblems</option>
                  <option value="MAKKAH">Makkah & Haram</option>
                  <option value="MADINAH">Madinah & Nabawi</option>
                  <option value="HOTELS">Hotels & Stays</option>
                  <option value="PACKAGES">Package Banners</option>
                  <option value="AI_GENERATED">AI Generated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Image URL / Asset Path *
                </label>
                <input
                  type="text"
                  placeholder="e.g. /brand/poster.jpg or https://images.unsplash.com/..."
                  value={addForm.url}
                  onChange={(e) => setAddForm({ ...addForm, url: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Dimensions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1920x1080"
                  value={addForm.dimensions}
                  onChange={(e) => setAddForm({ ...addForm, dimensions: e.target.value })}
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
                  {submitting ? "Adding..." : "Add to Library"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

