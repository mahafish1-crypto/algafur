import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { parseSubmittedAnswers } from "@/lib/youtube-leads";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "youtube_leads:view");
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("formId");
    const campaign = searchParams.get("campaign");
    const source = searchParams.get("source");
    const status = searchParams.get("status");
    const assignedToId = searchParams.get("assignedToId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (formId && formId !== "ALL") {
      where.formId = formId;
    }
    if (campaign && campaign !== "ALL") {
      where.campaignName = campaign;
    }
    if (source && source !== "ALL") {
      where.leadSource = source;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (assignedToId && assignedToId !== "ALL") {
      where.assignedToId = assignedToId === "UNASSIGNED" ? null : assignedToId;
    }

    if (dateFrom || dateTo) {
      const createdAtFilter: Record<string, Date> = {};
      if (dateFrom) {
        const dFrom = new Date(dateFrom);
        if (!Number.isNaN(dFrom.getTime())) {
          createdAtFilter.gte = dFrom;
        }
      }
      if (dateTo) {
        const dTo = new Date(dateTo);
        if (!Number.isNaN(dTo.getTime())) {
          dTo.setHours(23, 59, 59, 999);
          createdAtFilter.lte = dTo;
        }
      }
      if (Object.keys(createdAtFilter).length > 0) {
        where.createdAt = createdAtFilter;
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { submissionCode: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { campaignName: { contains: q, mode: "insensitive" } },
        { formTitle: { contains: q, mode: "insensitive" } },
        { interestedIn: { contains: q, mode: "insensitive" } },
      ];
    }

    const [submissions, forms, staffUsers] = await Promise.all([
      prisma.leadFormSubmission.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.leadForm.findMany({
        select: { id: true, slug: true, title: true, campaignName: true },
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

    const serialized = submissions.map((s) => ({
      ...s,
      answers: parseSubmittedAnswers(s.answersJson),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      submissions: serialized,
      forms,
      staffUsers,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch lead responses";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

