import React from "react";
import prisma from "@/lib/db";
import AdminInvoicesClient from "./AdminInvoicesClient";

export const metadata = {
  title: "Tax Invoices & Billing | AL-GAFUR Admin",
  description: "GST-compliant tax invoices, billing management, and receivables.",
};

export default async function AdminInvoicesPage() {
  const [invoices, bookings] = await Promise.all([
    prisma.invoice.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            totalAmount: true,
            paidAmount: true,
            outstandingAmount: true,
            paymentStatus: true,
            adults: true,
            roomType: true,
            package: {
              select: {
                id: true,
                name: true,
                durationDays: true,
                departureDate: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      select: {
        id: true,
        bookingNumber: true,
        totalAmount: true,
        paidAmount: true,
        outstandingAmount: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <AdminInvoicesClient
      initialInvoices={JSON.parse(JSON.stringify(invoices))}
      bookings={JSON.parse(JSON.stringify(bookings))}
    />
  );
}

