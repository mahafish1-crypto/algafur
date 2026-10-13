import React from "react";
import prisma from "@/lib/db";
import { ensureDefaultYouTubeForm } from "@/lib/youtube-leads";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";
import YouTubeLeadsOverviewClient from "./YouTubeLeadsOverviewClient";

export const dynamic = "force-dynamic";

export default async function YouTubeLeadsOverviewPage() {
  const { allowed, session } = await verifyModuleAccess("youtube_leads");
  if (!allowed) {
    return <AccessDeniedView moduleKey="youtube_leads" session={session} />;
  }

  await ensureDefaultYouTubeForm();

  const [forms, submissions] = await Promise.all([
    prisma.leadForm.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { submissions: true } },
      },
    }),
    prisma.leadFormSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 250,
      include: {
        form: { select: { id: true, title: true, slug: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    }),
  ]);

  const serializedForms = forms.map((f) => ({
    id: f.id,
    title: f.title,
    slug: f.slug,
    status: f.status,
    isActive: f.isActive,
    campaignName: f.campaignName,
    packageName: f.packageName || null,
    submissionsCount: f._count.submissions,
    updatedAt: f.updatedAt.toISOString(),
  }));

  const serializedSubmissions = submissions.map((s) => ({
    id: s.id,
    submissionCode: s.submissionCode,
    formId: s.formId,
    formTitle: s.form?.title || s.formTitle,
    formSlug: s.form?.slug || s.formSlug,
    fullName: s.name || "Unnamed Pilgrim",
    phone: s.phone || s.whatsapp || "",
    city: s.city || "",
    interestedIn: s.interestedIn || "",
    campaignName: s.campaignName || s.utmCampaign || "Direct / Unspecified",
    utmSource: s.utmSource || "",
    leadSource: s.leadSource,
    videoId: s.videoId || "",
    status: s.status,
    assignedToName: s.assignedTo?.name || null,
    followUpDate: s.followUpDate || null,
    leadScore: s.leadScore ?? 50,
    priority: s.priority || "WARM",
    scoreExplanation: s.scoreExplanation || "",
    travelTimeline: s.travelTimeline || "",
    address: s.address || "",
    locationSource: s.locationSource || "MANUAL",
    priorityOverride: s.priorityOverride || null,
    priorityOverrideReason: s.priorityOverrideReason || null,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <YouTubeLeadsOverviewClient
      forms={serializedForms}
      submissions={serializedSubmissions}
    />
  );
}

