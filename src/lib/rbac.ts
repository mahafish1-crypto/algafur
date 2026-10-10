export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "SALES_EXECUTIVE"
  | "ACCOUNTS"
  | "VISA_TEAM"
  | "OPERATIONS"
  | "MARKETING"
  | "AGENT"
  | "CUSTOMER"
  | (string & {});

export type ModuleKey =
  | "dashboard"
  | "leads"
  | "customers"
  | "followups"
  | "bookings"
  | "departure_groups"
  | "packages"
  | "hotels"
  | "flights"
  | "documents"
  | "visas"
  | "payments"
  | "quotations"
  | "invoices"
  | "reports"
  | "ai_studio"
  | "media"
  | "settings"
  | "audit_logs"
  | "users";

export type ActionKey =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "export"
  | "manage";

export type LegacyPermission =
  | "view:dashboard"
  | "manage:leads"
  | "view:leads"
  | "manage:customers"
  | "view:customers"
  | "manage:bookings"
  | "view:bookings"
  | "manage:packages"
  | "view:packages"
  | "manage:hotels"
  | "manage:flights"
  | "manage:departure_groups"
  | "manage:payments"
  | "view:payments"
  | "manage:quotations"
  | "view:quotations"
  | "manage:invoices"
  | "view:invoices"
  | "manage:documents"
  | "verify:documents"
  | "manage:visas"
  | "manage:ai_studio"
  | "manage:media"
  | "manage:users"
  | "view:reports"
  | "manage:settings"
  | "view:audit_logs"
  | "access:agent_portal"
  | "access:customer_portal";

export type GranularPermission = `${ModuleKey}:${ActionKey}`;
export type Permission = LegacyPermission | GranularPermission | (string & {});

export interface ModuleDefinition {
  key: ModuleKey;
  label: string;
  description: string;
  href: string;
  iconName: string;
  actions: ActionKey[];
}

export const MODULES_CONFIG: ModuleDefinition[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Executive overview, metrics, and authorized activity widgets",
    href: "/admin",
    iconName: "LayoutDashboard",
    actions: ["view"],
  },
  {
    key: "leads",
    label: "Leads (CRM)",
    description: "Inquiries, lead pipeline, and prospect qualification",
    href: "/admin/crm/leads",
    iconName: "Target",
    actions: ["view", "create", "edit", "delete", "export"],
  },
  {
    key: "customers",
    label: "Customers (Pilgrims)",
    description: "Pilgrim directory, passport records, and family profiles",
    href: "/admin/customers",
    iconName: "Users",
    actions: ["view", "create", "edit", "delete", "export"],
  },
  {
    key: "followups",
    label: "Follow-Ups",
    description: "Scheduled calls, reminders, and customer follow-up tasks",
    href: "/admin/crm/followups",
    iconName: "CalendarCheck",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "bookings",
    label: "Bookings",
    description: "Pilgrim reservations, room allocations, and traveller manifests",
    href: "/admin/bookings",
    iconName: "Briefcase",
    actions: ["view", "create", "edit", "delete", "approve", "export"],
  },
  {
    key: "departure_groups",
    label: "Departure Groups",
    description: "Group batches, seat capacities, and departure schedules",
    href: "/admin/bookings/groups",
    iconName: "Calendar",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "packages",
    label: "Packages",
    description: "Hajj & Umrah tour packages, pricing tiers, and itineraries",
    href: "/admin/packages",
    iconName: "Building2",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "hotels",
    label: "Hotels",
    description: "Makkah & Madinah hotel inventory and distance records",
    href: "/admin/travel/hotels",
    iconName: "Hotel",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "flights",
    label: "Flights",
    description: "Airline PNR blocks, flight sectors, and baggage allowances",
    href: "/admin/travel/flights",
    iconName: "Plane",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "documents",
    label: "Document KYC",
    description: "Passport scans, photos, pan cards, and KYC verification",
    href: "/admin/documents",
    iconName: "FileCheck2",
    actions: ["view", "create", "edit", "delete", "approve"],
  },
  {
    key: "visas",
    label: "Visa Processing",
    description: "Umrah/Hajj e-Visa applications, mofa status, and visa tracking",
    href: "/admin/visa",
    iconName: "ShieldCheck",
    actions: ["view", "create", "edit", "delete", "approve"],
  },
  {
    key: "payments",
    label: "Payments",
    description: "Receipts, payment collections, ledger, and verification",
    href: "/admin/payments",
    iconName: "CreditCard",
    actions: ["view", "create", "edit", "delete", "approve", "export"],
  },
  {
    key: "quotations",
    label: "Quotations",
    description: "Custom package proposals and price estimates",
    href: "/admin/quotations",
    iconName: "FileSpreadsheet",
    actions: ["view", "create", "edit", "delete", "export"],
  },
  {
    key: "invoices",
    label: "Invoices",
    description: "Tax invoices, billing statements, and balance tracking",
    href: "/admin/invoices",
    iconName: "Receipt",
    actions: ["view", "create", "edit", "delete", "export"],
  },
  {
    key: "reports",
    label: "Reports",
    description: "Financial summaries, conversion analytics, and exports",
    href: "/admin/reports",
    iconName: "BarChart3",
    actions: ["view", "export"],
  },
  {
    key: "ai_studio",
    label: "AI Studio",
    description: "AI marketing poster generator and itinerary writer",
    href: "/admin/ai-studio/image-generator",
    iconName: "Sparkles",
    actions: ["view", "create", "manage"],
  },
  {
    key: "media",
    label: "Media Asset Library",
    description: "Uploaded images, branding assets, and marketing files",
    href: "/admin/media",
    iconName: "ImageIcon",
    actions: ["view", "create", "edit", "delete", "manage"],
  },
  {
    key: "settings",
    label: "Site Settings",
    description: "Branding, contact offices, WhatsApp templates, and configuration",
    href: "/admin/settings",
    iconName: "Settings",
    actions: ["view", "edit", "manage"],
  },
  {
    key: "audit_logs",
    label: "Audit Logs",
    description: "System security trail and staff activity history",
    href: "/admin/audit-logs",
    iconName: "FileText",
    actions: ["view", "export"],
  },
  {
    key: "users",
    label: "User & Role Management",
    description: "Staff accounts, custom roles, and module permissions",
    href: "/admin/users",
    iconName: "UserCog",
    actions: ["view", "create", "edit", "delete", "manage"],
  },
];

