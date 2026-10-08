"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send } from "lucide-react";
import { buildWhatsAppLink, getFloatingWhatsAppMessage } from "@/lib/whatsapp";

interface FloatingWhatsAppProps {
  packageName?: string;
  settings?: Record<string, string>;
}

export default function FloatingWhatsApp({ packageName, settings = {} }: FloatingWhatsAppProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");

  const pageType = pathname.includes("/packages/")
    ? "package"
    : pathname.includes("/booking")
    ? "booking"
    : pathname.includes("/contact")
    ? "contact"
    : "home";

  const defaultMessage = getFloatingWhatsAppMessage(pageType, packageName);
  const activeMessage = customMsg.trim() || defaultMessage;
  const whatsappNumber = settings.whatsapp_number || "919890708013";
  const whatsappUrl = buildWhatsAppLink(whatsappNumber, activeMessage);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Quick Chat Popup */}
      {open && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden animate-scaleUp">
          {/* Header */}
          <div className="bg-forest-900 text-white p-4 flex items-center justify-between border-b border-gold-500/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-gold-300">
                  AG
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-forest-900 rounded-full" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Al-Gafur Travel Desk</h4>
                <p className="text-[11px] text-emerald-300">Typically replies within 5 mins</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white p-1 rounded"
              aria-label="Close WhatsApp chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-ivory-100/60 space-y-3 text-xs">
            <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-emerald-50 text-neutral-800">
              <p className="font-semibold text-emerald-950 mb-1">Assalamualaikum! 🕋</p>
              <p className="text-neutral-600 leading-relaxed">
                Welcome to Al-Gafur International Tours. How can we assist you with your sacred journey today?
              </p>
            </div>

            <div className="relative">
              <textarea
                value={customMsg || defaultMessage}
                onChange={(e) => setCustomMsg(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white text-neutral-800"
                placeholder="Type your question..."
              />
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Start Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(!open)}
        className="group relative flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-emerald-400/40"
        aria-label="Open WhatsApp conversation"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline">
          {open ? "Close Chat" : "Talk on WhatsApp"}
        </span>
      </button>
    </div>
  );
}
