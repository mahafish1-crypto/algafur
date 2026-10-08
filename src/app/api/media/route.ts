import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category;
    }
    if (search) {
      where.name = { contains: search };
    }

    const mediaList = await prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, media: mediaList });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();

    const { name, category, url, fileType, fileSize, dimensions } = body;

    if (!name || !url) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
    }

    const media = await prisma.media.create({
      data: {
        name,
        category: category || "MARKETING",
        url,
        fileType: fileType || "image/jpeg",
        fileSize: Number(fileSize) || 0,
        dimensions: dimensions || null,
      },
    });

    await logAudit({
      userId: session?.id || null,
      action: "UPLOAD_MEDIA",
      entity: "Media",
      entityId: media.id,
      details: { name, category, url },
    });

    return NextResponse.json({ success: true, media });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

