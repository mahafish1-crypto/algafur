import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/avif",
];
const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12MB limit

/**
 * Uploads a package image buffer to Supabase Storage REST API.
 */
async function uploadToSupabaseStorage(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string | null> {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const cleanUrl = supabaseUrl.replace(/\/$/, "");
  const bucketCandidates = ["packages", "public-media", "team-photos"];

  for (const bucket of bucketCandidates) {
    try {
      const uploadEndpoint = `${cleanUrl}/storage/v1/object/${bucket}/${fileName}`;
      const res = await fetch(uploadEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apiKey: supabaseKey,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: new Uint8Array(buffer),
      });

      if (res.ok) {
        return `${cleanUrl}/storage/v1/object/public/${bucket}/${fileName}`;
      }
    } catch {
      // try next bucket
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:packages");
    if (!auth.authorized) return auth.response;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "PACKAGES";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file was provided for upload." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file format. Only JPG, PNG, and WEBP images are supported.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File exceeds 12MB size limit.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = path.extname(file.name) || ".jpg";
    const cleanBaseName = file.name
      .replace(fileExt, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const uniqueFileName = `pkg_${Date.now()}_${cleanBaseName}${fileExt}`;

    // 1. Try direct Supabase Storage upload
    const supabaseUrl = await uploadToSupabaseStorage(
      buffer,
      uniqueFileName,
      file.type
    );

    // 2. Try local disk upload if available
    let localDiskUrl: string | null = null;
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, uniqueFileName);
      fs.writeFileSync(filePath, buffer);
      localDiskUrl = `/uploads/${uniqueFileName}`;
    } catch {
      // serverless / read-only filesystem is normal
    }

    // 3. Fallback database media record with streaming URL
    const base64DataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
    const media = await prisma.media.create({
      data: {
        name: file.name,
        category,
        url: supabaseUrl || localDiskUrl || "/api/media/placeholder",
        data: base64DataUri,
        fileType: file.type,
        fileSize: file.size,
      },
    });

    const publicUrl =
      supabaseUrl || localDiskUrl || `/api/media/${media.id}/file`;

    // Ensure media record points to the final working URL
    if (media.url !== publicUrl) {
      await prisma.media.update({
        where: { id: media.id },
        data: { url: publicUrl },
      });
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      mediaId: media.id,
      name: file.name,
      fileSize: file.size,
    });
  } catch (error: unknown) {
    console.error("Package image upload error:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

