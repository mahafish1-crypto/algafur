import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import {
  DEFAULT_YOUTUBE_FORM_QUESTIONS,
  ensureDefaultYouTubeForm,
  parseFormQuestions,
  sanitizeTextValue,
} from "@/lib/youtube-leads";

export const dynamic = "force-dynamic";

function slugifyFormName(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "youtube_leads:view");
    if (!auth.authorized) return auth.response;

    await ensureDefaultYouTubeForm();

    const [forms, packages, staffUsers] = await Promise.all([
      prisma.leadForm.findMany({
        include: {
          _count: {
            select: { submissions: true },
          },
        },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      }),
      prisma.package.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, name: true, slug: true, type: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: {
          status: "ACTIVE",
          role: { notIn: ["CUSTOMER", "AGENT"] },
        },
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const serializedForms = forms.map((f) => ({
      ...f,
      questions: parseFormQuestions(f.questionsJson),
      submissionsCount: f._count.submissions,
    }));

    return NextResponse.json({
      success: true,
      forms: serializedForms,
      packages,
      staffUsers,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load forms";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "youtube_leads:create");
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const title = sanitizeTextValue(body.title, 160);
    if (!title || title.length < 3) {
      return NextResponse.json(
        { error: "Form title (at least 3 characters) is required." },
        { status: 400 }
      );
    }

    let slug = slugifyFormName(body.slug || title);
    if (!slug) slug = `lead-form-${Date.now()}`;

    const existingSlug = await prisma.leadForm.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const questions = Array.isArray(body.questions) && body.questions.length > 0
      ? parseFormQuestions(JSON.stringify(body.questions))
      : DEFAULT_YOUTUBE_FORM_QUESTIONS;

    let packageName: string | null = body.packageName
      ? sanitizeTextValue(body.packageName, 160)
      : null;
    const packageId: string | null = body.packageId
      ? String(body.packageId).trim() || null
      : null;

    if (packageId && !packageName) {
      const pkg = await prisma.package.findUnique({
        where: { id: packageId },
        select: { name: true },
      });
      if (pkg) packageName = pkg.name;
    }

    const created = await prisma.leadForm.create({
      data: {
        slug,
        title,
        description: sanitizeTextValue(body.description, 1000) || null,
        campaignName: sanitizeTextValue(body.campaignName, 150) || null,
        packageId,
        packageName,
        successTitle:
          sanitizeTextValue(body.successTitle, 200) ||
          "Jazakallah Khair! Your Enquiry Has Been Received.",
        successMessage:
          sanitizeTextValue(body.successMessage, 600) ||
          "Our Hajj & Umrah advisor will contact you shortly on your mobile/WhatsApp number.",
        submitButtonText:
          sanitizeTextValue(body.submitButtonText, 80) || "Submit Enquiry",
        showLogo: body.showLogo !== false,
        status: body.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
        isActive: body.isActive !== false,
        isDefault: false,
        version: 1,
        questionsJson: JSON.stringify(questions),
        settingsJson: body.settings
          ? JSON.stringify(body.settings)
          : JSON.stringify({ notifyOnSubmission: true }),
      },
    });

    await logAudit({
      userId: auth.session.id,
      action: "CREATE_LEAD_FORM",
      entity: "LeadForm",
      entityId: created.id,
      details: { slug: created.slug, title: created.title, status: created.status },
    });

    try {
      revalidatePath("/youtube-lead");
      revalidatePath(`/lead/${created.slug}`);
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      form: {
        ...created,
        questions,
        submissionsCount: 0,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create form";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

