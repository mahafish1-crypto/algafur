"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Search,
  UploadCloud,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { MediaItem } from "@/app/admin/media/AdminMediaClient";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  categoryFilter?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select Image from Media Library",
  categoryFilter,
}: MediaPickerModalProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || "ALL");
  const [activeTab, setActiveTab] = useState<"LIBRARY" | "UPLOAD">("LIBRARY");

  // Direct Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (data.media) {
        setMediaList(data.media);
      }
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("category", selectedCategory === "ALL" ? "PACKAGES" : selectedCategory);
      formData.append("name", uploadFile.name.replace(/\.[^/.]+$/, ""));

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Add to list and select immediately
      setMediaList((prev) => [data.media, ...prev]);
      onSelect(data.media.url);
      onClose();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: "ALL", label: "All" },
    { id: "PACKAGES", label: "Packages" },
    { id: "HOTELS", label: "Hotels" },
    { id: "LOGO", label: "Logos" },
    { id: "MAKKAH", label: "Makkah" },
    { id: "MADINAH", label: "Madinah" },
    { id: "MARKETING", label: "Marketing" },
  ];

  const filtered = mediaList.filter((m) => {
    const matchesCat = selectedCategory === "ALL" ? true : m.category === selectedCategory;
    const term = search.toLowerCase();
    const matchesSearch = !term || m.name.toLowerCase().includes(term);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gold-600" />
            <h3 className="text-base font-serif font-bold text-slate-900">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("LIBRARY")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "LIBRARY"
                ? "bg-forest-950 text-gold-300"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Choose from Library ({mediaList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("UPLOAD")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "UPLOAD"
                ? "bg-forest-950 text-gold-300"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            + Upload New File
          </button>
        </div>

        {activeTab === "LIBRARY" ? (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            {/* Search & Categories */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center flex-shrink-0">
              <div className="flex flex-wrap gap-1 w-full sm:w-auto">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                      selectedCategory === c.id
                        ? "bg-gold-500 text-forest-950"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              {loading ? (
                <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gold-500" />
                  <span className="text-xs">Loading media assets...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  No images found. Switch to the &quot;Upload New File&quot; tab to upload one!
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {filtered.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelect(item.url);
                        onClose();
                      }}
                      className="group relative bg-slate-100 rounded-xl overflow-hidden aspect-square border border-slate-200 hover:border-gold-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-forest-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-2.5 py-1 rounded-full bg-gold-400 text-forest-950 font-bold text-[10px] shadow flex items-center gap-1">
                          <Check className="w-3 h-3" /> Select
                        </span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[10px] text-white truncate text-center">
                        {item.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleDirectUpload} className="space-y-4 py-2">
            {uploadError && (
              <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs">
                {uploadError}
              </div>
            )}

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
                id="media-picker-file"
              />
              <label htmlFor="media-picker-file" className="cursor-pointer block space-y-2">
                {previewUrl ? (
                  <div className="space-y-2">
                    <img src={previewUrl} alt="Preview" className="h-40 mx-auto object-contain rounded-lg" />
                    <p className="text-xs text-slate-500 font-semibold">{uploadFile?.name}</p>
                    <span className="text-[11px] text-gold-600 underline">Click to choose different image</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 mx-auto text-slate-400" />
                    <p className="text-xs font-semibold text-slate-700">Click to upload from computer</p>
                    <p className="text-[11px] text-slate-400">JPG, PNG, WEBP (Max 10MB)</p>
                  </>
                )}
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("LIBRARY")}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Back to Library
              </button>
              <button
                type="submit"
                disabled={!uploadFile || uploading}
                className="px-5 py-2.5 rounded-xl bg-forest-950 text-gold-300 font-bold text-xs disabled:opacity-50"
              >
                {uploading ? "Uploading & Selecting..." : "Upload & Select"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

