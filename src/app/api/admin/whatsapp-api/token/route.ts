import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { revalidateTag } from "next/cache";
import {
  SITE_SETTINGS_CACHE_TAG,
  getWhatsAppApiKey,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/settings";
import { buildCanonicalUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.role !== "SUPER_ADMIN" &&
        session.role !== "ADMIN" &&
        session.role !== "MANAGER")
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      );
    }

    const apiKey = await getWhatsAppApiKey();
    const endpointUrl = buildCanonicalUrl("/api/v1/whatsapp/summary");
    const webhookUrl = `${endpointUrl}?api_key=${apiKey}`;

    return NextResponse.json({
      success: true,
      apiKey,
      endpointUrl,
      webhookUrl,
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized access. Only Admins can regenerate the WhatsApp API key.",
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "regenerate";

    if (action !== "regenerate" && action !== "save") {
      return NextResponse.json(
        { success: false, error: "Invalid action. Supported: regenerate, save" },
        { status: 400 }
      );
    }

    let newKey = "";
    if (action === "regenerate") {
      // Generate a clean, cryptographically secure 32-character hex key prefixed with alg_live_wa_
      const randomBytes = crypto.randomBytes(16).toString("hex");
      newKey = `alg_live_wa_${randomBytes}`;
    } else {
      newKey = String(body.apiKey || "").trim();
      if (!newKey || newKey.length < 12) {
        return NextResponse.json(
          {
            success: false,
            error: "API key must be at least 12 characters long.",
          },
          { status: 400 }
        );
      }
    }

    // Persist to SiteSetting
    await prisma.siteSetting.upsert({
      where: { key: "whatsapp_api_key" },
      update: {
        value: newKey,
        category: "WHATSAPP",
      },
      create: {
        key: "whatsapp_api_key",
        value: newKey,
        category: "WHATSAPP",
      },
    });

    try {
      revalidateTag(SITE_SETTINGS_CACHE_TAG);
    } catch {
      // ignore
    }

    await logAudit({
      userId: session.id,
      action: "UPDATE",
      entity: "SiteSetting",
      entityId: "whatsapp_api_key",
      details: {
        action: action === "regenerate" ? "REGENERATE_WHATSAPP_API_KEY" : "CUSTOM_WHATSAPP_API_KEY",
        keyPrefix: newKey.substring(0, 14) + "...",
      },
    }).catch(() => null);

    const endpointUrl = buildCanonicalUrl("/api/v1/whatsapp/summary");
    const webhookUrl = `${endpointUrl}?api_key=${newKey}`;

    return NextResponse.json({
      success: true,
      message:
        action === "regenerate"
          ? "WhatsApp API Secret Key regenerated successfully."
          : "WhatsApp API Secret Key saved successfully.",
      apiKey: newKey,
      endpointUrl,
      webhookUrl,
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

