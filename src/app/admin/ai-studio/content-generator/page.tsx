import React from "react";
import prisma from "@/lib/db";
import AIContentGeneratorClient from "./AIContentGeneratorClient";

export const metadata = {
  title: "AI Content & Copy Generator | AL-GAFUR Admin",
  description: "Multilingual marketing copy, captions, and WhatsApp broadcasts powered by AI.",
};

export default async function AIContentGeneratorPage() {
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

