import React from "react";
import prisma from "@/lib/db";
import Link from "next/link";
import {
  Users,
  Compass,
  CreditCard,
  Calendar,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Phone,
  Sparkles,
} from "lucide-react";

export const revalidate = 0; // Dynamic server dashboard

export default async function AdminDashboardPage() {
  // Aggregate real database stats
  const totalLeads = await prisma.lead.count();
  const newLeads = await prisma.lead.count({ where: { status: "NEW" } });
  const totalBookings = await prisma.booking.count();
  const totalCustomers = await prisma.customer.count();

  // Financial aggregates
  const bookings = await prisma.booking.findMany({
    select: { totalAmount: true, paidAmount: true, outstandingAmount: true },
  });

  const totalRevenue = bookings.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalOutstanding = bookings.reduce((acc, b) => acc + b.outstandingAmount, 0);

  // Next departure group
  const nextDeparture = await prisma.departureGroup.findFirst({
    where: { status: "OPEN" },
    include: { package: true },
    orderBy: { departureDate: "asc" },
  });

  // Recent leads
  const recentLeads = await prisma.lead.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { name: true } } },
  });

  // Pending follow ups
  const followUps = await prisma.followUp.findMany({
    where: { status: "PENDING" },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { lead: true, user: { select: { name: true } } },
  });

  // Documents pending verification
  const pendingDocsCount = await prisma.document.count({
    where: { status: "UPLOADED" },
  });

  // Visas in processing
  const processingVisasCount = await prisma.visaApplication.count({
    where: { status: "PROCESSING" },
  });

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Action Buttons (Part 65) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-gold-400 uppercase font-bold tracking-wider">
            Al-Gafur Operating System
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
            Executive Command Center
          </h1>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/crm/leads"
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Lead
          </Link>
          <Link
            href="/admin/quotations"
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-gold-300 border border-gold-500/30 font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create Quotation
          </Link>
          <Link
            href="/admin/ai-studio/image-generator"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-gold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Poster Studio
          </Link>
        </div>
      </div>

      {/* KPI Cards (Part 37) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>CRM Pipeline Leads</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-bold text-white">{totalLeads}</span>
            <span className="text-[11px] text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              {newLeads} Fresh Leads
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Website forms, WhatsApp &amp; Meta campaigns</p>
        </div>

        {/* Confirmed Bookings */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Confirmed Bookings</span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-bold text-white">{totalBookings}</span>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              {totalCustomers} Pilgrims
            </span>
          </div>
          <p className="text-[11px] text-slate-400">100% Verified seat allocations</p>
        </div>

        {/* Revenue Collected */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Collected Revenue</span>
            <CreditCard className="w-4 h-4 text-gold-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-bold text-gold-400">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-slate-400">INR</span>
          </div>
          <p className="text-[11px] text-slate-400">Advance tokens &amp; full settlements</p>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Outstanding Balance</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-bold text-amber-400">
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-amber-400 font-semibold">Due pre-departure</span>
          </div>
          <p className="text-[11px] text-slate-400">Subject to group departure timeline</p>
        </div>
      </div>

      {/* Next Departure Spotlight & Compliance Counters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Departure Widget (8 Cols) */}
        <div className="lg:col-span-8 bg-gradient-to-r from-slate-950 to-emerald-950/80 p-6 sm:p-7 rounded-3xl border border-gold-500/30 relative overflow-hidden space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-gold-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Next Scheduled Group Departure
            </span>
            <span className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-full">
              Departure Group ID: {nextDeparture?.id || "dep-group-oct-2026"}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold text-white">
              {nextDeparture?.groupName || "Umrah Platinum Group — 31 October 2026"}
            </h2>
            <p className="text-xs text-emerald-200/80 mt-1">
              Departing direct from Mumbai (BOM) to Madinah (MED) via Flight SV-771.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Departure Date</span>
              <span className="font-bold text-white">31 Oct 2026</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Group Capacity</span>
              <span className="font-bold text-white">45 Pilgrims</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Confirmed Seats</span>
              <span className="font-bold text-emerald-400">28 Booked</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Open Seats</span>
              <span className="font-bold text-gold-400">17 Available</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/admin/bookings/groups"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300"
            >
              <span>Manage Group Manifest &amp; Room Allocations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Operational Compliance Cards (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-950/60 text-amber-400 rounded-xl border border-amber-800/60">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Document Verification</h4>
                <p className="text-[11px] text-slate-400">{pendingDocsCount} Under Review</p>
              </div>
            </div>
            <Link
              href="/admin/documents"
              className="text-xs font-bold text-gold-400 hover:underline"
            >
              Verify →
            </Link>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-950/60 text-emerald-400 rounded-xl border border-emerald-800/60">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">e-Visa Processing Desk</h4>
                <p className="text-[11px] text-slate-400">{processingVisasCount} In Progress</p>
              </div>
            </div>
            <Link
              href="/admin/visa"
              className="text-xs font-bold text-gold-400 hover:underline"
            >
              Track →
            </Link>
          </div>
        </div>
      </div>

      {/* Leads Table & Follow-up Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent CRM Leads (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-serif font-bold text-white">Recent Enquiries &amp; Leads</h3>
            <Link href="/admin/crm/leads" className="text-xs text-gold-400 hover:underline font-semibold">
              View All Pipeline →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5">Lead</th>
                  <th className="py-2.5">Contact</th>
                  <th className="py-2.5">Package</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-900/60">
                    <td className="py-3 font-semibold text-white">
                      <div>{l.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{l.leadNumber}</span>
                    </td>
                    <td className="py-3 text-slate-300">
                      <div>{l.mobile}</div>
                      <span className="text-[10px] text-slate-400">{l.city}</span>
                    </td>
                    <td className="py-3 text-slate-300 max-w-[140px] truncate">
                      {l.packageInterest || "Umrah"}
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/crm/leads/${l.id}`}
                        className="text-xs text-gold-400 hover:underline font-semibold"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scheduled Follow-ups & Reminders (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-serif font-bold text-white">Today&apos;s Follow-ups</h3>
            <Link href="/admin/crm/followups" className="text-xs text-gold-400 hover:underline font-semibold">
              Calendar →
            </Link>
          </div>

          <div className="space-y-3">
            {followUps.map((f) => (
              <div
                key={f.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gold-400" />
                    {f.lead?.name || "Client Follow-up"}
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    {f.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{f.notes}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Assigned: {f.user?.name}</span>
                  <a
                    href={`https://wa.me/${f.lead?.mobile?.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    Send WhatsApp ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

