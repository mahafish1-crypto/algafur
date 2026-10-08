import React from "react";
import prisma from "@/lib/db";
import AdminReportsClient from "./AdminReportsClient";

export const metadata = {
  title: "Reports & Financial Analytics | AL-GAFUR Admin",
  description: "Revenue performance, load factors, and CRM conversion metrics.",
};

export default async function AdminReportsPage() {
  const [bookings, payments, packages, leads] = await Promise.all([
    prisma.booking.findMany({
      include: {
        package: true,
        customer: true,
      },
    }),
    prisma.payment.findMany({
      include: {
        customer: true,
      },
      orderBy: { paymentDate: "desc" },
    }),
    prisma.package.findMany(),
    prisma.lead.findMany({
      select: { id: true, status: true },
    }),
  ]);

  const totalRevenue = bookings.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const outstandingDue = Math.max(0, totalRevenue - totalCollected);
  const totalBookings = bookings.length;
  const totalPilgrims = bookings.reduce((acc, b) => acc + b.adults + b.children, 0);
  const totalLeads = leads.length;
  const conversionRate =
    totalLeads > 0 ? Math.round((totalBookings / totalLeads) * 100) : 0;

  // Group by packages
  const packagesPerformance = packages.map((pkg) => {
    const pkgBookings = bookings.filter((b) => b.packageId === pkg.id);
    const rev = pkgBookings.reduce((acc, b) => acc + b.totalAmount, 0);
    return {
      id: pkg.id,
      name: pkg.name,
      bookedSeats: pkg.bookedSeats,
      totalSeats: pkg.totalSeats,
      revenue: rev,
      type: pkg.type,
    };
  });

  // Payment methods breakdown
  const methodMap: Record<string, { count: number; amount: number }> = {};
  payments.forEach((p) => {
    if (!methodMap[p.paymentMethod]) {
      methodMap[p.paymentMethod] = { count: 0, amount: 0 };
    }
    methodMap[p.paymentMethod].count += 1;
    methodMap[p.paymentMethod].amount += p.amount;
  });

  const methodBreakdown = Object.entries(methodMap).map(([method, val]) => ({
    method,
    count: val.count,
    amount: val.amount,
  }));

  const recentTransactions = payments.slice(0, 5).map((p) => ({
    receiptNumber: p.receiptNumber,
    amount: p.amount,
    method: p.paymentMethod,
    customerName: p.customer?.name || "Pilgrim",
    date: p.paymentDate.toISOString(),
  }));

  const data = {
    metrics: {
      totalRevenue,
      totalCollected,
      outstandingDue,
      totalBookings,
      totalPilgrims,
      totalLeads,
      conversionRate,
    },
    packagesPerformance,
    methodBreakdown,
    recentTransactions,
  };

  return <AdminReportsClient data={data} />;
}

