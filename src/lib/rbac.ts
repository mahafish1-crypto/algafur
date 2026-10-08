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
  | "CUSTOMER";

export type Permission =
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

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "view:dashboard",
    "manage:leads",
    "view:leads",
    "manage:customers",
    "view:customers",
    "manage:bookings",
    "view:bookings",
    "manage:packages",
    "view:packages",
    "manage:hotels",
    "manage:flights",
    "manage:departure_groups",
    "manage:payments",
    "view:payments",
    "manage:quotations",
    "view:quotations",
    "manage:invoices",
    "view:invoices",
    "manage:documents",
    "verify:documents",
    "manage:visas",
    "manage:ai_studio",
    "manage:media",
    "manage:users",
    "view:reports",
    "manage:settings",
    "view:audit_logs",
  ],
  ADMIN: [
    "view:dashboard",
    "manage:leads",
    "view:leads",
    "manage:customers",
    "view:customers",
    "manage:bookings",
    "view:bookings",
    "manage:packages",
    "view:packages",
    "manage:hotels",
    "manage:flights",
    "manage:departure_groups",
    "manage:payments",
    "view:payments",
    "manage:quotations",
    "view:quotations",
    "manage:invoices",
    "view:invoices",
    "manage:documents",
    "verify:documents",
    "manage:visas",
    "manage:ai_studio",
    "manage:media",
    "view:reports",
    "manage:settings",
  ],
  MANAGER: [
    "view:dashboard",
    "manage:leads",
    "view:leads",
    "manage:customers",
    "view:customers",
    "manage:bookings",
    "view:bookings",
    "view:packages",
    "manage:departure_groups",
    "view:payments",
    "manage:quotations",
    "view:quotations",
    "manage:documents",
    "manage:visas",
    "view:reports",
  ],
  SALES_EXECUTIVE: [
    "view:dashboard",
    "manage:leads",
    "view:leads",
    "manage:customers",
    "view:customers",
    "view:bookings",
    "view:packages",
    "manage:quotations",
    "view:quotations",
    "view:invoices",
  ],
  ACCOUNTS: [
    "view:dashboard",
    "view:customers",
    "view:bookings",
    "manage:payments",
    "view:payments",
    "manage:invoices",
    "view:invoices",
    "view:reports",
  ],
  VISA_TEAM: [
    "view:dashboard",
    "view:customers",
    "view:bookings",
    "manage:documents",
    "verify:documents",
    "manage:visas",
  ],
  OPERATIONS: [
    "view:dashboard",
    "manage:hotels",
    "manage:flights",
    "manage:departure_groups",
    "view:bookings",
    "view:packages",
  ],
  MARKETING: [
    "view:dashboard",
    "manage:leads",
    "view:leads",
    "manage:ai_studio",
    "manage:media",
  ],
  AGENT: [
    "access:agent_portal",
    "view:packages",
    "manage:leads",
  ],
  CUSTOMER: [
    "access:customer_portal",
    "view:packages",
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role as Role] || [];
  return permissions.includes(permission);
}

export function canAccessAdmin(role: string): boolean {
  return [
    "SUPER_ADMIN",
    "ADMIN",
    "MANAGER",
    "SALES_EXECUTIVE",
    "ACCOUNTS",
    "VISA_TEAM",
    "OPERATIONS",
    "MARKETING",
  ].includes(role);
}

