import React from "react";
import prisma from "@/lib/db";
import {
  ensureDefaultYouTubeForm,
  parseFormQuestions,
} from "@/lib/youtube-leads";
import FormBuilderClient from "./FormBuilderClient";

export const dynamic = "force-dynamic";

export default async function YouTubeLeadFormBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ formId?: string }>;
}) {
  await ensureDefaultYouTubeForm();
  const resolvedSearch = await searchParams;

  const [forms, packages] = await Promise.all([
    prisma.leadForm.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { submissions: true } },
      },
    }),
    prisma.package.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, name: true, slug: true, type: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedForms = forms.map((f) => {
    const pkg = packages.find((p) => p.id === f.packageId);
    return {
      id: f.id,
      title: f.title,
      slug: f.slug,
      description: f.description || "",
      campaignName: f.campaignName || "",
      packageId: f.packageId || "",
      packageName: f.packageName || pkg?.name || null,
      packageSlug: pkg?.slug || null,
      status: f.status,
      isActive: f.isActive,
      isDefault: f.isDefault,
      successTitle: f.successTitle,
      successMessage: f.successMessage,
      submitButtonText: f.submitButtonText,
      showLogo: f.showLogo,
      version: f.version,
      submissionsCount: f._count.submissions,
      questions: parseFormQuestions(f.questionsJson),
      updatedAt: f.updatedAt.toISOString(),
    };
  });

  return (
    <FormBuilderClient
      initialForms={serializedForms}
      packages={packages}
      initialFormId={resolvedSearch?.formId || serializedForms[0]?.id || ""}
    />
  );
}

