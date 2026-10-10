import React from "react";
import prisma from "@/lib/db";
import AIContentGeneratorClient from "./AIContentGeneratorClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const metadata = {
  title: "AI Content & Copy Generator | AL-GAFUR Admin",
  description: "Multilingual marketing copy, captions, and WhatsApp broadcasts powered by AI.",
};

export default async function AIContentGeneratorPage() {
  const { allowed, session } = await verifyModuleAccess("ai_studio");
  if (!allowed) return <AccessDeniedView moduleKey="ai_studio" session={session} />;
  const packages = await prisma.package.findMany({
    select: {
      id: true,
      name: true,
      durationDays: true,
      basePrice: true,
      departureDate: true,
    },
    where: { status: "PUBLISHED" },
    orderBy: { name: "asc" },
  });

  return <AIContentGeneratorClient packages={JSON.parse(JSON.stringify(packages))} />;
}

