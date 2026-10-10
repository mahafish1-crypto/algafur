"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  Wallet,
  Calendar,
  Eye,
  MousePointerClick,
  MessageCircle,
  UserCheck,
  MapPin,
  Globe,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface AnalyticsEventRow {
  id: string;
  action: string;
  packageId: string | null;
  packageSlug: string | null;
  packageTitle: string | null;
  category: string | null;
  sessionId: string;
  sourcePage: string;
  language: string;
  createdAt: string;
}

interface LeadRow {
  id: string;
  packageInterest: string;
  source: string;
  city: string;
  status: string;
  createdAt: string;
}

interface BookingRow {
  id: string;
  packageId: string;
  totalAmount: number;
  createdAt: string;
}

interface SignupRow {
  id: string;
  createdAt: string;
}

interface ReportData {
  trackingStartDate: string;
  metrics: {
    totalRevenue: number;
    totalCollected: number;
    outstandingDue: number;
    totalBookings: number;
    totalPilgrims: number;
    totalLeads: number;
    conversionRate: number;
    totalCustomerAccounts: number;
    acceptedAgreementsCount: number;
  };
  packagesPerformance: Array<{
    id: string;
    slug: string;
    name: string;
    bookedSeats: number;
    totalSeats: number;
    revenue: number;
    type: string;
  }>;
  methodBreakdown: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  recentTransactions: Array<{
    receiptNumber: string;
    amount: number;
    method: string;
    customerName: string;
    date: string;
  }>;
  analyticsEvents: AnalyticsEventRow[];
  leadsList: LeadRow[];
  bookingsList: BookingRow[];
  signupsList: SignupRow[];
}

interface Props {
  data: ReportData;
}

type DateRangeKey = "TODAY" | "7_DAYS" | "30_DAYS" | "ALL_TIME";

