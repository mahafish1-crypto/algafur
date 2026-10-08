import React from "react";
import prisma from "@/lib/db";
import AdminPaymentsClient from "./AdminPaymentsClient";

export const metadata = {
  title: "Payments & Financial Ledger | AL-GAFUR Admin",
  description: "Real-time payment records, advance collections, and official receipts.",
};

export default async function AdminPaymentsPage() {
  const [payments, bookings] = await Promise.all([
    prisma.payment.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            totalAmount: true,
            paidAmount: true,
            outstandingAmount: true,
            package: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { paymentDate: "desc" },
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
    <AdminPaymentsClient
      initialPayments={JSON.parse(JSON.stringify(payments))}
      bookings={JSON.parse(JSON.stringify(bookings))}
    />
  );
}

