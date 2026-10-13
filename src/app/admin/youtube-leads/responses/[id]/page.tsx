import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { parseSubmittedAnswers } from "@/lib/youtube-leads";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";
import YouTubeLeadDetailClient from "./YouTubeLeadDetailClient";

export const dynamic = "force-dynamic";

export default async function YouTubeLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { allowed, session } = await verifyModuleAccess("youtube_leads");
  if (!allowed) {
    return <AccessDeniedView moduleKey="youtube_leads" session={session} />;
  }

  const { id } = await params;

  const [submission, staffUsers, activityLogs] = await Promise.all([
    prisma.leadFormSubmission.findUnique({
      where: { id },
      include: {
        form: {
          select: {
            id: true,
            title: true,
            slug: true,
            packageName: true,
          },
        },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        status: "ACTIVE",
        role: {
          in: ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_EXECUTIVE", "MARKETING"],
        },
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    }),
    prisma.auditLog.findMany({
      where: {
        entity: "LeadFormSubmission",
        entityId: id,
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    }),
  ]);

  if (!submission) {
    notFound();
  }

  const serializedSubmission = {
    id: submission.id,
    submissionCode: submission.submissionCode,
    formId: submission.formId,
    formTitle: submission.form?.title || submission.formTitle,
    formSlug: submission.form?.slug || submission.formSlug,
    formVersion: submission.formVersion,
    packageName: submission.form?.packageName || null,
    fullName: submission.name || "Unnamed Pilgrim",
    phone: submission.phone || "",
    whatsapp: submission.whatsapp || "",
    email: submission.email || "",
    city: submission.city || "",
    interestedIn: submission.interestedIn || "",
    travelMonth: submission.travelMonth || "",
    travellersCount: submission.travellersCount,
    message: submission.notes || "",
    consent: true,
    answers: parseSubmittedAnswers(submission.answersJson),
    leadSource: submission.leadSource,
    campaignName: submission.campaignName || "",
    utmSource: submission.utmSource || "",
    utmMedium: submission.utmMedium || "",
    utmCampaign: submission.utmCampaign || "",
    utmContent: submission.utmContent || "",
    utmTerm: submission.utmTerm || "",
    videoId: submission.videoId || "",
    videoUrl: submission.videoUrl || "",
    landingPage: submission.landingPage || "",
    referrer: submission.referrer || "",
    status: submission.status,
    assignedToId: submission.assignedToId || "",
    assignedToName: submission.assignedTo?.name || null,
    followUpDate: submission.followUpDate || "",
    internalNotes: submission.internalNotes || submission.followUpNotes || "",
    leadScore: submission.leadScore ?? 50,
    priority: submission.priority || "WARM",
    scoreExplanation: submission.scoreExplanation || "",
    priorityOverride: submission.priorityOverride || null,
    priorityOverrideReason: submission.priorityOverrideReason || null,
    travelTimeline: submission.travelTimeline || "",
    address: submission.address || "",
    state: submission.state || "",
    district: submission.district || "",
    postalCode: submission.postalCode || "",
    latitude: submission.latitude ?? null,
    longitude: submission.longitude ?? null,
    locationSource: submission.locationSource || "MANUAL",
    approxDepartureDate: submission.approxDepartureDate || "",
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString(),
  };

  const serializedLogs = activityLogs.map((l) => ({
    id: l.id,
    action: l.action,
    createdAt: l.createdAt.toISOString(),
    userName: l.user?.name || "Admin",
    userRole: l.user?.role || "",
  }));

  return (
    <YouTubeLeadDetailClient
      initialSubmission={serializedSubmission}
      staffUsers={staffUsers}
      initialLogs={serializedLogs}
    />
  );
}
