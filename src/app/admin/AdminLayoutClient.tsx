"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandLogo from "@/components/brand/BrandLogo";
import {
  hasUserPermission,
  getModuleForAdminPath,
  ModuleKey,
  MODULES_CONFIG,
} from "@/lib/rbac";
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
  Calendar,
  ShieldAlert,
  Lock,
  ArrowLeft,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: {
    id: string;
    name: string;
    email: string;
    role: string;
    roleName?: string;
    permissions?: string[];
  };
  initialNotifications: Array<{
    id: string;
    title: string;
    message: string;
  }>;
  siteLogo?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  moduleKey: ModuleKey;
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

  const allNavItems: NavItem[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, moduleKey: "dashboard" },
    { name: "Leads (CRM)", href: "/admin/crm/leads", icon: Users, moduleKey: "leads" },
    { name: "Customers", href: "/admin/customers", icon: UserCheck, moduleKey: "customers" },
    { name: "Follow-Ups", href: "/admin/crm/followups", icon: Calendar, moduleKey: "followups" },
    { name: "Bookings", href: "/admin/bookings", icon: Compass, moduleKey: "bookings" },
    { name: "Departure Groups", href: "/admin/bookings/groups", icon: Users, moduleKey: "departure_groups" },
    { name: "Packages", href: "/admin/packages", icon: FileText, moduleKey: "packages" },
    { name: "Hotels", href: "/admin/travel/hotels", icon: Building, moduleKey: "hotels" },
    { name: "Flights", href: "/admin/travel/flights", icon: Plane, moduleKey: "flights" },
    { name: "Document KYC", href: "/admin/documents", icon: FileCheck, moduleKey: "documents" },
    { name: "Visa Processing", href: "/admin/visa", icon: ShieldCheck, moduleKey: "visas" },
    { name: "Payments", href: "/admin/payments", icon: CreditCard, moduleKey: "payments" },
    { name: "Quotations", href: "/admin/quotations", icon: FileSpreadsheet, moduleKey: "quotations" },
    { name: "Invoices", href: "/admin/invoices", icon: Receipt, moduleKey: "invoices" },
    { name: "Reports", href: "/admin/reports", icon: BarChart3, moduleKey: "reports" },
    { name: "AI Poster Studio", href: "/admin/ai-studio/image-generator", icon: Sparkles, moduleKey: "ai_studio" },
    { name: "AI Content Studio", href: "/admin/ai-studio/content-generator", icon: FileText, moduleKey: "ai_studio" },
    { name: "Media Asset Library", href: "/admin/media", icon: ImageIcon, moduleKey: "media" },
    { name: "Site Settings", href: "/admin/settings", icon: Settings, moduleKey: "settings" },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: History, moduleKey: "audit_logs" },
    { name: "User & Role Access", href: "/admin/users", icon: UserCheck, moduleKey: "users" },
  ];

  // Filter items strictly by the user's live resolved module permissions
  const authorizedNavItems = allNavItems.filter((item) => {
    if (item.moduleKey === "users") {
      return (
        session.role === "SUPER_ADMIN" ||
        hasUserPermission(session, "users:view")
      );
    }
    return hasUserPermission(session, `${item.moduleKey}:view`);
  });

  // Search filtering over authorized modules
  const searchMatchingModules = searchQuery.trim()
    ? authorizedNavItems.filter((it) =>
        it.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : [];

  // Route-level permission check for direct URL access
  const currentModuleKey = getModuleForAdminPath(pathname);
  const isRouteAllowed =
    !currentModuleKey ||
    currentModuleKey === "dashboard" ||
    (currentModuleKey === "users"
      ? session.role === "SUPER_ADMIN" || hasUserPermission(session, "users:view")
      : hasUserPermission(session, `${currentModuleKey}:view`));

  const currentModuleDef = currentModuleKey
    ? MODULES_CONFIG.find((m) => m.key === currentModuleKey)
    : null;

  const displayRoleLabel =
    session.role === "SUPER_ADMIN"
      ? "Super Admin"
      : session.roleName || session.role.replace(/_/g, " ");

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <BrandLogo variant="light" size="sm" href="/admin" customLogoUrl={siteLogo} />
        </div>

        {/* Authorized Navigation Items (No Fixed Department Roles) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Authorized Modules
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-gold-400 border border-slate-800">
              {authorizedNavItems.length}
            </span>
          </div>

          {authorizedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-800 text-gold-300 font-bold border border-gold-500/30 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-gold-400" : "text-slate-400"
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Card at bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-gold-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {session.name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">
                {session.name}
              </span>
              <span className="text-[10px] text-gold-400 block truncate">
                {displayRoleLabel}
              </span>
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

            {/* Quick Authorized Module Search */}
            <div className="relative hidden sm:block w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to authorized module..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-600"
              />
              {searchQuery.trim() !== "" && (
                <div className="absolute left-0 right-0 mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  {searchMatchingModules.length === 0 ? (
                    <div className="px-3 py-2.5 text-xs text-slate-400">
                      No matching authorized modules
                    </div>
                  ) : (
                    searchMatchingModules.map((mod) => (
                      <Link
                        key={mod.href}
                        href={mod.href}
                        onClick={() => setSearchQuery("")}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <mod.icon className="w-3.5 h-3.5 text-gold-400" />
                        <span>{mod.name}</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
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
                      <p className="text-xs text-slate-400 text-center py-4">
                        No unread notifications.
                      </p>
                    ) : (
                      initialNotifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1"
                        >
                          <span className="font-semibold text-white block">
                            {n.title}
                          </span>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Assigned Role Badge */}
            <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase bg-gold-500/20 text-gold-300 border border-gold-500/30 px-2.5 py-1 rounded-full">
              {displayRoleLabel}
            </span>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 bg-slate-900 overflow-y-auto">
          {isRouteAllowed ? (
            children
          ) : (
            <div className="min-h-[65vh] flex items-center justify-center p-6">
              <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-8 text-center text-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5 text-rose-600">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold uppercase tracking-wider mb-3">
                  <Lock className="w-3 h-3" /> Restricted Module
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#0D3B2E] mb-2">
                  Access Restricted
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Your account (<span className="font-semibold text-slate-900">{session.email}</span>) does not have permission to access{" "}
                  <span className="font-semibold text-[#0D3B2E]">
                    {currentModuleDef?.label || currentModuleKey}
                  </span>
                  . Only modules enabled for your role by Super Admin are accessible.
                </p>

                {authorizedNavItems.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-left">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                      Your Authorized Modules ({authorizedNavItems.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {authorizedNavItems.map((m) => (
                        <Link
                          key={m.href}
                          href={m.href}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#0D3B2E] hover:border-emerald-600 transition-colors"
                        >
                          {m.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href={authorizedNavItems[0]?.href || "/admin"}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0D3B2E] text-white text-sm font-bold hover:bg-[#175241] transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Authorized Workspace
                </Link>
              </div>
            </div>
          )}
        </main>
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

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block pb-1">
                  Authorized Modules
                </span>
                {authorizedNavItems.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900"
                  >
                    <it.icon className="w-4 h-4 text-gold-400" />
                    <span>{it.name}</span>
                  </Link>
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
