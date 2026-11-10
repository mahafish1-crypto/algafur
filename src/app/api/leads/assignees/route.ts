import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:leads");
    if (!auth.authorized) return auth.response;

    const teamMembers = await prisma.user.findMany({
      where: {
        role: {
          in: [
            "SALES",
            "SALES_EXECUTIVE",
            "AGENT",
            "STAFF",
            "ADMIN",
            "SUPER_ADMIN",
            "MANAGER",
            "Sales",
            "Agent",
            "Staff",
            "Admin",
          ],
        },
        status: { not: "ARCHIVED" },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      users: teamMembers,
      assignees: teamMembers,
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
