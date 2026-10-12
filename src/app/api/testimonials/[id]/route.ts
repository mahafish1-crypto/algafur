import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "manage:settings");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      city,
      packageTitle,
      rating,
      reviewText,
      photo,
      videoUrl,
      isFeatured,
      status,
    } = body;

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        customerName:
          customerName !== undefined
            ? String(customerName).trim()
            : existing.customerName,
        city: city !== undefined ? String(city).trim() : existing.city,
        packageTitle:
          packageTitle !== undefined
            ? String(packageTitle).trim()
            : existing.packageTitle,
        rating:
          rating !== undefined
            ? Math.min(5, Math.max(0, Number(rating)))
            : existing.rating,
        reviewText:
          reviewText !== undefined
            ? String(reviewText).trim()
            : existing.reviewText,
        photo:
          photo !== undefined
            ? photo
              ? String(photo).trim()
              : null
            : existing.photo,
        videoUrl:
          videoUrl !== undefined
            ? videoUrl
              ? String(videoUrl).trim()
              : null
            : existing.videoUrl,
        isFeatured:
          typeof isFeatured === "boolean" ? isFeatured : existing.isFeatured,
        status:
          status === "DRAFT" || status === "PUBLISHED"
            ? status
            : existing.status,
      },
    });

    await logAudit({
      userId: session.id,
      action: "UPDATE_TESTIMONIAL",
      entity: "Testimonial",
      entityId: id,
      details: { customerName: updated.customerName, status: updated.status },
    });

    try {
      revalidateTag("testimonials");
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, testimonial: updated });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "manage:settings");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    await prisma.testimonial.delete({ where: { id } });

    await logAudit({
      userId: session.id,
      action: "DELETE_TESTIMONIAL",
      entity: "Testimonial",
      entityId: id,
      details: { customerName: existing.customerName },
    });

    try {
      revalidateTag("testimonials");
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

