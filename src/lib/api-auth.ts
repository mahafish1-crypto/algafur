/**
 * API Authentication & Authorization helpers.
 * Use these in every API route to enforce server-side RBAC and granular permissions.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession, SessionUser } from "@/lib/auth";
import { hasUserPermission, isSuperAdmin, Permission } from "@/lib/rbac";

export interface AuthResult {
  authorized: true;
  session: SessionUser;
}

export interface DeniedResult {
  authorized: false;
  response: NextResponse;
}

/**
 * requireAuth — checks the live session and (optionally) one or more permissions.
 * If an array of permissions is passed, the user must have at least one of them.
 */
export async function requireAuth(
  _req: NextRequest,
  permission?: Permission | Permission[]
): Promise<AuthResult | DeniedResult> {
  const session = await getSession();

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      ),
    };
  }

  if (permission) {
    const permsToCheck = Array.isArray(permission) ? permission : [permission];
    const allowed = permsToCheck.some((p) => hasUserPermission(session, p));
    if (!allowed) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: `Access denied. Required permission: ${permsToCheck.join(" or ")}.`,
          },
          { status: 403 }
        ),
      };
    }
  }

  return { authorized: true, session };
}

/**
 * requireSuperAdmin — strictly enforces SUPER_ADMIN access.
 * Used for User & Role Management, credential resets, and permission administration.
 */
export async function requireSuperAdmin(
  _req: NextRequest
): Promise<AuthResult | DeniedResult> {
  const session = await getSession();
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }
  if (!isSuperAdmin(session)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden. Only Super Admin can perform this action." },
        { status: 403 }
      ),
    };
  }
  return { authorized: true, session };
}

/**
 * requireAdminOnly — allows SUPER_ADMIN or users with explicit permission.
 */
export async function requireAdminOnly(
  _req: NextRequest,
  fallbackPermission?: Permission
): Promise<AuthResult | DeniedResult> {
  const session = await getSession();
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }
  if (
    isSuperAdmin(session) ||
    session.role === "ADMIN" ||
    (fallbackPermission && hasUserPermission(session, fallbackPermission))
  ) {
    return { authorized: true, session };
  }
  return {
    authorized: false,
    response: NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    ),
  };
}
