"use client";

import React, { useState, useId } from "react";
import Image from "next/image";
import {
  Star,
  Quote,
  Video,
  Play,
  MessageSquarePlus,
  Plus,
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { parseVideoUrl } from "@/lib/video-parser";

export interface TestimonialItem {
  id: string;
  customerName: string;
  photo?: string | null;
  city: string;
  packageTitle: string;
  rating: number;
  reviewText: string;
  videoUrl?: string | null;
  isFeatured?: boolean;
  status?: string;
  createdAt?: string | Date;
}

interface PackageOption {
  id: string;
  name: string;
  slug: string;
}

interface ReviewsClientProps {
  initialReviews: TestimonialItem[];
  packages: PackageOption[];
}

export default function ReviewsClient({
  initialReviews,
  packages,
}: ReviewsClientProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "VIDEOS" | "WRITTEN">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [packageTitle, setPackageTitle] = useState(
    packages[0]?.name || "Umrah Deluxe Group"
  );
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [photo, setPhoto] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reviewsWithVideo = initialReviews.map((r) => ({
    ...r,
    video: parseVideoUrl(r.videoUrl),
  }));

  const videoReviews = reviewsWithVideo.filter((r) => Boolean(r.video.embedUrl));
  const writtenReviews = reviewsWithVideo.filter((r) => !r.video.embedUrl);

  const filtered =
    activeTab === "VIDEOS"
      ? videoReviews
      : activeTab === "WRITTEN"
      ? writtenReviews
      : reviewsWithVideo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          city: city.trim(),
          packageTitle: packageTitle.trim(),
          rating: Number(rating) || 5,
          reviewText: reviewText.trim(),
          photo: photo.trim() || null,
          videoUrl: videoUrl.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || "Failed to submit review. Please try again.");
        return;
      }

      setSubmittedSuccess(true);
      setName("");
      setCity("");
      setReviewText("");
      setPhoto("");
      setVideoUrl("");
    } catch {
      setErrorMsg("An unexpected network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Top Hero Banner */}
      <div className="relative bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950 text-white py-16 px-4 sm:px-8 border-b border-gold-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 text-gold-300 text-xs font-bold border border-gold-500/30">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Blessed Journeys &amp; Authentic Testimonials</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Voices of Blessed Pilgrims
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Real stories, recorded video reflections, and written gratitude from
            pilgrims who fulfilled their lifelong dream of Hajj and Umrah with
            AL GAFUR INTERNATIONAL TOURS AND TRAVELS.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gold-200">
            <div className="flex items-center gap-2 bg-forest-900/80 px-4 py-2 rounded-xl border border-gold-500/20">
              <div className="flex text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold-400" />
                ))}
              </div>
              <span className="font-bold text-white">5.0 Star Pilgrim Rating</span>
            </div>

            <div className="flex items-center gap-2 bg-forest-900/80 px-4 py-2 rounded-xl border border-gold-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">100% Verified Pilgrims</span>
            </div>

            <div className="flex items-center gap-2 bg-forest-900/80 px-4 py-2 rounded-xl border border-gold-500/20">
              <Video className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">
                {videoReviews.length} Video Testimonials
              </span>
            </div>
          </div>

          {/* Open Review Modal CTA */}
          <div className="pt-4" id="share">
            <button
              type="button"
              onClick={() => {
                setSubmittedSuccess(false);
                setErrorMsg(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-forest-950 text-xs sm:text-sm font-bold transition-all shadow-gold"
            >
              <MessageSquarePlus className="w-4 h-4 text-forest-950" />
              <span>Share Your Pilgrimage Experience</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-center">
          <div className="bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200 flex items-center gap-1 sm:gap-2 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "ALL"
                  ? "bg-forest-950 text-white shadow-md"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
              }`}
            >
              All Reviews ({reviewsWithVideo.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("VIDEOS")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 ${
                activeTab === "VIDEOS"
                  ? "bg-forest-950 text-white shadow-md"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
              }`}
            >
              <Video className="w-3.5 h-3.5 text-gold-400" />
              <span>Video Testimonials ({videoReviews.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("WRITTEN")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "WRITTEN"
                  ? "bg-forest-950 text-white shadow-md"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
              }`}
            >
              Written Reviews ({writtenReviews.length})
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8 space-y-3">
            <Quote className="w-12 h-12 text-neutral-300 mx-auto" />
            <h3 className="text-base font-bold text-forest-950">No reviews found in this category</h3>
            <p className="text-xs text-neutral-500">
              Be the first pilgrim to share your sacred journey experience!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((r, i) => {
              const initials = r.customerName
                .split(" ")
                .map((w) => w[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase() || "HA";

              const hasVideo = Boolean(r.video.embedUrl);
              const isPlaying = playingVideoId === (r.id || String(i));

              return (
                <div
                  key={r.id || i}
                  className="bg-white p-6 sm:p-7 rounded-2xl border border-neutral-200 hover:border-gold-500/50 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Card Top: Stars & Verified Pilgrim Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gold-500">
                        {r.rating > 0 ? (
                          [...Array(r.rating)].map((_, idx) => (
                            <Star
                              key={idx}
                              className="w-3.5 h-3.5 fill-gold-500 text-gold-500"
                            />
                          ))
                        ) : (
                          <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                        )}
                        <span className="text-[11px] font-bold text-neutral-700 ml-1">
                          {r.rating || 5}.0
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified Pilgrim</span>
                      </div>
                    </div>

                    {/* Video Player or Embed if present */}
                    {hasVideo && (
                      <div className="rounded-xl overflow-hidden border border-neutral-200 bg-black aspect-video relative group">
                        {isPlaying ? (
                          <iframe
                            src={r.video.embedUrl || ""}
                            title={`${r.customerName}'s Video Review`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        ) : (
                          <div
                            onClick={() => setPlayingVideoId(r.id || String(i))}
                            className="w-full h-full relative cursor-pointer flex items-center justify-center bg-forest-950 overflow-hidden"
                          >
                            {r.video.thumbnailUrl && (
                              <Image
                                src={r.video.thumbnailUrl}
                                alt={r.customerName}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover opacity-75 group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                            <div className="absolute inset-0 bg-forest-950/40 group-hover:bg-forest-950/20 transition-colors" />
                            <div className="relative z-10 w-12 h-12 rounded-full bg-gold-500 text-forest-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 fill-forest-950 ml-0.5" />
                            </div>
                            <div className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
                              <Video className="w-3 h-3 text-gold-400" />
                              <span>Play Video Review</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Review Text */}
                    <p className="text-xs sm:text-[13px] text-neutral-700 leading-relaxed italic">
                      &ldquo;{r.reviewText}&rdquo;
                    </p>
                  </div>

                  {/* Pilgrim Info Footer */}
                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-200/70 mt-4">
                    {r.photo ? (
                      <div className="relative w-11 h-11 rounded-full overflow-hidden bg-forest-900 flex-shrink-0 border-2 border-gold-400 shadow-sm">
                        <Image
                          src={r.photo}
                          alt={r.customerName}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-forest-950 text-gold-300 font-bold text-xs flex items-center justify-center flex-shrink-0 border-2 border-gold-400 shadow-sm">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-forest-950 truncate">
                        {r.customerName}
                      </h4>
                      {r.city && (
                        <p className="text-[11px] text-neutral-500 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400 inline" />
                          <span>{r.city}</span>
                        </p>
                      )}
                      {r.packageTitle && (
                        <p className="text-[10px] text-gold-700 font-semibold truncate">
                          {r.packageTitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-forest-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden my-8 animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-forest-950 text-white flex items-center justify-between border-b border-gold-500/20">
              <div>
                <h3 className="font-serif font-bold text-base text-gold-300">
                  Share Your Pilgrimage Experience
                </h3>
                <p className="text-xs text-emerald-200">
                  Help future pilgrims understand what it is like travelling with AL GAFUR.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-serif font-bold text-forest-950">
                  Alhamdulillah! Jazakallahu Khairan
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
                  Thank you for submitting your sacred review. To ensure authentic pilgrim experiences, your review will appear on the website shortly after moderation.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-forest-950 text-white text-xs font-bold hover:bg-forest-900 transition-colors"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-forest-950 mb-1">
                      Pilgrim Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Haji Aslam Shaikh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs sm:text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-neutral-50/50 text-neutral-900 focus:bg-white focus:outline-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-forest-950 mb-1">
                      City / Location *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pune, Maharashtra"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs sm:text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-neutral-50/50 text-neutral-900 focus:bg-white focus:outline-emerald-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-forest-950 mb-1">
                      Package / Tour Taken
                    </label>
                    <input
                      type="text"
                      list="package-options"
                      placeholder="e.g. Umrah Deluxe 15 Days"
                      value={packageTitle}
                      onChange={(e) => setPackageTitle(e.target.value)}
                      className="w-full text-xs sm:text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-neutral-50/50 text-neutral-900 focus:bg-white focus:outline-emerald-800"
                    />
                    <datalist id="package-options">
                      {packages.map((p) => (
                        <option key={p.id} value={p.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-forest-950 mb-1">
                      Overall Experience Rating
                    </label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-gold-500 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              rating >= star
                                ? "fill-gold-500 text-gold-500"
                                : "text-neutral-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-neutral-700 ml-2">
                        {rating} Star{rating > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-950 mb-1">
                    Your Pilgrimage Review &amp; Reflections *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share how the hotels, food, scholar guidance, and Ziyarat arrangements were handled..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-neutral-50/50 text-neutral-900 focus:bg-white focus:outline-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-950 mb-1">
                    Video Link (Optional — YouTube, Shorts, or Instagram Reel)
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/shorts/... or https://instagram.com/reel/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-neutral-50/50 text-neutral-900 focus:bg-white focus:outline-emerald-800"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Paste a link to your recorded video testimonial on YouTube or Instagram.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-950 mb-1">
                    Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="Link to your pilgrim photo (leave empty for initials avatar)"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-neutral-50/50 text-neutral-900 focus:bg-white focus:outline-emerald-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-forest-950 hover:bg-forest-900 text-white text-xs font-bold disabled:opacity-50 inline-flex items-center gap-2 shadow-sm"
                  >
                    {submitting ? "Submitting..." : "Submit Pilgrim Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
