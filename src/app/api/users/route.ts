import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    // Security: only users with manage:users permission can list staff
    const auth = await requireAuth(req, "manage:users");
    if (!auth.authorized) return auth.response;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Security: only SUPER_ADMIN or ADMIN can create users
    const auth = await requireAuth(req, "manage:users");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    // Only SUPER_ADMIN can create other SUPER_ADMIN accounts
    const body = await req.json();
    const { name, email, password, role, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Prevent privilege escalation: non-SUPER_ADMIN cannot create SUPER_ADMIN
    if (role === "SUPER_ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only a SUPER_ADMIN can create another SUPER_ADMIN account." },
        { status: 403 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role || "SALES_EXECUTIVE",
        phone: phone || null,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    await logAudit({
      userId: session.id,
      action: "CREATE_USER",
      entity: "User",
      entityId: user.id,
      details: { email: user.email, role: user.role },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
