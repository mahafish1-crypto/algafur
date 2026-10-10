import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import prisma from "./db";
import { getSession, SessionUser } from "./auth";
import {
  hasUserPermission,
  getAuthorizedModules,
  DEFAULT_ROLE_GRANULAR_PERMISSIONS,
  MODULES_CONFIG,
  ModuleKey,
} from "./rbac";

const INITIAL_CUSTOM_ROLES = [
  {
    name: "Sales & Booking Executive",
    code: "SALES_EXECUTIVE",
    description: "Manages leads, pilgrims, follow-ups, quotations, and bookings",
    permissions: DEFAULT_ROLE_GRANULAR_PERMISSIONS.SALES_EXECUTIVE,
    isSystem: false,
  },
  {
    name: "Visa & Document Executive",
    code: "VISA_TEAM",
    description: "Handles pilgrim passport KYC verification and Umrah/Hajj visa processing",
    permissions: DEFAULT_ROLE_GRANULAR_PERMISSIONS.VISA_TEAM,
    isSystem: false,
  },
  {
    name: "Accounts & Billing Officer",
    code: "ACCOUNTS",
    description: "Manages payment receipts, financial verification, invoices, and reports",
    permissions: DEFAULT_ROLE_GRANULAR_PERMISSIONS.ACCOUNTS,
    isSystem: false,
  },
  {
    name: "Operations & Group Coordinator",
    code: "OPERATIONS",
    description: "Manages departure groups, Makkah/Madinah hotels, flights, and packages",
    permissions: DEFAULT_ROLE_GRANULAR_PERMISSIONS.OPERATIONS,
    isSystem: false,
  },
];

export async function ensureInitialRolesSeeded() {
  const count = await prisma.customRole.count();
  if (count === 0) {
    for (const r of INITIAL_CUSTOM_ROLES) {
      const created = await prisma.customRole.upsert({
        where: { code: r.code },
        update: {},
        create: {
          name: r.name,
          code: r.code,
          description: r.description,
          permissions: JSON.stringify(r.permissions),
          isSystem: r.isSystem,
        },
      });
      await prisma.user.updateMany({
        where: { role: r.code, roleId: null },
        data: { roleId: created.id },
      });
    }
  }
}

export async function verifyModuleAccess(moduleKey: ModuleKey): Promise<{
  allowed: boolean;
  session: SessionUser;
}> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const allowed =
    moduleKey === "users"
      ? session.role === "SUPER_ADMIN" || hasUserPermission(session, "users:view")
      : hasUserPermission(session, `${moduleKey}:view`);
  return { allowed, session };
}

export function AccessDeniedView({
  moduleKey,
  session,
}: {
  moduleKey: ModuleKey;
  session: SessionUser;
}) {
  const mod = MODULES_CONFIG.find((m) => m.key === moduleKey);
  const authorizedModules = getAuthorizedModules(session);
  const firstAllowedHref = authorizedModules[0]?.href || "/admin";

  return (
    <div className="min-h-[65vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-gray-200/80 shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5 text-red-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-bold uppercase tracking-wider mb-3">
          <Lock className="w-3 h-3" /> Restricted Module
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#0D3B2E] mb-2">
          Access Restricted
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Your account (<span className="font-semibold text-gray-800">{session.email}</span>) does not have permission to access{" "}
          <span className="font-semibold text-[#0D3B2E]">
            {mod?.label || moduleKey}
          </span>
          . Please contact the Super Admin if you require access to this module.
        </p>

        {authorizedModules.length > 0 && (
          <div className="bg-[#FAF7F0] rounded-2xl p-4 border border-[#E5DEC9]/60 mb-6 text-left">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              Your Authorized Modules ({authorizedModules.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {authorizedModules.map((m) => (
                <Link
                  key={m.key}
                  href={m.href}
                  className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-[#0D3B2E] hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
                >
                  {m.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link
          href={firstAllowedHref}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0D3B2E] text-white text-sm font-bold hover:bg-[#175241] transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Authorized Workspace
        </Link>
      </div>
    </div>
  );
}
