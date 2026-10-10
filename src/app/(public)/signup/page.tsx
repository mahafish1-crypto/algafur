"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/brand/BrandLogo";
import {
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

export default function SignupPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "Pune",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (formData.name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    const digitsOnly = formData.phone.replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      setError("Please enter a valid 10 to 12 digit mobile number.");
      return;
    }

    if (formData.password.length < 8 || !/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      setError("Password must be at least 8 characters and include at least 1 letter and 1 number.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.acceptedTerms) {
      setError("Please accept the User Agreement and Privacy Policy to create your pilgrim account.");
      return;
    }

    setLoading(true);
    trackAnalyticsEvent({
      eventType: "SIGNUP_START",
      sourcePage: "/signup",
      language,
    });

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          agreementVersion: "v1.0",
          privacyVersion: "v1.0",
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push(data.redirectTo || "/customer/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not complete registration";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 flex flex-col justify-center items-center py-12 px-4 sm:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-forest-950 to-forest-950 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo variant="light" size="md" showTagline={true} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white pt-2">
            {t("auth_signup_title")}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/75 max-w-md mx-auto">
            {t("auth_signup_sub")}
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-forest-900/90 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
          {error && (
            <div
              role="alert"
              className="p-3.5 bg-red-950/80 border border-red-500/40 text-red-200 rounded-xl text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="signup-name" className="block text-xs font-semibold text-emerald-100 mb-1">
                {t("form_full_name")} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-400/60 absolute left-3 top-3.5" />
                <input
                  id="signup-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Haji Nizam Tamboli"
                  className="w-full text-xs pl-9 pr-3 py-3 rounded-xl bg-forest-950/80 border border-emerald-800 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-600/80"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mobile / WhatsApp */}
              <div>
                <label htmlFor="signup-phone" className="block text-xs font-semibold text-emerald-100 mb-1">
                  {t("form_mobile")} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-400/60 absolute left-3 top-3.5" />
                  <input
                    id="signup-phone"
                    type="tel"
                    inputMode="tel"
                    required
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9890708013"
                    className="w-full text-xs pl-9 pr-3 py-3 rounded-xl bg-forest-950/80 border border-emerald-800 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-600/80"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label htmlFor="signup-city" className="block text-xs font-semibold text-emerald-100 mb-1">
                  {t("form_city")}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-400/60 absolute left-3 top-3.5" />
                  <input
                    id="signup-city"
                    type="text"
                    autoComplete="address-level2"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Pune, Mumbai, etc."
                    className="w-full text-xs pl-9 pr-3 py-3 rounded-xl bg-forest-950/80 border border-emerald-800 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-600/80"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-emerald-100 mb-1">
                {t("form_email")} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-400/60 absolute left-3 top-3.5" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full text-xs pl-9 pr-3 py-3 rounded-xl bg-forest-950/80 border border-emerald-800 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-600/80"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="signup-password" className="block text-xs font-semibold text-emerald-100 mb-1">
                  {t("auth_password")} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-400/60 absolute left-3 top-3.5" />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 8 chars (A-Z, 0-9)"
                    className="w-full text-xs pl-9 pr-9 py-3 rounded-xl bg-forest-950/80 border border-emerald-800 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-600/80"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-emerald-300/70 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="signup-confirm-password" className="block text-xs font-semibold text-emerald-100 mb-1">
                  {t("auth_confirm_password")} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-400/60 absolute left-3 top-3.5" />
                  <input
                    id="signup-confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="w-full text-xs pl-9 pr-3 py-3 rounded-xl bg-forest-950/80 border border-emerald-800 focus:border-gold-400 focus:outline-none text-white placeholder-emerald-600/80"
                  />
                </div>
              </div>
            </div>

            {/* User Agreement & Privacy Policy Checkbox (Not pre-checked) */}
            <div className="bg-forest-950/70 p-3.5 rounded-xl border border-emerald-800/60">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-emerald-100/90 leading-relaxed">
                <input
                  type="checkbox"
                  required
                  checked={formData.acceptedTerms}
                  onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-emerald-600 text-gold-500 focus:ring-gold-400"
                />
                <span>
                  {t("auth_agree_terms")}{" "}
                  <Link href="/user-agreement" className="text-gold-300 underline hover:text-white">
                    {t("footer_user_agreement")}
                  </Link>{" "}
                  &amp;{" "}
                  <Link href="/privacy-policy" className="text-gold-300 underline hover:text-white">
                    {t("footer_privacy")}
                  </Link>{" "}
                  (v1.0) *
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-forest-950 font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-gold transition-all duration-300 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? "Creating Account..." : t("auth_create_account")}</span>
            </button>
          </form>

          {/* Portal Benefits */}
          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-emerald-200/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
              <span>Track Visa &amp; PNR Status</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
              <span>Download Receipts &amp; Vouchers</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-emerald-200/80">
            <span>{t("auth_have_account")}</span>
            <Link
              href="/login"
              className="font-bold text-gold-300 hover:text-white underline"
            >
              {t("auth_sign_in")} →
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-200/60">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
          <span>Encrypted Pilgrim Portal • Al-Gafur International Tours And Travels</span>
        </div>
      </div>
    </div>
  );
}

