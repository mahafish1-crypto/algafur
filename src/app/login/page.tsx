"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/brand/BrandLogo";
import { Lock, Mail, ShieldCheck, UserCheck, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (data.redirectTo) {
        router.push(data.redirectTo);
      } else if (data.user.role === "CUSTOMER") {
        router.push("/customer/dashboard");
      } else if (data.user.role === "AGENT") {
        router.push("/agent/dashboard");
      } else {
        router.push("/admin");
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-forest-950 to-forest-950 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo variant="light" size="lg" showTagline={true} />
          </div>
          <h2 className="text-xl font-serif font-bold text-white pt-2">
            Al-Gafur Unified Portal
          </h2>
          <p className="text-xs text-emerald-200/70">
            Sign in to access your Pilgrim Dashboard or authorized Staff Workspace.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-forest-900/90 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-950/80 border border-red-500/40 text-red-200 rounded-xl text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-emerald-100 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-400/60 absolute left-3 top-3.5" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs pl-9 pr-3 py-3 rounded-xl bg-forest-950/80 border border-emerald-800 focus:border-gold-400 focus:outline-none text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-emerald-100 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400/60 absolute left-3 top-3.5" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-9 pr-9 py-3 rounded-xl bg-forest-950/80 border border-emerald-800 focus:border-gold-400 focus:outline-none text-white"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-forest-950 font-bold py-3.5 px-4 rounded-xl text-xs shadow-gold transition-all duration-300 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{loading ? "Authenticating..." : "Sign In to Portal"}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-emerald-200/80">
            <span>New Pilgrim Customer?</span>
            <Link
              href="/signup"
              className="font-bold text-gold-300 hover:text-white underline"
            >
              Create Customer Account →
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span>Staff accounts and module permissions are managed by Super Admin</span>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-emerald-300/80 hover:text-gold-300 underline">
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
