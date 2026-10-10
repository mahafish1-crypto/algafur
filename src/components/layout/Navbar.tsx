"use client";

import React, { useState, useEffect, useRef } from "react";
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
  UserPlus,
  Compass,
  Check,
} from "lucide-react";

interface NavbarProps {
  settings?: Record<string, string>;
}

export default function Navbar({ settings = {} }: NavbarProps) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLangDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navLinks = [
    { name: t("nav_home"), href: "/" },
    { name: t("nav_packages"), href: "/packages" },
    { name: t("nav_umrah"), href: "/umrah" },
    { name: t("nav_hajj"), href: "/hajj" },
    { name: t("nav_ramadan"), href: "/ramadan-umrah" },
    { name: t("nav_hotels"), href: "/hotels" },
    { name: t("nav_ziyarat"), href: "/gallery" },
    { name: t("nav_about"), href: "/about" },
    { name: t("nav_blog"), href: "/blog" },
    { name: t("nav_contact"), href: "/contact" },
  ];

  const currentLangMeta = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const phone = settings.company_phone_1 || "+91 8793939393";
  const whatsappRaw = (settings.whatsapp_number || "919890708013").replace(/[^0-9]/g, "");
  const announcement =
    settings.header_announcement_text ||
    "Umrah Platinum 20 Days Departing 31 Oct — Booking Open";
  const showTopBar = settings.header_topbar_enabled !== "false";
  const logoUrl = settings.header_logo || settings.site_logo || "";
  const companyName = settings.company_short_name || settings.company_name || "AL-GAFUR";

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Top Announcement & Utility Bar */}
      {showTopBar && (
        <div className="bg-forest-950 text-white text-xs border-b border-gold-500/20 py-1.5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center gap-1.5 bg-gold-600/30 text-gold-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-gold-500/30 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                1448 Hijri / 2026
              </span>
              <span className="hidden md:inline text-emerald-100/90 font-medium truncate max-w-lg lg:max-w-xl">
                {announcement}
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-[11px] ms-auto">
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="hidden sm:flex items-center gap-1 text-gold-300 hover:text-white transition-colors font-medium"
              >
                <Phone className="w-3 h-3" />
                <span>{phone}</span>
              </a>
              <a
                href={`https://wa.me/${whatsappRaw}?text=Assalamualaikum`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors font-medium"
              >
                <MessageCircle className="w-3 h-3" />
                <span>{t("whatsapp_us")}</span>
              </a>
              <div className="h-3 w-px bg-white/20 hidden sm:block" />
              <Link
                href="/track-booking"
                className="text-amber-200 hover:text-white transition-colors hidden sm:inline font-medium"
              >
                {t("nav_track")}
              </Link>
              <Link
                href="/signup"
                className="hidden md:flex items-center gap-1 text-emerald-200 hover:text-gold-300 transition-colors font-medium"
              >
                <UserPlus className="w-3 h-3 text-gold-400" />
                <span>{t("nav_signup")}</span>
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1 text-white hover:text-gold-300 transition-colors font-semibold"
              >
                <UserCheck className="w-3 h-3 text-gold-400" />
                <span>{t("nav_login")}</span>
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
            : "bg-forest-900/95 backdrop-blur-sm border-b border-emerald-800/40 py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-3">
          {/* Brand Logo with dynamic CMS support */}
          <BrandLogo
            variant="light"
            size="sm"
            showTagline={false}
            customLogoUrl={logoUrl}
            companyName={companyName}
          />

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-4" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold transition-colors px-2 py-1.5 rounded-lg ${
                    isActive
                      ? "text-gold-300 bg-forest-950/70 border border-gold-500/30"
                      : "text-emerald-100 hover:text-gold-300 hover:bg-forest-950/40"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls (Desktop & Tablet) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Dropdown (Visible on both mobile & desktop) */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen((prev) => !prev)}
                aria-expanded={langDropdownOpen}
                aria-haspopup="listbox"
                aria-label={t("language_label")}
                className="flex items-center gap-1.5 text-xs text-emerald-100 hover:text-white bg-forest-950/90 border border-gold-500/35 px-2.5 py-2 rounded-lg transition-colors min-h-[38px]"
              >
                <Globe className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                <span className="font-medium">{currentLangMeta.nativeName}</span>
                <ChevronDown
                  className={`w-3 h-3 text-gold-400/80 transition-transform ${
                    langDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {langDropdownOpen && (
                <div
                  role="listbox"
                  aria-label={t("language_label")}
                  className="absolute end-0 mt-2 w-44 bg-forest-950 border border-gold-500/35 rounded-xl shadow-2xl py-1.5 z-50"
                >
                  {LANGUAGES.map((lang) => {
                    const selected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-start px-3.5 py-2 text-xs transition-colors flex items-center justify-between ${
                          selected
                            ? "bg-gold-500/20 text-gold-300 font-bold"
                            : "text-emerald-100 hover:bg-forest-900"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{lang.nativeName}</span>
                          <span className="text-[10px] text-emerald-300/70">{lang.label}</span>
                        </div>
                        {selected && <Check className="w-3.5 h-3.5 text-gold-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick WhatsApp Chat (Desktop) */}
            <a
              href={`https://wa.me/${whatsappRaw}?text=Assalamualaikum,%20I%20would%20like%20information%20about%20Al-Gafur%20Hajj%20and%20Umrah%20packages`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 px-3.5 py-2 rounded-lg transition-all shadow-sm min-h-[38px]"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-950" />
              <span>WhatsApp</span>
            </a>

            {/* Primary CTA Button */}
            <Link
              href={settings.header_cta_link || "/booking"}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-forest-950 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 px-4 py-2 rounded-lg transition-all shadow-gold min-h-[38px]"
            >
              <Compass className="w-3.5 h-3.5 text-forest-950" />
              <span>{t("btn_book_now")}</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="xl:hidden text-emerald-100 hover:text-white p-2 rounded-lg bg-forest-950/60 border border-gold-500/25 min-h-[38px] min-w-[38px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-forest-950 border-b border-gold-500/30 px-4 sm:px-6 py-5 text-white animate-fadeIn max-h-[85vh] overflow-y-auto shadow-2xl">
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1.5" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between ${
                    isActive
                      ? "bg-gold-500/20 text-gold-300 font-bold border border-gold-500/30"
                      : "text-emerald-100 hover:bg-forest-900 hover:text-gold-300"
                  }`}
                >
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher Pills in Mobile Drawer */}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gold-300 block">
                {t("language_label")}:
              </span>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      language === lang.code
                        ? "bg-gold-500 text-forest-950 font-bold shadow-sm"
                        : "bg-forest-900 text-emerald-100 border border-white/10 hover:border-gold-500/40"
                    }`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Quick Portal Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs font-bold py-2.5 px-3 bg-gold-400 text-forest-950 rounded-xl shadow-sm"
              >
                {t("btn_book_now")}
              </Link>
              <Link
                href="/track-booking"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs font-semibold py-2.5 px-3 bg-forest-900 rounded-xl border border-gold-500/30 text-amber-200"
              >
                {t("nav_track")}
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs font-semibold py-2.5 px-3 bg-forest-900 rounded-xl border border-gold-500/30 text-emerald-200"
              >
                {t("nav_signup")}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 text-xs font-semibold py-2.5 bg-forest-900 rounded-xl border border-white/15 text-white"
              >
                <UserCheck className="w-4 h-4 text-gold-400" />
                <span>{t("nav_login")}</span>
              </Link>
              <a
                href={`https://wa.me/${whatsappRaw}?text=Assalamualaikum`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs font-bold py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {t("whatsapp_us")} ({phone})
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
