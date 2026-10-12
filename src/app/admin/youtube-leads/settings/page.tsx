import React from "react";
import prisma from "@/lib/db";
import { ensureDefaultYouTubeForm } from "@/lib/youtube-leads";
import FormSettingsClient from "./FormSettingsClient";

export const dynamic = "force-dynamic";

export default async function YouTubeFormSettingsPage() {
  await ensureDefaultYouTubeForm();

  const forms = await prisma.leadForm.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { submissions: true } },
    },
  });

  const serializedForms = forms.map((f) => ({
    id: f.id,
    title: f.title,
    slug: f.slug,
    description: f.description || "",
    campaignName: f.campaignName || "",
    packageName: f.packageName || null,
    status: f.status,
    isActive: f.isActive,
    isDefault: f.isDefault,
    successTitle: f.successTitle,
    successMessage: f.successMessage,
    submitButtonText: f.submitButtonText,
    showLogo: f.showLogo,
    version: f.version,
    submissionsCount: f._count.submissions,
    updatedAt: f.updatedAt.toISOString(),
  }));

  return <FormSettingsClient initialForms={serializedForms} />;
}

