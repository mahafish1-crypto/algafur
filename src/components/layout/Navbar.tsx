"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "../brand/BrandLogo";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES } from "@/lib/i18n";
import {
  Phone,
  MessageCircle,
  Menu,
  X,
  Globe,
  ChevronDown,
  UserCheck,
  Search,
  Compass,
} from "lucide-react";

interface NavbarProps {
  settings?: Record<string, string>;
}

export default function Navbar({ settings = {} }: NavbarProps) {
  const pathname = usePathname();
  const { language, setLanguage, t, isRtl } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("nav_home"), href: "/" },
    { name: t("nav_packages"), href: "/packages" },
    { name: t("nav_hajj"), href: "/hajj" },
    { name: t("nav_umrah"), href: "/umrah" },
    { name: t("nav_ramadan"), href: "/ramadan-umrah" },
    { name: t("nav_hotels"), href: "/hotels" },
    { name: t("nav_ziyarat"), href: "/gallery" },
    { name: t("nav_about"), href: "/about" },
    { name: t("nav_blog"), href: "/blog" },
    { name: t("nav_contact"), href: "/contact" },
  ];

  const currentLangMeta = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const phone = settings.company_phone_1 || "+91 8793939393";
  const whatsapp = settings.whatsapp_number || "919890708013";
  const announcement = settings.header_announcement_text || "Umrah Platinum 20 Days Departing 31 Oct — Booking Open";
  const showTopBar = settings.header_topbar_enabled !== "false";
  const logoUrl = settings.header_logo || settings.site_logo || "";
  const companyName = settings.company_short_name || settings.company_name || "AL-GAFUR";

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Top Announcement Bar */}
      {showTopBar && (
        <div className="bg-forest-950 text-white text-xs border-b border-gold-500/20 py-1.5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-gold-600/30 text-gold-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-gold-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                1448 Hijri / 2026
              </span>
              <span className="hidden md:inline text-emerald-100/90 font-medium truncate max-w-xl">
                {announcement}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="hidden sm:flex items-center gap-1 text-gold-300 hover:text-white transition-colors"
              >
                <Phone className="w-3 h-3" />
                {phone}
              </a>
              <a
                href={`https://wa.me/${whatsapp}?text=Assalamualaikum`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                WhatsApp Support
              </a>
              <div className="h-3 w-px bg-white/20 hidden sm:block" />
              <Link
                href="/track-booking"
                className="text-amber-200 hover:text-white transition-colors hidden sm:inline"
              >
                {t("nav_track")}
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1 text-white hover:text-gold-300 transition-colors font-medium ml-1"
              >
                <UserCheck className="w-3 h-3 text-gold-400" />
                Portal Login
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "bg-forest-950/95 backdrop-blur-md shadow-lg border-b border-gold-500/20 py-2.5"
            : "bg-forest-900/90 backdrop-blur-sm border-b border-emerald-800/40 py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Brand Logo with dynamic CMS support */}
          <BrandLogo
            variant="light"
            size="sm"
            showTagline={false}
            customLogoUrl={logoUrl}
            companyName={companyName}
          />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-gold-300 ${
                    isActive
                      ? "text-gold-400 border-b-2 border-gold-400 pb-1"
                      : "text-emerald-100"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 text-xs text-emerald-100 hover:text-white bg-forest-950/80 border border-gold-500/30 px-2.5 py-1.5 rounded-md transition-colors"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-gold-400" />
                <span>{currentLangMeta.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-gold-400/80" />
              </button>

              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-36 bg-forest-950 border border-gold-500/30 rounded-lg shadow-xl py-1 z-50"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                        language === lang.code
                          ? "bg-gold-500/20 text-gold-300 font-bold"
                          : "text-emerald-100 hover:bg-forest-900"
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] text-emerald-400/60 uppercase">
                        {lang.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick WhatsApp Chat */}
            <a
              href={`https://wa.me/${whatsapp}?text=Assalamualaikum,%20I%20want%20information%20about%20Al-Gafur%20Umrah%20packages`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-950 bg-emerald-300 hover:bg-emerald-400 px-3 py-2 rounded-md transition-all shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-950" />
              WhatsApp
            </a>

            {/* Book Now Primary Button */}
            <Link
              href={settings.header_cta_link || "/booking"}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-950 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 px-4 py-2 rounded-md transition-all shadow-gold transform hover:-translate-y-0.5"
            >
              <Compass className="w-3.5 h-3.5 text-forest-950" />
              {settings.header_cta_text || t("btn_book_now")}
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/booking"
              className="text-[11px] font-bold text-forest-950 bg-gold-400 hover:bg-gold-300 px-2.5 py-1.5 rounded"
            >
              Book
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-emerald-100 hover:text-white p-1 rounded-md"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-forest-950/98 border-b border-gold-500/20 px-6 py-5 text-white animate-fadeIn">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium py-1.5 border-b border-white/5 text-emerald-100 hover:text-gold-300 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-gold-300">
              <span>Language:</span>
              <div className="flex gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      language === lang.code
                        ? "bg-gold-500 text-forest-950 font-bold"
                        : "bg-forest-900 text-white"
                    }`}
                  >
                    {lang.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <Link
                href="/track-booking"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs py-2 bg-forest-900 rounded border border-gold-500/30 text-amber-200"
              >
                Track Booking
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs py-2 bg-forest-900 rounded border border-gold-500/30 text-white"
              >
                Portal Login
              </Link>
            </div>

            <a
              href="https://wa.me/919890708013?text=Assalamualaikum"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs font-semibold py-2.5 bg-emerald-600 rounded text-white"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp (+91 9890708013)
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