export default function AdminReportsClient({ data }: Props) {
  const [dateRange, setDateRange] = useState<DateRangeKey>("ALL_TIME");

  const cutoffTimestamp = useMemo(() => {
    const now = new Date();
    if (dateRange === "TODAY") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime();
    }
    if (dateRange === "7_DAYS") {
      return now.getTime() - 7 * 24 * 60 * 60 * 1000;
    }
    if (dateRange === "30_DAYS") {
      return now.getTime() - 30 * 24 * 60 * 60 * 1000;
    }
    return 0;
  }, [dateRange]);

  const filteredEvents = useMemo(
    () =>
      data.analyticsEvents.filter(
        (ev) => new Date(ev.createdAt).getTime() >= cutoffTimestamp
      ),
    [data.analyticsEvents, cutoffTimestamp]
  );

  const filteredLeads = useMemo(
    () =>
      data.leadsList.filter(
        (l) => new Date(l.createdAt).getTime() >= cutoffTimestamp
      ),
    [data.leadsList, cutoffTimestamp]
  );

  const filteredBookings = useMemo(
    () =>
      data.bookingsList.filter(
        (b) => new Date(b.createdAt).getTime() >= cutoffTimestamp
      ),
    [data.bookingsList, cutoffTimestamp]
  );

  const filteredSignups = useMemo(
    () =>
      data.signupsList.filter(
        (s) => new Date(s.createdAt).getTime() >= cutoffTimestamp
      ),
    [data.signupsList, cutoffTimestamp]
  );

  // Funnel summary counts
  const funnelMetrics = useMemo(() => {
    const homeAndCatalogViews = filteredEvents.filter(
      (e) => e.action === "HOME_VIEW" || e.action === "PACKAGE_LIST_VIEW"
    ).length;

    const packageViewEvents = filteredEvents.filter(
      (e) => e.action === "PACKAGE_VIEW"
    );
    const uniquePackageSessions = new Set(
      packageViewEvents.map((e) => `${e.packageId || e.packageSlug}:${e.sessionId}`)
    ).size;

    const ctaClicks = filteredEvents.filter(
      (e) =>
        e.action === "WHATSAPP_CTA_CLICK" ||
        e.action === "CALL_CTA_CLICK" ||
        e.action === "PACKAGE_CARD_CLICK"
    ).length;

    const inquiriesSubmitted = filteredLeads.length;
    const customerSignups = filteredSignups.length;
    const confirmedBookings = filteredBookings.length;

    return {
      homeAndCatalogViews,
      rawPackageViews: packageViewEvents.length,
      uniquePackageSessions,
      ctaClicks,
      inquiriesSubmitted,
      customerSignups,
      confirmedBookings,
    };
  }, [filteredEvents, filteredLeads, filteredSignups, filteredBookings]);

  // Per-package analytics
  const packageAnalyticsRows = useMemo(() => {
    const rows = data.packagesPerformance.map((pkg) => {
      const pkgViews = filteredEvents.filter(
        (e) =>
          e.action === "PACKAGE_VIEW" &&
          (e.packageId === pkg.id || e.packageSlug === pkg.slug)
      );
      const uniqueSessions = new Set(pkgViews.map((e) => e.sessionId)).size;

      const cardClicks = filteredEvents.filter(
        (e) =>
          e.action === "PACKAGE_CARD_CLICK" &&
          (e.packageId === pkg.id || e.packageSlug === pkg.slug)
      ).length;

      const nameLower = pkg.name.toLowerCase();
      const slugLower = pkg.slug.toLowerCase();

      const matchingLeadsCount = filteredLeads.filter((l) => {
        const interest = (l.packageInterest || "").toLowerCase();
        if (!interest) return false;
        return (
          interest.includes(nameLower) ||
          nameLower.includes(interest) ||
          interest.includes(slugLower) ||
          (pkg.type === "RAMADAN_UMRAH" && interest.includes("ramadan")) ||
          (pkg.type === "HAJJ" && interest.includes("hajj"))
        );
      }).length;

      const matchingBookingsCount = filteredBookings.filter(
        (b) => b.packageId === pkg.id
      ).length;

      const viewToInquiryRate =
        pkgViews.length > 0
          ? Math.min(100, Math.round((matchingLeadsCount / pkgViews.length) * 100))
          : 0;

      const inquiryToBookingRate =
        matchingLeadsCount > 0
          ? Math.min(
              100,
              Math.round((matchingBookingsCount / matchingLeadsCount) * 100)
            )
          : 0;

      return {
        ...pkg,
        rawViews: pkgViews.length,
        uniqueSessions,
        cardClicks,
        inquiries: matchingLeadsCount,
        bookingsCount: matchingBookingsCount,
        viewToInquiryRate,
        inquiryToBookingRate,
      };
    });

    return rows.sort((a, b) => b.rawViews - a.rawViews || b.inquiries - a.inquiries);
  }, [data.packagesPerformance, filteredEvents, filteredLeads, filteredBookings]);

  const maxViews = useMemo(
    () => Math.max(0, ...packageAnalyticsRows.map((r) => r.rawViews)),
    [packageAnalyticsRows]
  );
  const minViews = useMemo(
    () => Math.min(...packageAnalyticsRows.map((r) => r.rawViews)),
    [packageAnalyticsRows]
  );

  // Top cities from leads
  const topCities = useMemo(() => {
    const counts = new Map<string, number>();
    filteredLeads.forEach((l) => {
      const city = (l.city || "Unspecified").trim() || "Unspecified";
      counts.set(city, (counts.get(city) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredLeads]);

  // Lead sources breakdown
  const leadSources = useMemo(() => {
    const counts = new Map<string, number>();
    filteredLeads.forEach((l) => {
      const src = (l.source || "WEBSITE").trim() || "WEBSITE";
      counts.set(src, (counts.get(src) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredLeads]);

  // Language preference breakdown from analytics events
  const languageBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    filteredEvents.forEach((ev) => {
      const lang = (ev.language || "en").toUpperCase();
      counts.set(lang, (counts.get(lang) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([lang, count]) => ({ lang, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredEvents]);

  const exportCSV = () => {
    let csv =
      "Package Name,Category,Raw Views,Unique Sessions,Card Clicks,Inquiries,Confirmed Bookings,View-to-Inquiry %,Booked Seats,Total Capacity,Revenue (INR)\n";
    packageAnalyticsRows.forEach((p) => {
      csv += `"${p.name}","${p.type}",${p.rawViews},${p.uniqueSessions},${p.cardClicks},${p.inquiries},${p.bookingsCount},${p.viewToInquiryRate}%,${p.bookedSeats},${p.totalSeats},${p.revenue}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `AlGafur_Analytics_Report_${dateRange}_${new Date().toISOString().substring(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header + Date Range Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
              <Sparkles className="w-3 h-3" />
              Real Database Events Only
            </span>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Tracking Start Date: {data.trackingStartDate}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-700" />
            Executive Financial, Package View &amp; Conversion Analytics
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Package engagement views, inquiry funnel conversion, seat load factors, and realized revenue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {(
              [
                { id: "TODAY", label: "Today" },
                { id: "7_DAYS", label: "Last 7 Days" },
                { id: "30_DAYS", label: "Last 30 Days" },
                { id: "ALL_TIME", label: "All Time" },
              ] as { id: DateRangeKey; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDateRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateRange === tab.id
                    ? "bg-white text-emerald-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Customer Engagement & Conversion Funnel Strip */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Customer Engagement &amp; Conversion Funnel ({dateRange.replace("_", " ")})
            </h2>
            <p className="text-xs text-slate-400">
              Live pilgrim journey from package discovery to inquiry, signup, and confirmed reservation
            </p>
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {data.metrics.acceptedAgreementsCount} Legal Agreements Accepted
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
              <span>Catalog Visits</span>
              <Globe className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-white mt-1.5">
              {funnelMetrics.homeAndCatalogViews}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Home &amp; package list views</p>
          </div>

          <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
              <span>Package Views</span>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400 mt-1.5">
              {funnelMetrics.rawPackageViews}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {funnelMetrics.uniquePackageSessions} unique session(s)
            </p>
          </div>

          <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
              <span>CTA &amp; Card Clicks</span>
              <MousePointerClick className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <p className="text-xl font-bold text-sky-400 mt-1.5">
              {funnelMetrics.ctaClicks}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">WhatsApp, Call &amp; Card clicks</p>
          </div>

          <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
              <span>Inquiries (Leads)</span>
              <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-amber-300 mt-1.5">
              {funnelMetrics.inquiriesSubmitted}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Recorded in Admin CRM</p>
          </div>

          <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
              <span>Pilgrim Signups</span>
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-xl font-bold text-indigo-300 mt-1.5">
              {funnelMetrics.customerSignups}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Total accounts: {data.metrics.totalCustomerAccounts}
            </p>
          </div>

          <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
              <span>Bookings</span>
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400 mt-1.5">
              {funnelMetrics.confirmedBookings}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Confirmed reservations
            </p>
          </div>
        </div>
      </div>

      {/* Package Views, Inquiries & Conversion Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Package View &amp; Conversion Analytics
            </h2>
            <p className="text-xs text-slate-500">
              Compare most viewed vs. least viewed packages, inquiry volume, and booking conversion
            </p>
          </div>
          <span className="text-xs text-slate-500">
            Showing {packageAnalyticsRows.length} packages
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Tour Package</th>
                <th className="py-3 px-3 text-center">Views (Raw / Unique)</th>
                <th className="py-3 px-3 text-center">Card Clicks</th>
                <th className="py-3 px-3 text-center">Inquiries</th>
                <th className="py-3 px-3 text-center">Bookings</th>
                <th className="py-3 px-3 text-center">Conversion (View → Inq → Book)</th>
                <th className="py-3 px-3">Seat Occupancy</th>
                <th className="py-3 px-3 text-right">Contracted Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packageAnalyticsRows.map((pkg) => {
                const occupancyPct = Math.round(
                  (pkg.bookedSeats / Math.max(1, pkg.totalSeats)) * 100
                );
                const isMostViewed = maxViews > 0 && pkg.rawViews === maxViews;
                const isLeastViewed =
                  packageAnalyticsRows.length > 1 &&
                  pkg.rawViews === minViews &&
                  !isMostViewed;

                return (
                  <tr key={pkg.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-slate-900">{pkg.name}</span>
                        {isMostViewed && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Most Viewed
                          </span>
                        )}
                        {isLeastViewed && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Least Viewed
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase block mt-0.5">
                        {pkg.type.replace("_", " ")} • /{pkg.slug}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-slate-900">{pkg.rawViews}</span>
                      <span className="text-slate-400 ml-1">
                        ({pkg.uniqueSessions} uniq)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">
                      {pkg.cardClicks}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        {pkg.inquiries}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                        {pkg.bookingsCount}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-semibold text-slate-800">
                        {pkg.viewToInquiryRate}%
                      </span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="font-semibold text-emerald-800">
                        {pkg.inquiryToBookingRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-emerald-700 h-2 rounded-full"
                            style={{ width: `${Math.min(100, occupancyPct)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-800">
                          {pkg.bookedSeats}/{pkg.totalSeats} ({occupancyPct}%)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ₹{pkg.revenue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Level Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Gross Contracted Value</span>
            <Wallet className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ₹{data.metrics.totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Across {data.metrics.totalBookings} registered bookings
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Realized Collections</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            ₹{data.metrics.totalCollected.toLocaleString("en-IN")}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{
                width: `${
                  data.metrics.totalRevenue > 0
                    ? Math.min(
                        100,
                        (data.metrics.totalCollected / data.metrics.totalRevenue) * 100
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Pending Receivables</span>
            <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold">
              DUE
            </span>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            ₹{data.metrics.outstandingDue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-1">Due before departures</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>CRM Conversion Rate</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-2">
            {data.metrics.conversionRate}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {data.metrics.totalBookings} booked from {data.metrics.totalLeads} total leads
          </p>
        </div>
      </div>

      {/* Traffic Sources, Top Cities & Collections by Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pilgrim Cities */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Pilgrim Cities</h2>
              <p className="text-xs text-slate-500">Geographic origin of customer inquiries</p>
            </div>
            <MapPin className="w-4 h-4 text-emerald-700" />
          </div>

          {topCities.length > 0 ? (
            <div className="space-y-2.5">
              {topCities.map((item) => (
                <div
                  key={item.city}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <span className="font-semibold text-slate-800">{item.city}</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {item.count} lead(s)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No city data recorded in this period.</p>
          )}
        </div>

        {/* Traffic Sources & Language Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Inquiry Sources &amp; Languages
              </h2>
              <p className="text-xs text-slate-500">Channel attribution and active UI languages</p>
            </div>
            <Globe className="w-4 h-4 text-emerald-700" />
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Lead Sources
            </p>
            {leadSources.length > 0 ? (
              leadSources.map((s) => (
                <div
                  key={s.source}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <span className="font-semibold text-slate-800">{s.source}</span>
                  <span className="font-bold text-slate-900">{s.count}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No leads in selected period.</p>
            )}
          </div>

          {languageBreakdown.length > 0 && (
            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tracked Visitor Languages
              </p>
              <div className="flex flex-wrap gap-1.5">
                {languageBreakdown.map((l) => (
                  <span
                    key={l.lang}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {l.lang}: {l.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3 border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Collections by Channel</h2>
            <p className="text-xs text-slate-500">Breakdown of payment modes received</p>
          </div>

          <div className="space-y-3">
            {data.methodBreakdown.map((m) => {
              const totalAmount = data.metrics.totalCollected || 1;
              const pct = Math.round((m.amount / totalAmount) * 100);

              return (
                <div key={m.method} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">
                      {m.method.replace("_", " ")}
                    </span>
                    <span className="font-mono font-bold text-emerald-800">
                      ₹{m.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>{m.count} transactions</span>
                    <span>{pct}% of total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
