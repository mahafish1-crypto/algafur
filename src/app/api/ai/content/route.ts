import { NextRequest, NextResponse } from "next/server";
import { generateMarketingContent, ContentGenerationOptions } from "@/lib/ai-provider";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:ai_studio");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const body: ContentGenerationOptions = await req.json();

    const result = await generateMarketingContent(body);

    await logAudit({
      userId: session.id,
      action: "GENERATE_AI_CONTENT",
      entity: "MarketingStudio",
      details: {
        packageTitle: body.packageTitle,
        language: body.language,
        provider: result.provider,
        error: result.error || null,
      },
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
