"use client";

import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  variant?: "default" | "light" | "image-only";
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  href?: string;
  customLogoUrl?: string;
  companyName?: string;
  tagline?: string;
}

export default function BrandLogo({
  className = "",
  variant = "default",
  size = "md",
  showTagline = false,
  href = "/",
  customLogoUrl,
  companyName = "AL-GAFUR",
  tagline = "Your Sacred Journey, Handled With Care.",
}: BrandLogoProps) {
  const isLight = variant === "light";

  const sizeClasses = {
    sm: "h-9",
    md: "h-12",
    lg: "h-16",
    xl: "h-24",
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* If Custom Logo Image exists, render it; otherwise render official Kaaba emblem */}
      {customLogoUrl ? (
        <div className={`relative flex-shrink-0 flex items-center justify-center ${sizeClasses}`}>
          <img
            src={customLogoUrl}
            alt={companyName}
            className={`${sizeClasses} w-auto max-w-[180px] object-contain rounded-md`}
          />
        </div>
      ) : (
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg
            viewBox="0 0 160 160"
            className={`${sizeClasses} w-auto aspect-square`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Subtle Outer Glow */}
            <circle cx="80" cy="80" r="76" fill={isLight ? "rgba(197, 155, 39, 0.12)" : "rgba(6, 78, 59, 0.05)"} />
            
            {/* Kaaba Main Block - Isometric 3D Cube */}
            {/* Top Face */}
            <polygon
              points="80,24 124,42 80,60 36,42"
              fill="#111827"
              stroke="#c59b27"
              strokeWidth="2"
            />
            {/* Right Face */}
            <polygon
              points="124,42 124,106 80,126 80,60"
              fill="#090d12"
              stroke="#c59b27"
              strokeWidth="2"
            />
            {/* Left Face */}
            <polygon
              points="36,42 80,60 80,126 36,106"
              fill="#1c2430"
              stroke="#c59b27"
              strokeWidth="2"
            />

            {/* Sacred Kiswah Gold Belt (Hizam) - Right Side */}
            <polygon
              points="124,54 124,64 80,82 80,72"
              fill="url(#goldGradientHizam)"
            />
            {/* Sacred Kiswah Gold Belt (Hizam) - Left Side */}
            <polygon
              points="36,54 80,72 80,82 36,64"
              fill="url(#goldGradientHizam)"
            />

            {/* Bab Al-Kaaba (Golden Door on Left Facade) */}
            <polygon
              points="48,70 64,76 64,105 48,98"
              fill="url(#goldGradientDoor)"
              stroke="#ffd700"
              strokeWidth="1"
            />

            {/* Crescent & Star Finial / Minaret Accent */}
            <path
              d="M 80,8 A 7,7 0 1,1 86,16 A 5.5,5.5 0 1,0 80,8 Z"
              fill="#c59b27"
            />

            <defs>
              <linearGradient id="goldGradientHizam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f7d070" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#aa7c11" />
              </linearGradient>
              <linearGradient id="goldGradientDoor" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff3b0" />
                <stop offset="60%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#996515" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Typography: Brand Text */}
      <div className="flex flex-col justify-center">
        <span
          className={`font-serif tracking-widest leading-none font-extrabold ${
            size === "sm"
              ? "text-lg"
              : size === "md"
              ? "text-2xl"
              : size === "lg"
              ? "text-3xl"
              : "text-4xl"
          } ${
            isLight
              ? "text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-200 to-gold-400"
              : "text-transparent bg-clip-text bg-gradient-to-r from-gold-600 via-amber-600 to-gold-700"
          }`}
          style={{ letterSpacing: "0.14em" }}
        >
          {companyName}
        </span>
        <span
          className={`font-sans tracking-widest font-semibold uppercase ${
            size === "sm"
              ? "text-[7.5px]"
              : size === "md"
              ? "text-[9.5px]"
              : size === "lg"
              ? "text-xs"
              : "text-sm"
          } ${isLight ? "text-amber-200/90" : "text-amber-800/90"}`}
          style={{ letterSpacing: "0.22em" }}
        >
          International Tours And Travels
        </span>
        {showTagline && (
          <span className={`text-[10px] mt-0.5 italic ${isLight ? "text-emerald-200/70" : "text-emerald-800/70"}`}>
            {tagline}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
}
