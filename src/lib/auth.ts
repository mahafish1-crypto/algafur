import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "./db";
import { resolveUserPermissions } from "./rbac";

const AUTH_COOKIE_NAME = "algafur_session";
const SECRET = process.env.AUTH_SECRET || "algafur-sacred-journey-production-secret-salt-2026";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  roleName?: string;
  roleId?: string | null;
  permissions?: string[];
  agentId?: string | null;
  customerId?: string | null;
}

// Simple and robust HMAC-SHA256 token signing (stores compact identity claims in cookie)
export function signSessionToken(payload: SessionUser): string {
  const compactPayload = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    agentId: payload.agentId ?? null,
    customerId: payload.customerId ?? null,
  };
  const data = Buffer.from(JSON.stringify(compactPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(data)
      .digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }
    const jsonStr = Buffer.from(data, "base64url").toString("utf-8");
    return JSON.parse(jsonStr) as SessionUser;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const decoded = verifySessionToken(token);
  if (!decoded?.id) return null;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        roleId: true,
        permissions: true,
        status: true,
        customRole: {
          select: {
            id: true,
            name: true,
            code: true,
            permissions: true,
          },
        },
        agentProfile: {
          select: { id: true },
        },
      },
    });

    if (!dbUser || dbUser.status !== "ACTIVE") {
      return null;
    }

    const permissions = resolveUserPermissions(dbUser);
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      roleName: dbUser.customRole?.name || dbUser.role,
      roleId: dbUser.roleId,
      permissions,
      agentId: dbUser.agentProfile?.id || decoded.agentId || null,
      customerId: decoded.customerId || null,
    };
  } catch (err) {
    console.error("Session verification DB lookup error:", err);
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  const token = signSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getAuthenticatedUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      roleId: true,
      permissions: true,
      phone: true,
      status: true,
      customRole: {
        select: { id: true, name: true, code: true, permissions: true },
      },
      agentProfile: {
        select: { id: true, agentCode: true, agencyName: true },
      },
    },
  });
  if (!user || user.status !== "ACTIVE") return null;
  return {
    ...user,
    resolvedPermissions: resolveUserPermissions(user),
  };
}
