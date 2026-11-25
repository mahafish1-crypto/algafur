import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";
import QuotationViewClient from "@/components/admin/QuotationViewClient";

export const metadata = {
  title: "View Quotation | AL GAFUR Admin",
  description: "Official Hajj & Umrah Tour Estimate & Printable PDF Sheet.",
};

export const dynamic = "force-dynamic";

export default async function ViewQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { allowed, session } = await verifyModuleAccess("quotations");
  if (!allowed) return <AccessDeniedView moduleKey="quotations" session={session} />;

  const { id } = await params;

  const [quotation, siteSettings] = await Promise.all([
    prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        lead: true,
        package: {
          include: {
            inclusions: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    getSiteSettings(),
  ]);

  if (!quotation) {
    notFound();
  }

  return (
    <QuotationViewClient
      quotation={JSON.parse(JSON.stringify(quotation))}
      siteSettings={siteSettings}
    />
  );
}
