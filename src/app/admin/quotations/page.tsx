import React from "react";
import prisma from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import AdminQuotationsClient from "./AdminQuotationsClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const metadata = {
  title: "Quotations & Tour Estimator | AL GAFUR Admin",
  description: "Create and manage branded Hajj & Umrah travel quotations and proposals.",
};

export const dynamic = "force-dynamic";

export default async function AdminQuotationsPage() {
  const { allowed, session } = await verifyModuleAccess("quotations");
  if (!allowed) return <AccessDeniedView moduleKey="quotations" session={session} />;

  const [quotations, siteSettings] = await Promise.all([
    prisma.quotation.findMany({
      include: {
        customer: {
          select: { id: true, name: true, phone: true, whatsapp: true, email: true, city: true },
        },
        lead: {
          select: { id: true, name: true, mobile: true, email: true, city: true },
        },
        package: {
          select: {
            id: true,
            name: true,
            type: true,
            durationDays: true,
            makkahHotelName: true,
            madinahHotelName: true,
            makkahDistance: true,
            madinahDistance: true,
            departureDate: true,
          },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getSiteSettings(),
  ]);

  return (
    <AdminQuotationsClient
      initialQuotations={JSON.parse(JSON.stringify(quotations))}
      siteSettings={siteSettings}
    />
  );
}
