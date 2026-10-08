import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body: Record<string, string> = await req.json();

    const keys = Object.keys(body);
    for (const key of keys) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(body[key]) },
        create: {
          key,
          value: String(body[key]),
          category: key.split("_")[0] || "GENERAL",
        },
      });
    }

    await logAudit({
      userId: session?.id || null,
      action: "UPDATE_SITE_SETTINGS",
      entity: "SiteSetting",
      details: { updatedKeys: keys },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

