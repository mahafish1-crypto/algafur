import React from "react";
import prisma from "@/lib/db";
import AdminHotelsClient from "./AdminHotelsClient";

export const metadata = {
  title: "Hotels & Haram Proximity | AL-GAFUR Admin",
  description: "Contracted hotel properties, walking distances to Haram, and amenities.",
};

export default async function AdminHotelsPage() {
  const hotels = await prisma.hotel.findMany({
    orderBy: { starRating: "desc" },
  });

  return <AdminHotelsClient initialHotels={JSON.parse(JSON.stringify(hotels))} />;
}

