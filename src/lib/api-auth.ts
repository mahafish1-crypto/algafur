/**
 * API Authentication & Authorization helpers.
 * Use these in every API route to enforce server-side RBAC.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/rbac";

export interface AuthResult {
  authorized: true;
  session: { id: string; email: string; name: string; role: string; agentId?: string | null; customerId?: string | null };
}

export interface DeniedResult {
  authorized: false;
  response: NextResponse;
}

/**
 * requireAuth — checks the session cookie and (optionally) a specific permission.
 * Returns either { authorized: true, session } or { authorized: false, response }.
 *
 * Usage:
 *   const auth = await requireAuth(req);
 *   if (!auth.authorized) return auth.response;
 *   // auth.session is now typed
 */
export async function requireAuth(
  _req: NextRequest,
  permission?: Permission
): Promise<AuthResult | DeniedResult> {
  const session = await getSession();

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Authentication required. Please log in." }, { status: 401 }),
    };
  }

  if (permission && !hasPermission(session.role, permission)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: `Insufficient permissions. '${permission}' is required.` },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, session };
}

/**
 * requireAdminOnly — only SUPER_ADMIN and ADMIN can proceed.
 */
export async function requireAdminOnly(_req: NextRequest): Promise<AuthResult | DeniedResult> {
  const session = await getSession();
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Admin access required." }, { status: 403 }),
    };
  }
  return { authorized: true, session };
}

