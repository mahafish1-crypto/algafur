import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";
import InvoiceReceiptEditorClient from "@/components/admin/InvoiceReceiptEditorClient";

export const metadata = {
  title: "Booking Receipt / Invoice | AL GAFUR Admin",
  description: "Official AL-GAFUR Booking Receipt & Pilgrim Roster.",
};

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { allowed, session } = await verifyModuleAccess("invoices");
  if (!allowed) return <AccessDeniedView moduleKey="invoices" session={session} />;

  const { id } = await params;

  const [invoice, siteSettings] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        booking: {
          include: { package: true },
        },
      },
    }),
    getSiteSettings(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <InvoiceReceiptEditorClient
      invoice={JSON.parse(JSON.stringify(invoice))}
      siteSettings={siteSettings}
    />
  );
}
