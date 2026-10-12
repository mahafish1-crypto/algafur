import React from "react";
import prisma from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { parseTeamProfilesFromSettings } from "@/lib/team-data";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";
import AdminTeamClient from "./AdminTeamClient";

export const metadata = {
  title: "Team & Spiritual Guides | AL-GAFUR Admin",
  description:
    "Manage Directors, Spiritual Guides, Operations, Sales, Accounts, and custom staff profiles.",
};

export default async function AdminTeamPage() {
  const { allowed, session } = await verifyModuleAccess("settings");
  if (!allowed)
    return <AccessDeniedView moduleKey="settings" session={session} />;

  const [settings, packages] = await Promise.all([
    getSiteSettings(),
    prisma.package.findMany({
      select: { id: true, name: true, slug: true, status: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const initialMembers = parseTeamProfilesFromSettings(settings);

  return (
    <AdminTeamClient
      initialMembers={initialMembers}
      allPackages={JSON.parse(JSON.stringify(packages))}
    />
  );
}

