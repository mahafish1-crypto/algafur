import React from "react";
import prisma from "@/lib/db";
import AdminHotelsClient from "./AdminHotelsClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const metadata = {
  title: "Hotels & Haram Proximity | AL-GAFUR Admin",
  description:
    "Contracted hotel properties, walking distances to Haram, photos, and amenities.",
};

export default async function AdminHotelsPage() {
  const { allowed, session } = await verifyModuleAccess("hotels");
  if (!allowed)
    return <AccessDeniedView moduleKey="hotels" session={session} />;

  const [hotels, packages] = await Promise.all([
    prisma.hotel.findMany({
      include: {
        makkahPackages: { select: { id: true, name: true, slug: true } },
        madinahPackages: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ city: "asc" }, { starRating: "desc" }],
    }),
    prisma.package.findMany({
      select: { id: true, name: true, slug: true, type: true, status: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <AdminHotelsClient
      initialHotels={JSON.parse(JSON.stringify(hotels))}
      allPackages={JSON.parse(JSON.stringify(packages))}
    />
  );
}
