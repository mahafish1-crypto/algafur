"use client";

import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Search,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  X,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

export interface MediaItem {
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
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState("MARKETING");
  const [customName, setCustomName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: "ALL", label: "All Assets" },
    { id: "LOGO", label: "Brand Logos" },
    { id: "MARKETING", label: "Marketing Posters" },
    { id: "PACKAGES", label: "Package Banners" },
    { id: "HOTELS", label: "Hotels & Stays" },
    { id: "MAKKAH", label: "Makkah & Haram" },
    { id: "MADINAH", label: "Madinah & Nabawi" },
    { id: "AI_GENERATED", label: "AI Generated" },
  ];

  const handleFileSelect = (file: File) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setErrorMessage("Only JPG, PNG, and WEBP images are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds 10MB limit.");
      return;
    }
    setErrorMessage(null);
    setUploadFile(file);
    if (!customName) {
      setCustomName(file.name.replace(/\.[^/.]+$/, ""));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setErrorMessage("Please select an image file to upload.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("category", uploadCategory);
      formData.append("name", customName || uploadFile.name);

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setMediaList((prev) => [data.media, ...prev]);
      closeUploadModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const closeUploadModal = () => {
    setIsUploadOpen(false);
    setUploadFile(null);
    setPreviewUrl(null);
    setCustomName("");
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media asset? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete media asset");
      }

      setMediaList((prev) => prev.filter((m) => m.id !== id));
      if (selectedAsset?.id === id) {
        setSelectedAsset(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting asset");
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filtered = mediaList.filter((m) => {
    const matchesCat = selectedCategory === "ALL" ? true : m.category === selectedCategory;
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
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-gold-400" />
            Media Asset Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized digital assets for Packages, Hotels, Website Logo, Header, and Marketing.
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-forest-950 font-bold text-xs shadow-gold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Upload Media</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedCategory === c.id
                  ? "bg-gold-500 text-forest-950 shadow-sm"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
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
            placeholder="Search media by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-gold-400"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-slate-950 rounded-2xl border border-dashed border-slate-800 p-8">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30 text-gold-400" />
            <p className="text-sm font-semibold text-slate-300">No media assets found</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;+ Upload Media&quot; above to upload your first image.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="group relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-gold-500/40 transition-all flex flex-col justify-between"
            >
              <div
                onClick={() => setSelectedAsset(item)}
                className="aspect-square bg-slate-900 relative overflow-hidden flex items-center justify-center cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1 rounded-full bg-forest-950/90 text-gold-300 border border-gold-500/30 text-xs font-semibold shadow">
                    View Details
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-gold-300 backdrop-blur-sm uppercase">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-2">
                <h4 className="text-xs font-semibold text-white truncate" title={item.name}>
                  {item.name}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{formatFileSize(item.fileSize)}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>

                <div className="flex items-center gap-1 pt-1 border-t border-slate-900">
                  <button
                    onClick={() => copyUrl(item.id, item.url)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] flex items-center justify-center gap-1 transition-colors"
                    title="Copy Image URL"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteMedia(item.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Media Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-gold-600" />
                <h3 className="text-lg font-serif font-bold text-slate-900">
                  Upload Media to Library
                </h3>
              </div>
              <button
                onClick={closeUploadModal}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-gold-500 bg-gold-50/50"
                    : previewUrl
                    ? "border-emerald-500/50 bg-emerald-50/20"
                    : "border-slate-300 hover:border-gold-400 bg-slate-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="space-y-3">
                    <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      {uploadFile?.name} ({formatFileSize(uploadFile?.size || 0)}) &bull; Click to change
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <UploadCloud className="w-10 h-10 mx-auto text-slate-400" />
                    <p className="text-xs font-semibold text-slate-700">
                      Drag &amp; drop an image here, or <span className="text-gold-600 underline">browse files</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Supports JPG, JPEG, PNG, WEBP (Max 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Title / Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Asset Title / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diyafa Jamal Makkah Hotel Quad Room"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Target Category *
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="MARKETING">Marketing & Social Posters</option>
                  <option value="LOGO">Brand Logo & Identity</option>
                  <option value="PACKAGES">Package Banners</option>
                  <option value="HOTELS">Hotels & Accommodations</option>
                  <option value="MAKKAH">Makkah & Haram</option>
                  <option value="MADINAH">Madinah & Nabawi</option>
                  <option value="AI_GENERATED">AI Generated</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !uploadFile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-950 hover:bg-forest-900 text-gold-300 font-bold text-xs shadow-md disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 text-gold-400" />
                      <span>Upload &amp; Save to Library</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Preview Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 truncate max-w-md">
                {selectedAsset.name}
              </h3>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative h-72 w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200">
              <img
                src={selectedAsset.url}
                alt={selectedAsset.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-semibold text-slate-800">{selectedAsset.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">File Size</span>
                <span className="font-semibold text-slate-800">{formatFileSize(selectedAsset.fileSize)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">File Type</span>
                <span className="font-semibold text-slate-800">{selectedAsset.fileType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Uploaded</span>
                <span className="font-semibold text-slate-800">{formatDate(selectedAsset.createdAt)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="w-full sm:w-auto flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedAsset.url}
                  className="w-full sm:w-80 text-xs px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-mono"
                />
                <button
                  onClick={() => copyUrl(selectedAsset.id, selectedAsset.url)}
                  className="px-3 py-2 rounded-lg bg-forest-900 text-gold-300 font-semibold text-xs flex items-center gap-1 hover:bg-forest-800 flex-shrink-0"
                >
                  {copiedId === selectedAsset.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <a
                  href={selectedAsset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full</span>
                </a>
                <button
                  onClick={() => handleDeleteMedia(selectedAsset.id)}
                  className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
