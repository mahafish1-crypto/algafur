import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { hasUserPermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

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
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        {
          error:
            "Authentication required. Please sign in or register to submit your pilgrimage review.",
        },
        { status: 401 }
      );
    }

    const isAdmin =
      session.role === "SUPER_ADMIN" ||
      session.role === "ADMIN" ||
      hasUserPermission(session, "manage:settings");

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

    if (
      !customerName ||
      !String(customerName).trim() ||
      !reviewText ||
      !String(reviewText).trim()
    ) {
      return NextResponse.json(
        { error: "Pilgrim Name and Testimonial Review Text are required." },
        { status: 400 }
      );
    }

    // Admins can set any status/featured flag directly; public submissions are queued as DRAFT
    const finalStatus = isAdmin
      ? status === "DRAFT"
        ? "DRAFT"
        : "PUBLISHED"
      : "DRAFT";
    const finalIsFeatured = isAdmin ? Boolean(isFeatured) : false;

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName: String(customerName).trim(),
        city: String(city || "").trim(),
        packageTitle: String(packageTitle || "").trim(),
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        reviewText: String(reviewText).trim(),
        photo: photo ? String(photo).trim() : null,
        videoUrl: videoUrl ? String(videoUrl).trim() : null,
        isFeatured: finalIsFeatured,
        status: finalStatus,
      },
    });

    if (isAdmin && session) {
      await logAudit({
        userId: session.id,
        action: "CREATE_TESTIMONIAL",
        entity: "Testimonial",
        entityId: testimonial.id,
        details: {
          customerName: testimonial.customerName,
          status: testimonial.status,
          isFeatured: testimonial.isFeatured,
        },
      });
    }

    try {
      revalidateTag("testimonials");
      revalidatePath("/");
      revalidatePath("/reviews");
      revalidatePath("/testimonials");
      revalidatePath("/admin/testimonials");
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      testimonial,
      message: isAdmin
        ? "Testimonial published successfully."
        : "Alhamdulillah! Thank you for sharing your experience. Your review has been submitted for moderation.",
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