export const ALL_MODULE_KEYS: ModuleKey[] = MODULES_CONFIG.map((m) => m.key);

export const ALL_GRANULAR_PERMISSIONS: string[] = MODULES_CONFIG.flatMap((m) =>
  m.actions.map((a) => `${m.key}:${a}`)
);

export const DEFAULT_ROLE_GRANULAR_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["*", ...ALL_GRANULAR_PERMISSIONS],
  ADMIN: ALL_GRANULAR_PERMISSIONS.filter((p) => !p.startsWith("users:")),
  MANAGER: [
    "dashboard:view",
    "leads:view",
    "leads:create",
    "leads:edit",
    "leads:export",
    "customers:view",
    "customers:create",
    "customers:edit",
    "followups:view",
    "followups:create",
    "followups:edit",
    "bookings:view",
    "bookings:create",
    "bookings:edit",
    "bookings:approve",
    "departure_groups:view",
    "departure_groups:create",
    "departure_groups:edit",
    "packages:view",
    "payments:view",
    "quotations:view",
    "quotations:create",
    "quotations:edit",
    "documents:view",
    "documents:create",
    "documents:edit",
    "documents:approve",
    "visas:view",
    "visas:create",
    "visas:edit",
    "visas:approve",
    "reports:view",
  ],
  SALES_EXECUTIVE: [
    "dashboard:view",
    "leads:view",
    "leads:create",
    "leads:edit",
    "customers:view",
    "customers:create",
    "customers:edit",
    "followups:view",
    "followups:create",
    "followups:edit",
    "bookings:view",
    "bookings:create",
    "packages:view",
    "quotations:view",
    "quotations:create",
    "quotations:edit",
    "invoices:view",
  ],
  ACCOUNTS: [
    "dashboard:view",
    "customers:view",
    "bookings:view",
    "payments:view",
    "payments:create",
    "payments:edit",
    "payments:approve",
    "payments:export",
    "invoices:view",
    "invoices:create",
    "invoices:edit",
    "invoices:export",
    "quotations:view",
    "reports:view",
    "reports:export",
  ],
  VISA_TEAM: [
    "dashboard:view",
    "customers:view",
    "bookings:view",
    "documents:view",
    "documents:create",
    "documents:edit",
    "documents:approve",
    "visas:view",
    "visas:create",
    "visas:edit",
    "visas:approve",
  ],
  OPERATIONS: [
    "dashboard:view",
    "bookings:view",
    "bookings:edit",
    "departure_groups:view",
    "departure_groups:create",
    "departure_groups:edit",
    "packages:view",
    "hotels:view",
    "hotels:create",
    "hotels:edit",
    "flights:view",
    "flights:create",
    "flights:edit",
  ],
  MARKETING: [
    "dashboard:view",
    "leads:view",
    "leads:create",
    "leads:edit",
    "packages:view",
    "ai_studio:view",
    "ai_studio:create",
    "ai_studio:manage",
    "media:view",
    "media:create",
    "media:edit",
  ],
  AGENT: ["access:agent_portal", "packages:view", "leads:view", "leads:create"],
  CUSTOMER: ["access:customer_portal", "packages:view"],
};

