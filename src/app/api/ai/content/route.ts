import { NextRequest, NextResponse } from "next/server";
import { generateMarketingContent, ContentGenerationOptions } from "@/lib/ai-provider";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body: ContentGenerationOptions = await req.json();

    const result = await generateMarketingContent(body);

    await logAudit({
      userId: session?.id || null,
      action: "GENERATE_AI_CONTENT",
      entity: "MarketingStudio",
      details: {
        packageTitle: body.packageTitle,
        language: body.language,
        provider: result.provider,
      },
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

