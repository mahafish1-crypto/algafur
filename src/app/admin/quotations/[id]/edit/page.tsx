import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";
import { getQuotationFormOptions } from "@/lib/quotations-server";
import QuotationFormClient from "@/components/admin/QuotationFormClient";

export const metadata = {
  title: "Edit Quotation | AL GAFUR Admin",
  description: "Update passenger counts, child/infant pricing, and discount options.",
};

export const dynamic = "force-dynamic";

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { allowed, session } = await verifyModuleAccess("quotations");
  if (!allowed) return <AccessDeniedView moduleKey="quotations" session={session} />;

  const { id } = await params;

  const [quotation, { packages, customers, leads }] = await Promise.all([
    prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        lead: true,
        package: true,
      },
    }),
    getQuotationFormOptions(),
  ]);

  if (!quotation) {
    notFound();
  }

  return (
    <QuotationFormClient
      packages={packages}
      customers={customers}
      leads={leads}
      initialQuotation={JSON.parse(JSON.stringify(quotation))}
    />
  );
}