export const ROLE_PERMISSIONS: Record<string, string[]> =
  DEFAULT_ROLE_GRANULAR_PERMISSIONS;

const KNOWN_ACTIONS = new Set([
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "export",
  "manage",
  "verify",
  "access",
]);

/**
 * Parses either `module:action` (e.g. `visas:view`) or legacy `action:module` (e.g. `view:visas`)
 */
export function parsePermissionKey(
  perm: string
): { module: string; action: string } | null {
  if (!perm || !perm.includes(":")) return null;
  const [part1, part2] = perm.split(":");
  if (!part1 || !part2) return null;

  if (KNOWN_ACTIONS.has(part1) && !KNOWN_ACTIONS.has(part2)) {
    // Legacy format: action:module (e.g. view:leads, verify:documents)
    return {
      module: part2,
      action: part1 === "verify" ? "approve" : part1,
    };
  }
  // Standard granular format: module:action (e.g. leads:view, documents:approve)
  return {
    module: part1,
    action: part2 === "verify" ? "approve" : part2,
  };
}

/**
 * Safely parses a JSON array of permission strings stored in the DB
 */
export function parseStoredPermissions(
  raw: string | string[] | null | undefined
): string[] | null {
  if (raw === null || raw === undefined) return null;
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string");
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((x): x is string => typeof x === "string");
      }
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Resolves the effective list of granular permissions for a user.
 * Priority:
 * 1. SUPER_ADMIN always receives full permissions.
 * 2. Explicit user.permissions (if non-null in DB).
 * 3. Assigned customRole.permissions (if non-null in DB).
 * 4. Built-in default permissions for user.role (for existing legacy users).
 */
export function resolveUserPermissions(user: {
  role?: string | null;
  permissions?: string | string[] | null;
  customRole?: { permissions?: string | string[] | null } | null;
}): string[] {
  const role = (user.role || "").toUpperCase();
  if (role === "SUPER_ADMIN") {
    return ["*", ...ALL_GRANULAR_PERMISSIONS];
  }

  const explicitUserPerms = parseStoredPermissions(user.permissions);
  if (explicitUserPerms !== null) {
    return normalizePermissionList(explicitUserPerms);
  }

  const customRolePerms = parseStoredPermissions(user.customRole?.permissions);
  if (customRolePerms !== null) {
    return normalizePermissionList(customRolePerms);
  }

  return DEFAULT_ROLE_GRANULAR_PERMISSIONS[role] || [];
}

/**
 * Normalizes a permission array so every permission is represented in `module:action` form
 */
export function normalizePermissionList(perms: string[]): string[] {
  const result = new Set<string>();
  for (const p of perms) {
    if (p === "*") {
      result.add("*");
      continue;
    }
    const parsed = parsePermissionKey(p);
    if (!parsed) continue;
    const { module, action } = parsed;
    if (module === "agent_portal" || module === "customer_portal") {
      result.add(`access:${module}`);
      continue;
    }
    result.add(`${module}:${action}`);
    // If a user has any action in a module, they implicitly have view access to that module
    if (action !== "view") {
      result.add(`${module}:view`);
    }
    // If a user has `manage` on a module, expand to all defined actions for that module
    if (action === "manage") {
      const modDef = MODULES_CONFIG.find((m) => m.key === module);
      if (modDef) {
        for (const act of modDef.actions) {
          result.add(`${module}:${act}`);
        }
      }
    }
  }
  return Array.from(result);
}

/**
 * Checks whether a resolved list of permissions (or role) grants a specific permission.
 */
export function checkPermissionInList(
  grantedPermissions: string[],
  requiredPermission: Permission
): boolean {
  if (!grantedPermissions || grantedPermissions.length === 0) return false;
  if (grantedPermissions.includes("*")) return true;
  if (grantedPermissions.includes(requiredPermission)) return true;

  const parsed = parsePermissionKey(requiredPermission);
  if (!parsed) return false;
  const { module, action } = parsed;

  if (
    grantedPermissions.includes(`${module}:${action}`) ||
    grantedPermissions.includes(`${action}:${module}`) ||
    grantedPermissions.includes(`${module}:*`) ||
    grantedPermissions.includes(`${module}:manage`) ||
    grantedPermissions.includes(`manage:${module}`)
  ) {
    return true;
  }

  // If checking `view`, having any action on the module allows viewing it
  if (action === "view") {
    return grantedPermissions.some((gp) => {
      const gpParsed = parsePermissionKey(gp);
      return gpParsed?.module === module;
    });
  }

  // If a legacy caller asks for `manage:<module>`, allow if user has create, edit, or approve on that module
  if (action === "manage") {
    return (
      grantedPermissions.includes(`${module}:create`) ||
      grantedPermissions.includes(`${module}:edit`) ||
      grantedPermissions.includes(`${module}:approve`)
    );
  }

  return false;
}

