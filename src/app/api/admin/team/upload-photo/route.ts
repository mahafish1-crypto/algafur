import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";
import {
  getSiteSettings,
  SITE_SETTINGS_CACHE_TAG,
} from "@/lib/settings";
import {
  TEAM_SETTING_KEY,
  parseTeamProfilesFromSettings,
  TeamMemberProfile,
} from "@/lib/team-data";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

/**
 * Attempt to upload to Supabase Storage REST API if credentials exist.
 * Returns public URL if successful, otherwise null.
 */
async function tryUploadToSupabaseStorage(
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
  const bucket = "team-photos";
  const uploadEndpoint = `${cleanUrl}/storage/v1/object/${bucket}/${fileName}`;

  try {
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

    // Try fallback bucket 'public-media'
    const fallbackEndpoint = `${cleanUrl}/storage/v1/object/public-media/${fileName}`;
    const fallbackRes = await fetch(fallbackEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apiKey: supabaseKey,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: new Uint8Array(buffer),
    });

    if (fallbackRes.ok) {
      return `${cleanUrl}/storage/v1/object/public/public-media/${fileName}`;
    }

    console.warn(
      `Supabase storage upload failed with status ${res.status}. Falling back to database media store.`
    );
    return null;
  } catch (err) {
    console.warn("Supabase storage fetch failed, using database media fallback:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, [
      "manage:settings",
      "manage:media",
    ]);
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const memberId = (formData.get("memberId") as string) || null;
    const leaderKey = (formData.get("leaderKey") as string) || null;
    const customName = (formData.get("name") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "No image file was provided for upload." },
        { status: 400 }
      );
    }

    // 1. File Type Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Only JPG, PNG, and WEBP photographs are allowed.",
        },
        { status: 400 }
      );
    }

    // 2. File Size Validation (Max 3MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `Photograph exceeds the 3MB limit (uploaded size: ${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)}MB).`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64DataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    const originalName =
      customName ||
      file.name.replace(/\.[^/.]+$/, "") ||
      "Team Member Photo";
    const fileExt = path.extname(file.name) || ".jpg";
    const uniqueFileName = `team-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}${fileExt}`;

    // 3. Attempt Supabase Storage
    let photoUrl: string | null = await tryUploadToSupabaseStorage(
      buffer,
      uniqueFileName,
      file.type
    );

    // 4. Try local write to public/uploads (works in local dev / persistent disk)
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
      // In serverless / read-only filesystem, local disk write will be skipped
    }

    // 5. Store record in Prisma Media for persistence & streaming fallback
    const mediaRecord = await prisma.media.create({
      data: {
        name: originalName,
        category: "TEAM",
        url: photoUrl || localDiskUrl || "/api/media/placeholder",
        data: base64DataUri,
        fileType: file.type,
        fileSize: file.size,
        dimensions: null,
      },
      select: { id: true, url: true },
    });

    // If Supabase and local disk were not available, use the streaming route
    if (!photoUrl && !localDiskUrl) {
      photoUrl = `/api/media/${mediaRecord.id}/file`;
      await prisma.media.update({
        where: { id: mediaRecord.id },
        data: { url: photoUrl },
        select: { id: true },
      });
    } else if (!photoUrl && localDiskUrl) {
      photoUrl = localDiskUrl;
    }

    // 6. If memberId is specified, update member photo in team settings directly
    let updatedMember: TeamMemberProfile | null = null;
    if (memberId && photoUrl) {
      const settings = await getSiteSettings();
      const currentProfiles = parseTeamProfilesFromSettings(settings);
      const targetIdx = currentProfiles.findIndex((p) => p.id === memberId);

      if (targetIdx >= 0) {
        currentProfiles[targetIdx] = {
          ...currentProfiles[targetIdx],
          photo: photoUrl,
        };

        await prisma.siteSetting.upsert({
          where: { key: TEAM_SETTING_KEY },
          update: {
            value: JSON.stringify(currentProfiles),
            category: "TEAM",
          },
          create: {
            key: TEAM_SETTING_KEY,
            value: JSON.stringify(currentProfiles),
            category: "TEAM",
          },
        });

        updatedMember = currentProfiles[targetIdx];

        // Also sync leader setting keys if applicable
        if (
          memberId === "team-director-1" ||
          updatedMember.name.toLowerCase().includes("mudassir")
        ) {
          await prisma.siteSetting.upsert({
            where: { key: "about_leader_1_photo" },
            update: { value: photoUrl, category: "ABOUT" },
            create: { key: "about_leader_1_photo", value: photoUrl, category: "ABOUT" },
          });
        } else if (
          memberId === "team-guide-1" ||
          updatedMember.name.toLowerCase().includes("asrar")
        ) {
          await prisma.siteSetting.upsert({
            where: { key: "about_leader_2_photo" },
            update: { value: photoUrl, category: "ABOUT" },
            create: { key: "about_leader_2_photo", value: photoUrl, category: "ABOUT" },
          });
        } else if (
          memberId === "team-director-2" ||
          updatedMember.name.toLowerCase().includes("zahir")
        ) {
          await prisma.siteSetting.upsert({
            where: { key: "about_leader_3_photo" },
            update: { value: photoUrl, category: "ABOUT" },
            create: { key: "about_leader_3_photo", value: photoUrl, category: "ABOUT" },
          });
        }
      }
    }

    // 7. If leaderKey is specified (e.g. from site settings leader photo upload)
    if (leaderKey && photoUrl) {
      await prisma.siteSetting.upsert({
        where: { key: leaderKey },
        update: { value: photoUrl, category: "ABOUT" },
        create: { key: leaderKey, value: photoUrl, category: "ABOUT" },
      });
    }

    // 8. Log audit
    await logAudit({
      userId: session.id,
      action: "UPLOAD_TEAM_PHOTO",
      entity: "TeamMemberPhoto",
      entityId: memberId || mediaRecord.id,
      details: {
        fileName: file.name,
        size: file.size,
        mimeType: file.type,
        photoUrl,
        memberId,
      },
    });

    // 9. Revalidate cache tags and routes
    try {
      revalidateTag(SITE_SETTINGS_CACHE_TAG);
      revalidatePath("/about");
      revalidatePath("/admin/team");
      revalidatePath("/admin/settings");
      revalidatePath("/");
    } catch {
      // Revalidation warning suppression
    }

    return NextResponse.json({
      success: true,
      url: photoUrl,
      mediaId: mediaRecord.id,
      memberId: memberId || undefined,
      member: updatedMember || undefined,
      message: "Photograph uploaded and saved successfully.",
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("Team photo upload error:", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

