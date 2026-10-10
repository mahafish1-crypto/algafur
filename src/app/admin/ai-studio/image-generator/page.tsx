import React from "react";
import AIImageGeneratorClient from "./AIImageGeneratorClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const metadata = {
  title: "AI Creative & Social Poster Studio | AL-GAFUR Admin",
  description: "Generate branded social media posts, WhatsApp status flyers, and package banners.",
};

export default async function AIImageGeneratorPage() {
  const { allowed, session } = await verifyModuleAccess("ai_studio");
  if (!allowed) return <AccessDeniedView moduleKey="ai_studio" session={session} />;
  return <AIImageGeneratorClient />;
}