/**
 * Checks permission for a user object (supports SessionUser, Prisma User, or role string).
 */
export function hasUserPermission(
  userOrRole:
    | {
        role?: string | null;
        permissions?: string[] | string | null;
      }
    | string
    | null
    | undefined,
  permission: Permission
): boolean {
  if (!userOrRole) return false;
  if (typeof userOrRole === "string") {
    if (userOrRole === "SUPER_ADMIN") return true;
    const defaultPerms = DEFAULT_ROLE_GRANULAR_PERMISSIONS[userOrRole] || [];
    return checkPermissionInList(defaultPerms, permission);
  }

  if (userOrRole.role === "SUPER_ADMIN") return true;
  const resolved = resolveUserPermissions(userOrRole);
  return checkPermissionInList(resolved, permission);
}

/**
 * Backward-compatible helper that accepts either a role string or a user/permissions array
 */
export function hasPermission(
  roleOrUser:
    | string
    | { role?: string | null; permissions?: string[] | string | null }
    | null
    | undefined,
  permission: Permission
): boolean {
  return hasUserPermission(roleOrUser, permission);
}

export function isSuperAdmin(
  userOrRole: { role?: string | null } | string | null | undefined
): boolean {
  if (!userOrRole) return false;
  const role = typeof userOrRole === "string" ? userOrRole : userOrRole.role;
  return role === "SUPER_ADMIN";
}

/**
 * Determines whether a user can enter the `/admin` panel.
 * A user can access `/admin` if they are SUPER_ADMIN, or if they are not a CUSTOMER/AGENT-only account
 * and have at least one admin module permission.
 */
export function canAccessAdmin(
  userOrRole:
    | {
        role?: string | null;
        permissions?: string[] | string | null;
        status?: string | null;
      }
    | string
    | null
    | undefined
): boolean {
  if (!userOrRole) return false;
  if (typeof userOrRole === "string") {
    if (userOrRole === "CUSTOMER" || userOrRole === "AGENT") return false;
    if (userOrRole === "SUPER_ADMIN") return true;
    const defaultPerms = DEFAULT_ROLE_GRANULAR_PERMISSIONS[userOrRole];
    return Array.isArray(defaultPerms) ? defaultPerms.length > 0 : true;
  }

  if (userOrRole.status && userOrRole.status !== "ACTIVE") {
    return false;
  }

  const role = userOrRole.role || "";
  if (role === "SUPER_ADMIN") return true;
  if (role === "CUSTOMER") return false;

  const perms = resolveUserPermissions(userOrRole);
  // Check if user has view access to at least one admin module
  return ALL_MODULE_KEYS.some((modKey) =>
    checkPermissionInList(perms, `${modKey}:view`)
  );
}

/**
 * Returns the list of ModuleDefinitions that the user has `:view` permission for.
 */
export function getAuthorizedModules(user: {
  role?: string | null;
  permissions?: string[] | string | null;
}): ModuleDefinition[] {
  return MODULES_CONFIG.filter((mod) =>
    hasUserPermission(user, `${mod.key}:view`)
  );
}

/**
 * Maps an `/admin/...` pathname to the required module key (if any).
 */
export function getModuleForAdminPath(pathname: string): ModuleKey | null {
  const clean = pathname.split("?")[0].replace(/\/+$/, "") || "/admin";
  if (clean === "/admin") return "dashboard";
  if (clean.startsWith("/admin/crm/leads") || clean.startsWith("/admin/leads")) return "leads";
  if (clean.startsWith("/admin/customers")) return "customers";
  if (clean.startsWith("/admin/crm/followups") || clean.startsWith("/admin/followups")) return "followups";
  if (clean.startsWith("/admin/bookings/groups") || clean.startsWith("/admin/departure-groups")) return "departure_groups";
  if (clean.startsWith("/admin/bookings")) return "bookings";
  if (clean.startsWith("/admin/packages")) return "packages";
  if (clean.startsWith("/admin/travel/hotels") || clean.startsWith("/admin/hotels")) return "hotels";
  if (clean.startsWith("/admin/travel/flights") || clean.startsWith("/admin/flights")) return "flights";
  if (clean.startsWith("/admin/documents")) return "documents";
  if (clean.startsWith("/admin/visa")) return "visas";
  if (clean.startsWith("/admin/payments")) return "payments";
  if (clean.startsWith("/admin/quotations")) return "quotations";
  if (clean.startsWith("/admin/invoices")) return "invoices";
  if (clean.startsWith("/admin/reports")) return "reports";
  if (clean.startsWith("/admin/ai-studio")) return "ai_studio";
  if (clean.startsWith("/admin/media")) return "media";
  if (clean.startsWith("/admin/settings")) return "settings";
  if (clean.startsWith("/admin/audit-logs")) return "audit_logs";
  if (clean.startsWith("/admin/users")) return "users";
  return null;
}
