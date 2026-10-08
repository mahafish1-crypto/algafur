import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

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
      where.name = { contains: search, mode: "insensitive" };
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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    // 1. Handle multipart/form-data (File Upload from Computer)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const category = (formData.get("category") as string) || "MARKETING";
      const customName = (formData.get("name") as string) || "";

      if (!file) {
        return NextResponse.json({ error: "No file was uploaded" }, { status: 400 });
      }

      // Validate allowed mime types
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file format. Only JPG, PNG, and WEBP images are supported." },
          { status: 400 }
        );
      }

      // Size limit: 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File exceeds 10MB limit." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString("base64");
      const base64DataUri = `data:${file.type};base64,${base64String}`;

      const originalName = customName || file.name || "Uploaded Image";
      const fileExt = path.extname(file.name) || ".jpg";
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;

      let localUrl: string | null = null;
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, uniqueFilename);
        fs.writeFileSync(filePath, buffer);
        localUrl = `/uploads/${uniqueFilename}`;
      } catch (err) {
        console.warn("Could not write to local filesystem (expected in read-only/serverless):", err);
      }

      // Create record in database
      const media = await prisma.media.create({
        data: {
          name: originalName,
          category,
          url: localUrl || `/api/media/placeholder`, // placeholder before getting id
          data: base64DataUri,
          fileType: file.type,
          fileSize: file.size,
          dimensions: null,
        },
      });

      // If local filesystem was not writable, set URL to streaming endpoint with assigned ID
      if (!localUrl) {
        await prisma.media.update({
          where: { id: media.id },
          data: { url: `/api/media/${media.id}/file` },
        });
        media.url = `/api/media/${media.id}/file`;
      }

      await logAudit({
        userId: session.id,
        action: "UPLOAD_MEDIA_FILE",
        entity: "Media",
        entityId: media.id,
        details: { name: originalName, category, size: file.size, url: media.url },
      });

      return NextResponse.json({ success: true, media });
    }

    // 2. Handle JSON request (URL or external assets)
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
      userId: session.id,
      action: "UPLOAD_MEDIA_URL",
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
