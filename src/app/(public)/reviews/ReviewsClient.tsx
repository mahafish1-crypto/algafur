"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Quote,
  Video,
  Play,
  MessageSquarePlus,
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  LogIn,
  UserPlus,
} from "lucide-react";
import { parseVideoUrl } from "@/lib/video-parser";
import TestimonialCard from "@/components/testimonials/TestimonialCard";

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

export interface CurrentUserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ReviewsClientProps {
  initialReviews: TestimonialItem[];
  packages: PackageOption[];
  currentUser?: CurrentUserSession | null;
}

export default function ReviewsClient({
  initialReviews,
  packages,
  currentUser = null,
}: ReviewsClientProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "VIDEOS" | "WRITTEN">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(currentUser?.name || "");
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

  const handleOpenReviewModal = () => {
    if (!currentUser) {
      setIsAuthPromptOpen(true);
      return;
    }
    setSubmittedSuccess(false);
    setErrorMsg(null);
    if (!name && currentUser?.name) {
      setName(currentUser.name);
    }
    setIsModalOpen(true);
  };

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
              onClick={handleOpenReviewModal}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {filtered.map((r, i) => (
              <TestimonialCard
                key={r.id || i}
                testimonial={{
                  id: r.id,
                  customerName: r.customerName,
                  city: r.city,
                  packageTitle: r.packageTitle,
                  rating: r.rating,
                  reviewText: r.reviewText,
                  photo: r.photo,
                  videoUrl: r.video?.originalUrl,
                  isFeatured: r.isFeatured,
                }}
                isPlaying={playingVideoId === (r.id || String(i))}
                onPlay={() => setPlayingVideoId(r.id || String(i))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Auth Prompt Modal (For Non-Logged-In Pilgrims) */}
      {isAuthPromptOpen && (
        <div className="fixed inset-0 z-50 bg-forest-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden my-8 p-6 sm:p-8 space-y-6 text-center relative">
            <button
              type="button"
              onClick={() => setIsAuthPromptOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-forest-950 to-forest-800 text-gold-400 flex items-center justify-center mx-auto shadow-gold">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
                Verified Pilgrim Network
              </span>
              <h3 className="text-xl font-serif font-bold text-forest-950">
                Sign In to Share Your Journey Review
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-xs mx-auto">
                To guarantee genuine, authentic pilgrim experiences and prevent spam, reviews can only be submitted by verified pilgrims with an active account.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/login?redirect=/reviews#share"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-forest-950 hover:bg-forest-900 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                <LogIn className="w-4 h-4 text-gold-400" />
                <span>Sign In with Existing Account</span>
              </Link>

              <Link
                href="/signup?redirect=/reviews#share"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gold-400 hover:bg-gold-300 text-forest-950 text-xs sm:text-sm font-bold shadow-gold transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register New Pilgrim Account</span>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setIsAuthPromptOpen(false)}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              Cancel &amp; Continue Browsing
            </button>
          </div>
        </div>
      )}

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
