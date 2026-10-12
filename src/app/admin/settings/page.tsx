import React from "react";
import prisma from "@/lib/db";
import AdminSettingsClient from "./AdminSettingsClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";
import { SECRET_SETTING_KEYS, maskSecretSetting } from "@/lib/settings";

export const metadata = {
  title: "System Settings & Website CMS | AL-GAFUR Admin",
  description:
    "Configure homepage hero, agency profile, WhatsApp Cloud API, AI Studio, and banking.",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { allowed, session } = await verifyModuleAccess("settings");
  if (!allowed)
    return <AccessDeniedView moduleKey="settings" session={session} />;

  const [resolvedParams, settings, packages] = await Promise.all([
    searchParams ? searchParams : Promise.resolve({} as Record<string, string | string[] | undefined>),
    prisma.siteSetting.findMany(),
    prisma.package.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    if (SECRET_SETTING_KEYS.includes(s.key)) {
      settingsMap[s.key] = s.value ? maskSecretSetting(s.value) : "";
    } else {
      settingsMap[s.key] = s.value;
    }
  });

  const initialTab =
    typeof resolvedParams?.tab === "string" ? resolvedParams.tab : undefined;

  return (
    <AdminSettingsClient
      initialSettings={settingsMap}
      publishedPackages={JSON.parse(JSON.stringify(packages))}
      initialTab={initialTab}
    />
  );
}
