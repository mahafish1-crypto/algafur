import React from "react";
import prisma from "@/lib/db";
import AdminQuotationsClient from "./AdminQuotationsClient";

export const metadata = {
  title: "Quotations & Tour Estimator | AL-GAFUR Admin",
  description: "Create and manage branded Hajj & Umrah travel quotations and proposals.",
};

export default async function AdminQuotationsPage() {
  const [quotations, packages, customers] = await Promise.all([
    prisma.quotation.findMany({
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        lead: {
          select: { id: true, name: true, mobile: true, email: true },
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
            inclusions: true,
          },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.package.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        durationDays: true,
        basePrice: true,
        priceQuad: true,
        priceTriple: true,
        priceDouble: true,
        priceSingle: true,
        makkahHotelName: true,
        madinahHotelName: true,
        makkahDistance: true,
        madinahDistance: true,
        departureDate: true,
      },
      where: { status: "PUBLISHED" },
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
      },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  return (
    <AdminQuotationsClient
      initialQuotations={JSON.parse(JSON.stringify(quotations))}
      packages={JSON.parse(JSON.stringify(packages))}
      customers={JSON.parse(JSON.stringify(customers))}
    />
  );
}

