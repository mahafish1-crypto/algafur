import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Attempt local file cleanup if stored locally
    if (media.url && media.url.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", media.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        console.warn("Could not remove local file:", e);
      }
    }

    await prisma.media.delete({
      where: { id },
    });

    await logAudit({
      userId: session.id,
      action: "DELETE_MEDIA",
      entity: "Media",
      entityId: id,
      details: { name: media.name, url: media.url },
    });

    return NextResponse.json({ success: true, message: "Media deleted successfully" });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

