import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { resolveUserPermissions, getAuthorizedModules } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        agentProfile: { select: { id: true, agentCode: true } },
        customRole: { select: { id: true, name: true, code: true, permissions: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Account is inactive or suspended. Contact administration." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Customer association if role is CUSTOMER
    let customerId: string | null = null;
    if (user.role === "CUSTOMER") {
      let cust = await prisma.customer.findFirst({
        where: { email: cleanEmail },
      });
      if (!cust && user.phone) {
        cust = await prisma.customer.findFirst({
          where: { phone: user.phone },
        });
        if (cust && !cust.email) {
          await prisma.customer.update({
            where: { id: cust.id },
            data: { email: cleanEmail },
          });
        }
      }
      customerId = cust?.id || null;
    }

    const resolvedPermissions = resolveUserPermissions(user);
    const authorizedModules = getAuthorizedModules({
      role: user.role,
      permissions: resolvedPermissions,
    });

    // Determine best landing route
    let redirectTo = "/admin";
    if (user.role === "CUSTOMER") {
      redirectTo = "/customer/dashboard";
    } else if (user.role === "AGENT" && authorizedModules.length === 0) {
      redirectTo = "/agent/dashboard";
    } else if (
      authorizedModules.length > 0 &&
      !authorizedModules.some((m) => m.key === "dashboard")
    ) {
      redirectTo = authorizedModules[0].href;
    }

    // Set Session Cookie
    await setSessionCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      roleName: user.customRole?.name || user.role,
      roleId: user.roleId,
      permissions: resolvedPermissions,
      agentId: user.agentProfile?.id || null,
      customerId,
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await logAudit({
      userId: user.id,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      details: { role: user.role, email: user.email },
    });

    return NextResponse.json({
      success: true,
      redirectTo,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleName: user.customRole?.name || user.role,
        permissions: resolvedPermissions,
        agentId: user.agentProfile?.id || null,
        customerId,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
