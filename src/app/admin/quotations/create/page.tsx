import React from "react";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";
import { getQuotationFormOptions } from "@/lib/quotations-server";
import QuotationFormClient from "@/components/admin/QuotationFormClient";

export const metadata = {
  title: "Create Quotation | AL GAFUR Admin",
  description: "Generate a detailed Hajj & Umrah tour estimate with child, infant, and discount pricing.",
};

export const dynamic = "force-dynamic";

export default async function CreateQuotationPage() {
  const { allowed, session } = await verifyModuleAccess("quotations");
  if (!allowed) return <AccessDeniedView moduleKey="quotations" session={session} />;

  const { packages, customers, leads } = await getQuotationFormOptions();

  return (
    <QuotationFormClient
      packages={packages}
      customers={customers}
      leads={leads}
    />
  );
}
