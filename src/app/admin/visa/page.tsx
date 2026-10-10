import React from "react";
import prisma from "@/lib/db";
import AdminVisaClient from "./AdminVisaClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const metadata = {
  title: "Visa Applications & MOFA Pipeline | AL-GAFUR Admin",
  description: "Saudi Umrah & Hajj visa tracking, MOFA processing, and passport status.",
};

export default async function AdminVisaPage() {
  const { allowed, session } = await verifyModuleAccess("visas");
  if (!allowed) return <AccessDeniedView moduleKey="visas" session={session} />;
  const [applications, customers, bookings] = await Promise.all([
    prisma.visaApplication.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            whatsapp: true,
            passportNumber: true,
            passportExpiry: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            journeyType: true,
            package: {
              select: {
                id: true,
                name: true,
                departureDate: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        passportNumber: true,
      },
      orderBy: { name: "asc" },
      take: 100,
    }),
    prisma.booking.findMany({
      select: {
        id: true,
        bookingNumber: true,
        customerId: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <AdminVisaClient
      initialApplications={JSON.parse(JSON.stringify(applications))}
      customers={JSON.parse(JSON.stringify(customers))}
      bookings={JSON.parse(JSON.stringify(bookings))}
    />
  );
}

