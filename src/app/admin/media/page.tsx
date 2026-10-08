import React from "react";
import prisma from "@/lib/db";
import AdminMediaClient from "./AdminMediaClient";

export const metadata = {
  title: "Media Asset Library | AL-GAFUR Admin",
  description: "Centralized digital asset management for marketing, hotels, and brand identity.",
};

export default async function AdminMediaPage() {
  let media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Seed default brand assets if library is empty
  if (media.length === 0) {
    const defaults = [
      {
        name: "Official Al-Gafur Identity Card & Logo",
        category: "LOGO",
        url: "/brand/logo-card.jpg",
        dimensions: "1080x1080",
        fileType: "image/jpeg",
      },
      {
        name: "Umrah Platinum Package 2026 Official Poster",
        category: "MARKETING",
        url: "/brand/poster.jpg",
        dimensions: "1080x1920",
        fileType: "image/jpeg",
      },
      {
        name: "Resident Scholar Portrait — Hafiz Asrar Sahab",
        category: "MARKETING",
        url: "/brand/img2.jpeg",
        dimensions: "800x1200",
        fileType: "image/jpeg",
      },
      {
        name: "Masjid Al-Haram Kaaba Sacred Courtyard",
        category: "MAKKAH",
        url: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
        dimensions: "1920x1080",
        fileType: "image/jpeg",
      },
      {
        name: "Masjid An-Nabawi Green Dome & Umbrellas",
        category: "MADINAH",
        url: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80",
        dimensions: "1920x1080",
        fileType: "image/jpeg",
      },
      {
        name: "Diyafa Jamal Makkah Hotel Quad Room",
        category: "HOTELS",
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        dimensions: "1200x800",
        fileType: "image/jpeg",
      },
    ];

    for (const item of defaults) {
      await prisma.media.create({ data: item });
    }

    media = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  return <AdminMediaClient initialMedia={JSON.parse(JSON.stringify(media))} />;
}

