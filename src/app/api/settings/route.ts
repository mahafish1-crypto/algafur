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

      upsertOperations.push(
        prisma.siteSetting.upsert({
          where: { key },
          update: { value: incomingVal },
          create: {
            key,
            value: incomingVal,
            category: key.split("_")[0] || "GENERAL",
          },
        })
      );
    }

    if (upsertOperations.length > 0) {
      await prisma.$transaction(upsertOperations);
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
