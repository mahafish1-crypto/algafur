import React from "react";
import prisma from "@/lib/db";
import AdminSettingsClient from "./AdminSettingsClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const metadata = {
  title: "System Settings & Integrations | AL-GAFUR Admin",
  description: "Configure agency profile, WhatsApp Cloud API, AI Studio, and banking.",
};

export default async function AdminSettingsPage() {
  const { allowed, session } = await verifyModuleAccess("settings");
  if (!allowed) return <AccessDeniedView moduleKey="settings" session={session} />;
  const settings = await prisma.siteSetting.findMany();
  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return <AdminSettingsClient initialSettings={settingsMap} />;
}

