import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  SECRET_SETTING_KEYS,
  SITE_SETTINGS_CACHE_TAG,
  maskSecretSetting,
} from "@/lib/settings";
import { validateAndExtractMetaPixel } from "@/lib/meta-pixel";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const settings = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      if (SECRET_SETTING_KEYS.includes(s.key)) {
        settingsMap[s.key] = s.value ? maskSecretSetting(s.value) : "";
      } else {
        settingsMap[s.key] = s.value;
      }
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
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 401 });
    }

    const body: Record<string, string> = await req.json();

    // 1. Meta Pixel Code Validation & Extraction
    if ("meta_pixel_code" in body) {
      const rawCode = String(body.meta_pixel_code || "").trim();
      if (rawCode) {
        const validation = validateAndExtractMetaPixel(rawCode);
        if (!validation.isValid) {
          return NextResponse.json(
            { error: validation.error || "Invalid Meta Pixel code snippet provided." },
            { status: 400 }
          );
        }
        body.meta_pixel_id = validation.pixelId || "";
        body.meta_pixel_updated_at = new Date().toISOString();
      } else {
        // Code cleared: automatically clear pixel ID, disable tracking, and update timestamp
        body.meta_pixel_id = "";
        body.meta_pixel_enabled = "false";
        body.meta_pixel_updated_at = new Date().toISOString();
      }
    } else if ("meta_pixel_enabled" in body) {
      body.meta_pixel_updated_at = new Date().toISOString();
    }

    const keys = Object.keys(body);
    const upsertOperations = [];

    for (const key of keys) {
      const incomingVal = String(body[key] ?? "");

      // For sensitive keys like API keys: if incoming value is masked, do not overwrite the real stored secret
      if (SECRET_SETTING_KEYS.includes(key)) {
        if (incomingVal.includes("••••") || incomingVal.includes("****")) {
          // Keep existing secret untouched
          continue;
        }
      }

      const category = key.startsWith("meta_pixel")
        ? "TRACKING"
        : (key.split("_")[0] || "GENERAL");

      upsertOperations.push(
        prisma.siteSetting.upsert({
          where: { key },
          update: { value: incomingVal, category },
          create: {
            key,
            value: incomingVal,
            category,
          },
        })
      );
    }

    if (upsertOperations.length > 0) {
      await prisma.$transaction(upsertOperations);
    }

    // Synchronize team_directory_json if leader photos were updated
    const hasLeaderUpdates = keys.some((k) => k.startsWith("about_leader_"));
    if (hasLeaderUpdates) {
      try {
        const teamSetting = await prisma.siteSetting.findUnique({
          where: { key: "team_directory_json" },
        });
        if (teamSetting?.value) {
          const profiles = JSON.parse(teamSetting.value);
          if (Array.isArray(profiles)) {
            let changed = false;
            for (const p of profiles) {
              if (
                (p.id === "team-director-1" || p.name?.toLowerCase().includes("mudassir")) &&
                body.about_leader_1_photo !== undefined
              ) {
                p.photo = body.about_leader_1_photo;
                changed = true;
              } else if (
                (p.id === "team-guide-1" || p.name?.toLowerCase().includes("asrar")) &&
                body.about_leader_2_photo !== undefined
              ) {
                p.photo = body.about_leader_2_photo;
                changed = true;
              } else if (
                (p.id === "team-director-2" || p.name?.toLowerCase().includes("zahir")) &&
                body.about_leader_3_photo !== undefined
              ) {
                p.photo = body.about_leader_3_photo;
                changed = true;
              }
            }
            if (changed) {
              await prisma.siteSetting.update({
                where: { key: "team_directory_json" },
                data: { value: JSON.stringify(profiles) },
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not sync team_directory_json:", err);
      }
    }

    await logAudit({
      userId: session?.id || null,
      action: "UPDATE_SITE_SETTINGS",
      entity: "SiteSetting",
      details: { updatedKeys: keys },
    });

    try {
      revalidateTag(SITE_SETTINGS_CACHE_TAG);
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/contact");
      revalidatePath("/packages");
    } catch (e) {
      console.warn("revalidatePath warning:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
