import React from "react";
import prisma from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasUserPermission, getAuthorizedModules } from "@/lib/rbac";
import {
  Users,
  Compass,
  CreditCard,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Plus,
  ArrowRight,
  Phone,
  Sparkles,
  UserCog,
} from "lucide-react";

export const revalidate = 0; // Dynamic server dashboard

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const canViewLeads = hasUserPermission(session, "leads:view");
  const canCreateLeads = hasUserPermission(session, "leads:create");
  const canViewCustomers = hasUserPermission(session, "customers:view");
  const canViewBookings = hasUserPermission(session, "bookings:view");
  const canViewPayments = hasUserPermission(session, "payments:view");
  const canViewGroups = hasUserPermission(session, "departure_groups:view");
  const canViewDocs = hasUserPermission(session, "documents:view");
  const canViewVisas = hasUserPermission(session, "visas:view");
  const canViewFollowups = hasUserPermission(session, "followups:view");
  const canCreateQuotations = hasUserPermission(session, "quotations:create");
  const canViewAiStudio = hasUserPermission(session, "ai_studio:view");
  const canManageUsers =
    session.role === "SUPER_ADMIN" || hasUserPermission(session, "users:view");

  const authorizedModules = getAuthorizedModules(session);

  // Conditionally query only data for modules the user is authorized to view
  const [
    totalLeads,
    newLeads,
    bookingStats,
    totalCustomers,
    nextDeparture,
    recentLeads,
    followUps,
    pendingDocsCount,
    processingVisasCount,
  ] = await Promise.all([
    canViewLeads ? prisma.lead.count() : Promise.resolve(0),
    canViewLeads
      ? prisma.lead.count({ where: { status: "NEW" } })
      : Promise.resolve(0),
    canViewBookings || canViewPayments
      ? prisma.booking.aggregate({
          _count: { _all: true },
          _sum: {
            paidAmount: true,
            outstandingAmount: true,
          },
        })
      : Promise.resolve({
          _count: { _all: 0 },
          _sum: { paidAmount: 0, outstandingAmount: 0 },
        }),
    canViewCustomers || canViewBookings
      ? prisma.customer.count()
      : Promise.resolve(0),
    canViewGroups
      ? prisma.departureGroup.findFirst({
          where: { status: "OPEN" },
          select: {
            id: true,
            groupName: true,
            departureDate: true,
            totalCapacity: true,
            confirmedTravellers: true,
          },
          orderBy: { departureDate: "asc" },
        })
      : Promise.resolve(null),
    canViewLeads
      ? prisma.lead.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            leadNumber: true,
            mobile: true,
            city: true,
            packageInterest: true,
            status: true,
          },
        })
      : Promise.resolve([]),
    canViewFollowups
      ? prisma.followUp.findMany({
          where: { status: "PENDING" },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            priority: true,
            notes: true,
            lead: { select: { name: true, mobile: true } },
            user: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
    canViewDocs
      ? prisma.document.count({ where: { status: "UPLOADED" } })
      : Promise.resolve(0),
    canViewVisas
      ? prisma.visaApplication.count({ where: { status: "PROCESSING" } })
      : Promise.resolve(0),
  ]);

  const totalBookings = canViewBookings ? bookingStats._count._all : 0;
  const totalRevenue = canViewPayments ? bookingStats._sum.paidAmount ?? 0 : 0;
  const totalOutstanding = canViewPayments
    ? bookingStats._sum.outstandingAmount ?? 0
    : 0;

  const displayRole =
    session.role === "SUPER_ADMIN"
      ? "Super Admin"
      : session.roleName || session.role.replace(/_/g, " ");

  return (
    <div className="space-y-8">
      {/* Top Header & Permission-Filtered Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-gold-400 uppercase font-bold tracking-wider">
            Al-Gafur Operating System • {displayRole}
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
            Welcome, {session.name}
          </h1>
        </div>

        {/* Quick Actions (only rendered if user has permission) */}
        <div className="flex flex-wrap items-center gap-2">
          {canCreateLeads && (
            <Link
              href="/admin/crm/leads"
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Lead
            </Link>
          )}
          {canCreateQuotations && (
            <Link
              href="/admin/quotations"
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-gold-300 border border-gold-500/30 font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Create Quotation
            </Link>
          )}
          {canViewAiStudio && (
            <Link
              href="/admin/ai-studio/image-generator"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-gold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Poster Studio
            </Link>
          )}
          {canManageUsers && (
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors"
            >
              <UserCog className="w-3.5 h-3.5 text-gold-400" /> Manage Users &amp; Roles
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards — Strictly Filtered by Module Permissions */}
      {(canViewLeads || canViewBookings || canViewPayments || canViewDocs || canViewVisas) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {canViewLeads && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>CRM Pipeline Leads</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-serif font-bold text-white">
                  {totalLeads}
                </span>
                <span className="text-[11px] text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                  {newLeads} Fresh Leads
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Website forms, WhatsApp &amp; Meta campaigns
              </p>
            </div>
          )}

          {canViewBookings && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Confirmed Bookings</span>
                <Compass className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-serif font-bold text-white">
                  {totalBookings}
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {totalCustomers} Pilgrims
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Verified pilgrim seat allocations
              </p>
            </div>
          )}

          {canViewPayments && (
            <>
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
                <p className="text-[11px] text-slate-400">
                  Advance tokens &amp; full settlements
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Outstanding Balance</span>
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-serif font-bold text-amber-400">
                    ₹{totalOutstanding.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    Due pre-departure
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Subject to group departure timeline
                </p>
              </div>
            </>
          )}

          {!canViewPayments && canViewDocs && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Documents Pending KYC</span>
                <FileCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-serif font-bold text-white">
                  {pendingDocsCount}
                </span>
                <Link
                  href="/admin/documents"
                  className="text-[11px] text-gold-400 hover:underline font-semibold"
                >
                  Review Now →
                </Link>
              </div>
              <p className="text-[11px] text-slate-400">
                Passport &amp; identity verification queue
              </p>
            </div>
          )}

          {!canViewPayments && canViewVisas && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Visas In Processing</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-serif font-bold text-white">
                  {processingVisasCount}
                </span>
                <Link
                  href="/admin/visa"
                  className="text-[11px] text-gold-400 hover:underline font-semibold"
                >
                  Open Visa Desk →
                </Link>
              </div>
              <p className="text-[11px] text-slate-400">
                Active Umrah &amp; Hajj visa submissions
              </p>
            </div>
          )}
        </div>
      )}

      {/* Next Departure Spotlight & Compliance Counters */}
      {(canViewGroups || canViewDocs || canViewVisas) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {canViewGroups && (
            <div
              className={`${
                canViewDocs || canViewVisas ? "lg:col-span-8" : "lg:col-span-12"
              } bg-gradient-to-r from-slate-950 to-emerald-950/80 p-6 sm:p-7 rounded-3xl border border-gold-500/30 relative overflow-hidden space-y-4`}
            >
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
                  {nextDeparture?.groupName ||
                    "Umrah Platinum Group — 31 October 2026"}
                </h2>
                <p className="text-xs text-emerald-200/80 mt-1">
                  Departing direct from Mumbai (BOM) to Madinah (MED) via Flight SV-771.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Departure Date
                  </span>
                  <span className="font-bold text-white">
                    {nextDeparture?.departureDate || "31 Oct 2026"}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Group Capacity
                  </span>
                  <span className="font-bold text-white">
                    {nextDeparture?.totalCapacity ?? 45} Pilgrims
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Confirmed Seats
                  </span>
                  <span className="font-bold text-emerald-400">
                    {nextDeparture?.confirmedTravellers ?? 28} Booked
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">
                    Open Seats
                  </span>
                  <span className="font-bold text-gold-400">
                    {(nextDeparture?.totalCapacity ?? 45) -
                      (nextDeparture?.confirmedTravellers ?? 28)}{" "}
                    Available
                  </span>
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
          )}

          {(canViewDocs || canViewVisas) && (
            <div
              className={`${
                canViewGroups ? "lg:col-span-4" : "lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4"
              } space-y-4`}
            >
              {canViewDocs && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-950/60 text-amber-400 rounded-xl border border-amber-800/60">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Document Verification
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {pendingDocsCount} Under Review
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/admin/documents"
                    className="text-xs font-bold text-gold-400 hover:underline"
                  >
                    Verify →
                  </Link>
                </div>
              )}

              {canViewVisas && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-950/60 text-emerald-400 rounded-xl border border-emerald-800/60">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        e-Visa Processing
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {processingVisasCount} In Progress
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/admin/visa"
                    className="text-xs font-bold text-gold-400 hover:underline"
                  >
                    Track →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Leads Table & Follow-up Actions Grid (Only shown if authorized) */}
      {(canViewLeads || canViewFollowups) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {canViewLeads && (
            <div
              className={`${
                canViewFollowups ? "lg:col-span-7" : "lg:col-span-12"
              } bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-base font-serif font-bold text-white">
                  Recent Enquiries &amp; Leads
                </h3>
                <Link
                  href="/admin/crm/leads"
                  className="text-xs text-gold-400 hover:underline font-semibold"
                >
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
                          <span className="text-[10px] text-slate-400 font-mono">
                            {l.leadNumber}
                          </span>
                        </td>
                        <td className="py-3 text-slate-300">
                          <div>{l.mobile}</div>
                          <span className="text-[10px] text-slate-400">
                            {l.city}
                          </span>
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
          )}

          {canViewFollowups && (
            <div
              className={`${
                canViewLeads ? "lg:col-span-5" : "lg:col-span-12"
              } bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-base font-serif font-bold text-white">
                  Today&apos;s Follow-ups
                </h3>
                <Link
                  href="/admin/crm/followups"
                  className="text-xs text-gold-400 hover:underline font-semibold"
                >
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
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {f.notes}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Assigned: {f.user?.name}</span>
                      <a
                        href={`https://wa.me/${f.lead?.mobile?.replace(
                          /[^0-9]/g,
                          ""
                        )}`}
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
          )}
        </div>
      )}

      {/* Authorized Modules Quick Directory */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-white">
              Your Authorized Modules ({authorizedModules.length})
            </h3>
            <p className="text-xs text-slate-400">
              Modules assigned to your account by Super Admin
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {authorizedModules.map((mod) => (
            <Link
              key={mod.key}
              href={mod.href}
              className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-gold-500/40 transition-all group flex flex-col justify-between gap-2"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-gold-300 flex items-center justify-between">
                  <span>{mod.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-gold-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {mod.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
