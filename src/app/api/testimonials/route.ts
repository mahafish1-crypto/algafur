import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, testimonials });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:settings");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const body = await req.json();
    const {
      customerName,
      city = "",
      packageTitle = "",
      rating = 5,
      reviewText,
      photo,
      videoUrl,
      isFeatured = true,
      status = "PUBLISHED",
    } = body;

    if (!customerName || !String(customerName).trim() || !reviewText || !String(reviewText).trim()) {
      return NextResponse.json(
        { error: "Pilgrim Name and Testimonial Review Text are required." },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName: String(customerName).trim(),
        city: String(city || "").trim(),
        packageTitle: String(packageTitle || "").trim(),
        rating: Math.min(5, Math.max(0, Number(rating) || 5)),
        reviewText: String(reviewText).trim(),
        photo: photo ? String(photo).trim() : null,
        videoUrl: videoUrl ? String(videoUrl).trim() : null,
        isFeatured: Boolean(isFeatured),
        status: status === "DRAFT" ? "DRAFT" : "PUBLISHED",
      },
    });

    await logAudit({
      userId: session.id,
      action: "CREATE_TESTIMONIAL",
      entity: "Testimonial",
      entityId: testimonial.id,
      details: { customerName: testimonial.customerName, status: testimonial.status },
    });

    try {
      revalidateTag("testimonials");
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, testimonial });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

