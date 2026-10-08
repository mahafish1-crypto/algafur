import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { type, description } = await req.json();
    const session = await getSession();

    const activity = await prisma.leadActivity.create({
      data: {
        leadId: resolvedParams.id,
        userId: session?.id || null,
        type: type || "NOTE",
        description,
      },
    });

    return NextResponse.json({ success: true, activity });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

