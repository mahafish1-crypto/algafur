import React from "react";
import prisma from "@/lib/db";
import AdminReportsClient from "./AdminReportsClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const metadata = {
  title: "Reports & Financial Analytics | AL-GAFUR Admin",
  description: "Revenue performance, load factors, and CRM conversion metrics.",
};

export default async function AdminReportsPage() {
  const { allowed, session } = await verifyModuleAccess("reports");
  if (!allowed) return <AccessDeniedView moduleKey="reports" session={session} />;
  const [
    bookingGroups,
    paymentGroups,
    recentPayments,
    packages,
    totalLeads,
  ] = await Promise.all([
    prisma.booking.groupBy({
      by: ["packageId"],
      _count: { _all: true },
      _sum: {
        totalAmount: true,
        adults: true,
        children: true,
      },
    }),
    prisma.payment.groupBy({
      by: ["paymentMethod"],
      _count: { _all: true },
      _sum: {
        amount: true,
      },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { paymentDate: "desc" },
      select: {
        receiptNumber: true,
        amount: true,
        paymentMethod: true,
        paymentDate: true,
        customer: {
          select: { name: true },
        },
      },
    }),
    prisma.package.findMany({
      select: {
        id: true,
        name: true,
        bookedSeats: true,
        totalSeats: true,
        type: true,
      },
    }),
    prisma.lead.count(),
  ]);

  const totalRevenue = bookingGroups.reduce(
    (acc, g) => acc + (g._sum.totalAmount ?? 0),
    0
  );
  const totalCollected = paymentGroups.reduce(
    (acc, g) => acc + (g._sum.amount ?? 0),
    0
  );
  const outstandingDue = Math.max(0, totalRevenue - totalCollected);
  const totalBookings = bookingGroups.reduce(
    (acc, g) => acc + g._count._all,
    0
  );
  const totalPilgrims = bookingGroups.reduce(
    (acc, g) => acc + (g._sum.adults ?? 0) + (g._sum.children ?? 0),
    0
  );
  const conversionRate =
    totalLeads > 0 ? Math.round((totalBookings / totalLeads) * 100) : 0;

  // Group by packages
  const packageRevMap = new Map<string, number>();
  bookingGroups.forEach((g) => {
    packageRevMap.set(g.packageId, g._sum.totalAmount ?? 0);
  });

  const packagesPerformance = packages.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    bookedSeats: pkg.bookedSeats,
    totalSeats: pkg.totalSeats,
    revenue: packageRevMap.get(pkg.id) ?? 0,
    type: pkg.type,
  }));

  // Payment methods breakdown
  const methodBreakdown = paymentGroups.map((g) => ({
    method: g.paymentMethod,
    count: g._count._all,
    amount: g._sum.amount ?? 0,
  }));

  const recentTransactions = recentPayments.map((p) => ({
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

