import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { parseFormQuestions, sanitizeTextValue } from "@/lib/youtube-leads";

export const dynamic = "force-dynamic";

function slugifyFormName(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "youtube_leads:view");
    if (!auth.authorized) return auth.response;

    const { id } = await context.params;
    const form = await prisma.leadForm.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        _count: { select: { submissions: true } },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      form: {
        ...form,
        questions: parseFormQuestions(form.questionsJson),
        submissionsCount: form._count.submissions,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch form";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "youtube_leads:edit");
    if (!auth.authorized) return auth.response;

    const { id } = await context.params;
    const existing = await prisma.leadForm.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const body = await req.json();

    const dataToUpdate: Record<string, unknown> = {};

    if (body.title !== undefined) {
      const cleanTitle = sanitizeTextValue(body.title, 160);
      if (!cleanTitle || cleanTitle.length < 3) {
        return NextResponse.json(
          { error: "Form title must be at least 3 characters." },
          { status: 400 }
        );
      }
      dataToUpdate.title = cleanTitle;
    }

    if (body.slug !== undefined && !existing.isDefault) {
      const cleanSlug = slugifyFormName(String(body.slug));
      if (cleanSlug && cleanSlug !== existing.slug) {
        const collision = await prisma.leadForm.findUnique({
          where: { slug: cleanSlug },
          select: { id: true },
        });
        if (collision && collision.id !== existing.id) {
          return NextResponse.json(
            { error: `URL slug "${cleanSlug}" is already in use by another form.` },
            { status: 400 }
          );
        }
        dataToUpdate.slug = cleanSlug;
      }
    }

    if (body.description !== undefined) {
      dataToUpdate.description = sanitizeTextValue(body.description, 1000) || null;
    }

    if (body.campaignName !== undefined) {
      dataToUpdate.campaignName = sanitizeTextValue(body.campaignName, 150) || null;
    }

    if (body.packageId !== undefined) {
      const pkgId = body.packageId ? String(body.packageId).trim() : null;
      dataToUpdate.packageId = pkgId;
      if (pkgId) {
        const pkg = await prisma.package.findUnique({
          where: { id: pkgId },
          select: { name: true },
        });
        dataToUpdate.packageName = pkg?.name || null;
      } else {
        dataToUpdate.packageName = null;
      }
    }

    if (body.successTitle !== undefined) {
      dataToUpdate.successTitle =
        sanitizeTextValue(body.successTitle, 200) ||
        "Jazakallah Khair! Your Enquiry Has Been Received.";
    }

    if (body.successMessage !== undefined) {
      dataToUpdate.successMessage =
        sanitizeTextValue(body.successMessage, 600) ||
        "Our Hajj & Umrah advisor will contact you shortly on your mobile/WhatsApp number.";
    }

    if (body.submitButtonText !== undefined) {
      dataToUpdate.submitButtonText =
        sanitizeTextValue(body.submitButtonText, 80) || "Submit Enquiry";
    }

    if (body.showLogo !== undefined) {
      dataToUpdate.showLogo = Boolean(body.showLogo);
    }

    if (body.status !== undefined) {
      dataToUpdate.status =
        body.status === "DRAFT"
          ? "DRAFT"
          : body.status === "ARCHIVED"
          ? "ARCHIVED"
          : "PUBLISHED";
    }

    if (body.isActive !== undefined) {
      dataToUpdate.isActive = Boolean(body.isActive);
    }

    if (Array.isArray(body.questions)) {
      if (body.questions.length === 0) {
        return NextResponse.json(
          { error: "Form must contain at least one question." },
          { status: 400 }
        );
      }
      const normalizedQuestions = parseFormQuestions(
        JSON.stringify(body.questions)
      );
      dataToUpdate.questionsJson = JSON.stringify(normalizedQuestions);
      dataToUpdate.version = existing.version + 1;
    }

    if (body.settings !== undefined && typeof body.settings === "object") {
      dataToUpdate.settingsJson = JSON.stringify(body.settings);
    }

    const updated = await prisma.leadForm.update({
      where: { id: existing.id },
      data: dataToUpdate,
      include: {
        _count: { select: { submissions: true } },
      },
    });

    await logAudit({
      userId: auth.session.id,
      action: "UPDATE_LEAD_FORM",
      entity: "LeadForm",
      entityId: updated.id,
      details: {
        slug: updated.slug,
        title: updated.title,
        status: updated.status,
        isActive: updated.isActive,
        version: updated.version,
      },
    });

    try {
      revalidatePath("/youtube-lead");
      revalidatePath(`/lead/${existing.slug}`);
      revalidatePath(`/lead/${updated.slug}`);
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      form: {
        ...updated,
        questions: parseFormQuestions(updated.questionsJson),
        submissionsCount: updated._count.submissions,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update form";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "youtube_leads:delete");
    if (!auth.authorized) return auth.response;

    const { id } = await context.params;
    const existing = await prisma.leadForm.findUnique({
      where: { id },
      include: { _count: { select: { submissions: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (existing.isDefault || existing.slug === "youtube-lead") {
      return NextResponse.json(
        {
          error:
            "The default YouTube Lead Form cannot be deleted. You can unpublish or edit its questions instead.",
        },
        { status: 400 }
      );
    }

    if (existing._count.submissions > 0) {
      // Preserve historical submissions by unpublishing/archiving instead of hard delete
      const archived = await prisma.leadForm.update({
        where: { id: existing.id },
        data: { status: "ARCHIVED", isActive: false },
      });
      return NextResponse.json({
        success: true,
        archived: true,
        message: `Form had ${existing._count.submissions} historical responses and was safely archived & unpublished.`,
        form: archived,
      });
    }

    await prisma.leadForm.delete({ where: { id: existing.id } });

    await logAudit({
      userId: auth.session.id,
      action: "DELETE_LEAD_FORM",
      entity: "LeadForm",
      entityId: existing.id,
      details: { slug: existing.slug, title: existing.title },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete form";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

