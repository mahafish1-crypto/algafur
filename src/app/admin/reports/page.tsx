import React from "react";
import prisma from "@/lib/db";
import AdminReportsClient from "./AdminReportsClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";
import { TRACKING_START_DATE } from "@/lib/analytics-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reports, Package Analytics & CRM Funnel | AL-GAFUR Admin",
  description: "Revenue performance, package view analytics, load factors, and CRM conversion metrics.",
};

export default async function AdminReportsPage() {
  const { allowed, session } = await verifyModuleAccess("reports");
  if (!allowed) return <AccessDeniedView moduleKey="reports" session={session} />;

  const [
    bookingGroups,
    paymentGroups,
    recentPayments,
    packages,
    allLeads,
    allBookings,
    analyticsLogs,
    customerUsers,
    agreementLogsCount,
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
        slug: true,
        name: true,
        bookedSeats: true,
        totalSeats: true,
        type: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.lead.findMany({
      select: {
        id: true,
        packageInterest: true,
        source: true,
        city: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      select: {
        id: true,
        packageId: true,
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      where: { entity: "AnalyticsEvent" },
      select: {
        id: true,
        action: true,
        entityId: true,
        details: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.count({
      where: { entity: "UserAgreement" },
    }),
  ]);

  const totalLeads = allLeads.length;
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
    slug: pkg.slug,
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

  const serializedAnalyticsEvents = analyticsLogs.map((log) => {
    let parsed: Record<string, any> = {};
    if (log.details) {
      try {
        parsed = JSON.parse(log.details);
      } catch {
        parsed = {};
      }
    }
    return {
      id: log.id,
      action: log.action,
      packageId: parsed.packageId || log.entityId || null,
      packageSlug: parsed.packageSlug || null,
      packageTitle: parsed.packageTitle || null,
      category: parsed.category || null,
      sessionId: parsed.sessionId || "anon",
      sourcePage: parsed.sourcePage || "/",
      language: parsed.language || "en",
      createdAt: log.createdAt.toISOString(),
    };
  });

  const serializedLeads = allLeads.map((l) => ({
    id: l.id,
    packageInterest: l.packageInterest || "",
    source: l.source || "WEBSITE",
    city: l.city || "Unspecified",
    status: l.status,
    createdAt: l.createdAt.toISOString(),
  }));

  const serializedBookings = allBookings.map((b) => ({
    id: b.id,
    packageId: b.packageId,
    totalAmount: b.totalAmount,
    createdAt: b.createdAt.toISOString(),
  }));

  const serializedSignups = customerUsers.map((u) => ({
    id: u.id,
    createdAt: u.createdAt.toISOString(),
  }));

  const data = {
    trackingStartDate: TRACKING_START_DATE,
    metrics: {
      totalRevenue,
      totalCollected,
      outstandingDue,
      totalBookings,
      totalPilgrims,
      totalLeads,
      conversionRate,
      totalCustomerAccounts: customerUsers.length,
      acceptedAgreementsCount: agreementLogsCount,
    },
    packagesPerformance,
    methodBreakdown,
    recentTransactions,
    analyticsEvents: serializedAnalyticsEvents,
    leadsList: serializedLeads,
    bookingsList: serializedBookings,
    signupsList: serializedSignups,
  };

  return <AdminReportsClient data={data} />;
}

