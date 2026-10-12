import React from "react";
import prisma from "@/lib/db";
import {
  ensureDefaultYouTubeForm,
  parseSubmittedAnswers,
} from "@/lib/youtube-leads";
import LeadResponsesClient from "./LeadResponsesClient";

export const dynamic = "force-dynamic";

export default async function YouTubeLeadResponsesPage() {
  await ensureDefaultYouTubeForm();

  const [forms, submissions, staffUsers] = await Promise.all([
    prisma.leadForm.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, slug: true, campaignName: true },
    }),
    prisma.leadFormSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      include: {
        form: { select: { id: true, title: true, slug: true, packageId: true, packageName: true } },
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
  ]);

  const serializedSubmissions = submissions.map((s) => ({
    id: s.id,
    submissionCode: s.submissionCode,
    formId: s.formId,
    formTitle: s.form?.title || s.formTitle,
    formSlug: s.form?.slug || s.formSlug,
    formVersion: s.formVersion,
    packageId: s.form?.packageId || null,
    packageName: s.form?.packageName || null,
    fullName: s.name || "Unnamed Pilgrim",
    phone: s.phone || "",
    whatsapp: s.whatsapp || "",
    email: s.email || "",
    city: s.city || "",
    interestedIn: s.interestedIn || "",
    travelMonth: s.travelMonth || "",
    travellersCount: s.travellersCount,
    message: s.notes || "",
    consent: true,
    answers: parseSubmittedAnswers(s.answersJson),
    leadSource: s.leadSource,
    campaignName: s.campaignName || "",
    utmSource: s.utmSource || "",
    utmMedium: s.utmMedium || "",
    utmCampaign: s.utmCampaign || "",
    utmContent: s.utmContent || "",
    utmTerm: s.utmTerm || "",
    videoId: s.videoId || "",
    videoUrl: s.videoUrl || "",
    landingPage: s.landingPage || "",
    referrer: s.referrer || "",
    status: s.status,
    assignedToId: s.assignedToId || "",
    assignedToName: s.assignedTo?.name || null,
    followUpDate: s.followUpDate || "",
    internalNotes: s.internalNotes || s.followUpNotes || "",
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <LeadResponsesClient
      initialSubmissions={serializedSubmissions}
      forms={forms}
      staffUsers={staffUsers}
    />
  );
}
