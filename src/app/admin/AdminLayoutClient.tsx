"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandLogo from "@/components/brand/BrandLogo";
import { hasPermission, Permission } from "@/lib/rbac";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Compass,
  Building,
  Plane,
  FileCheck,
  CreditCard,
  FileText,
  Sparkles,
  Image as ImageIcon,
  BarChart3,
  Settings,
  ShieldCheck,
  History,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Calendar,
  CheckCircle2,
} from "lucide-react";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: any;
  initialNotifications: any[];
  siteLogo?: string;
}

export default function AdminLayoutClient({
  children,
  session,
  initialNotifications,
  siteLogo,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  interface NavItem {
    name: string;
    href: string;
    icon: any;
    permission?: Permission;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const rawNavGroups: NavGroup[] = [
    {
      title: "Core Operations",
      items: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "view:dashboard" },
        { name: "Leads Pipeline", href: "/admin/crm/leads", icon: Users, permission: "view:leads" },
        { name: "Customers Base", href: "/admin/customers", icon: UserCheck, permission: "view:customers" },
        { name: "Follow-ups & Tasks", href: "/admin/crm/followups", icon: Calendar, permission: "view:leads" },
      ],
    },
    {
      title: "Bookings & Travel",
      items: [
        { name: "All Bookings", href: "/admin/bookings", icon: Compass, permission: "view:bookings" },
        { name: "Departure Groups", href: "/admin/bookings/groups", icon: Users, permission: "manage:departure_groups" },
        { name: "Packages Catalog", href: "/admin/packages", icon: FileText, permission: "view:packages" },
        { name: "Hotels Inventory", href: "/admin/travel/hotels", icon: Building, permission: "manage:hotels" },
        { name: "Flights & PNRs", href: "/admin/travel/flights", icon: Plane, permission: "manage:flights" },
      ],
    },
    {
      title: "Compliance & Visas",
      items: [
        { name: "Document Verification", href: "/admin/documents", icon: FileCheck, permission: "manage:documents" },
        { name: "Visa Processing Desk", href: "/admin/visa", icon: ShieldCheck, permission: "manage:visas" },
      ],
    },
    {
      title: "Accounts & Revenue",
      items: [
        { name: "Payments & Receipts", href: "/admin/payments", icon: CreditCard, permission: "view:payments" },
        { name: "Quotation Generator", href: "/admin/quotations", icon: FileText, permission: "view:quotations" },
        { name: "Invoices & Billing", href: "/admin/invoices", icon: FileText, permission: "view:invoices" },
        { name: "Reports & Analytics", href: "/admin/reports", icon: BarChart3, permission: "view:reports" },
      ],
    },
    {
      title: "AI Growth Studio",
      items: [
        { name: "AI Poster Generator", href: "/admin/ai-studio/image-generator", icon: Sparkles, permission: "manage:ai_studio" },
        { name: "AI Content & Ads", href: "/admin/ai-studio/content-generator", icon: FileText, permission: "manage:ai_studio" },
        { name: "Media Assets Library", href: "/admin/media", icon: ImageIcon, permission: "manage:media" },
      ],
    },
    {
      title: "System & Governance",
      items: [
        { name: "User Management & RBAC", href: "/admin/users", icon: UserCheck, permission: "manage:users" },
        { name: "Security Audit Logs", href: "/admin/audit-logs", icon: History, permission: "view:audit_logs" },
        { name: "System Settings", href: "/admin/settings", icon: Settings, permission: "manage:settings" },
      ],
    },
  ];

  // Filter groups and items based on current session role
  const navGroups = rawNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.permission || hasPermission(session.role, item.permission)
      ),
    }))
    .filter((group) => group.items.length > 0);


  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <BrandLogo variant="light" size="sm" href="/admin" customLogoUrl={siteLogo} />
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3">
                {group.title}
              </span>
              <div className="space-y-0.5 mt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-emerald-800 text-gold-300 font-bold border border-gold-500/30"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-gold-400" : "text-slate-400"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card at bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-gold-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {session.name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">{session.name}</span>
              <span className="text-[10px] text-gold-400 block truncate">{session.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 py-3 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search */}
            <div className="relative hidden sm:block w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, bookings, travellers..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1 text-xs text-slate-300 hover:text-gold-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              View Public Website ↗
            </Link>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {initialNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-white">Notifications</h4>
                    <span className="text-[10px] text-gold-400 font-semibold">
                      {initialNotifications.length} New
                    </span>
                  </div>

                  <div className="space-y-2">
                    {initialNotifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No unread notifications.</p>
                    ) : (
                      initialNotifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                          <span className="font-semibold text-white block">{n.title}</span>
                          <p className="text-[11px] text-slate-400 leading-tight">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Badge */}
            <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase bg-gold-500/20 text-gold-300 border border-gold-500/30 px-2.5 py-1 rounded-full">
              {session.role.replace("_", " ")}
            </span>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 bg-slate-900 overflow-y-auto">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex">
          <div className="w-72 bg-slate-950 h-full overflow-y-auto p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <BrandLogo variant="light" size="sm" customLogoUrl={siteLogo} />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {navGroups.map((group, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      {group.title}
                    </span>
                    {group.items.map((it) => (
                      <Link
                        key={it.href}
                        href={it.href}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs text-slate-300 hover:bg-slate-900"
                      >
                        <it.icon className="w-3.5 h-3.5 text-gold-400" />
                        <span>{it.name}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 flex items-center justify-center gap-2 py-2.5 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

