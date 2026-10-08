"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  variant?: "default" | "light" | "image-only";
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  href?: string;
}

export default function BrandLogo({
  className = "",
  variant = "default",
  size = "md",
  showTagline = false,
  href = "/",
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
      {/* Official Kaaba Emblem with Gold Silhouettes */}
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
            fill="#182230"
            stroke="#c59b27"
            strokeWidth="2"
          />

          {/* Kiswah Gold Bands (Top Ribbon) */}
          <polyline
            points="36,54 80,72 124,54"
            fill="none"
            stroke="#d4af37"
            strokeWidth="5"
          />
          <polyline
            points="36,62 80,80 124,62"
            fill="none"
            stroke="#f5eccd"
            strokeWidth="2"
          />

          {/* Golden Mosque / Domes / Minarets Silhouette Overlay */}
          <path
            d="M 52,112 L 52,90 Q 56,86 60,90 L 60,114 Z"
            fill="#d4af37"
          />
          <path
            d="M 62,114 L 62,82 Q 67,76 72,82 L 72,116 Z"
            fill="#c59b27"
          />
          {/* Central Grand Dome */}
          <path
            d="M 70,116 C 70,90 90,90 90,116 Z"
            fill="#d4af37"
          />
          {/* Crescent Finial */}
          <path
            d="M 80,86 Q 81,84 80,82 Q 78,84 80,86 Z"
            fill="#fbf8ec"
          />
          {/* Right Minaret & Domes */}
          <path
            d="M 88,116 L 88,82 Q 93,76 98,82 L 98,114 Z"
            fill="#c59b27"
          />
          <path
            d="M 100,114 L 100,90 Q 104,86 108,90 L 108,112 Z"
            fill="#d4af37"
          />

          {/* Airplane Trail & Plane (Ascending Toward Holy Sanctuary) */}
          <path
            d="M 14,136 Q 30,122 56,126"
            fill="none"
            stroke="#c59b27"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Airplane Icon */}
          <path
            d="M 28,126 L 36,122 L 32,130 L 38,131 L 34,136 L 24,134 L 20,138 L 18,136 L 22,130 Z"
            fill="#c59b27"
          />
        </svg>
      </div>

      {/* Typography: Official AL-GAFUR Brand Text */}
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
          AL-GAFUR
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
            Your Sacred Journey, Handled With Care.
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

