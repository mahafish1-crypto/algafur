import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";
import { getSiteSettings, SITE_SETTINGS_CACHE_TAG } from "@/lib/settings";
import { PACKAGES_CACHE_TAG } from "@/lib/packages-data";
import {
  TEAM_SETTING_KEY,
  parseTeamProfilesFromSettings,
  TeamMemberProfile,
} from "@/lib/team-data";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    const packages = await prisma.package.findMany({
      select: { id: true, name: true, slug: true, status: true },
      orderBy: { createdAt: "desc" },
    });
    const profiles = parseTeamProfilesFromSettings(
      settings,
      packages.map((p) => p.id)
    );
    return NextResponse.json({
      success: true,
      profiles,
      packages,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:settings");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const body = await req.json();
    const settings = await getSiteSettings();
    const currentProfiles = parseTeamProfilesFromSettings(settings);

    // If full array replacement is provided (e.g. reorder or bulk save)
    const incomingList = Array.isArray(body.profiles) ? body.profiles : (Array.isArray(body.members) ? body.members : null);
    if (incomingList) {
      const sanitized: TeamMemberProfile[] = incomingList
        .map((item: any, idx: number) => ({
          id: String(item.id || `team-${Date.now()}-${idx}`),
          name: String(item.name || "").trim(),
          photo: String(item.photo || "").trim(),
          category: item.category || "OTHER",
          designation: String(item.designation || "").trim(),
          bio: String(item.bio || "").trim(),
          qualifications: item.qualifications ? String(item.qualifications).trim() : "",
          languages: item.languages ? String(item.languages).trim() : "",
          services: item.services ? String(item.services).trim() : "",
          phone: item.phone ? String(item.phone).trim() : "",
          email: item.email ? String(item.email).trim() : "",
          packageIds: Array.isArray(item.packageIds)
            ? item.packageIds.map((id: unknown) => String(id))
            : [],
          displayOrder: Number.isFinite(Number(item.displayOrder))
            ? Number(item.displayOrder)
            : idx + 1,
          isActive: item.isActive !== false,
        }))
        .filter((p: TeamMemberProfile) => p.name.length > 0 && p.designation.length > 0)
        .sort((a: TeamMemberProfile, b: TeamMemberProfile) => a.displayOrder - b.displayOrder);

      await prisma.siteSetting.upsert({
        where: { key: TEAM_SETTING_KEY },
        update: { value: JSON.stringify(sanitized), category: "TEAM" },
        create: {
          key: TEAM_SETTING_KEY,
          value: JSON.stringify(sanitized),
          category: "TEAM",
        },
      });

      await logAudit({
        userId: session.id,
        action: "UPDATE_TEAM_DIRECTORY",
        entity: "TeamDirectory",
        entityId: TEAM_SETTING_KEY,
        details: { count: sanitized.length },
      });

      try {
        revalidateTag(SITE_SETTINGS_CACHE_TAG);
        revalidateTag(PACKAGES_CACHE_TAG);
        revalidatePath("/");
        revalidatePath("/about");
        revalidatePath("/packages");
      } catch {
        // ignore revalidate warnings
      }

      return NextResponse.json({ success: true, profiles: sanitized, members: sanitized });
    }

    // Single profile create or update
    const memberData = body.member || body;
    const {
      id,
      name,
      photo = "",
      category = "OTHER",
      designation,
      bio = "",
      qualifications = "",
      languages = "",
      services = "",
      phone = "",
      email = "",
      packageIds = [],
      displayOrder,
      isActive = true,
    } = memberData;

    if (!name?.trim() || !designation?.trim()) {
      return NextResponse.json(
        { error: "Full Name and Designation are required." },
        { status: 400 }
      );
    }

    const profileId = id ? String(id) : `team-${Date.now()}`;
    const existingIdx = currentProfiles.findIndex((p) => p.id === profileId);

    const newProfile: TeamMemberProfile = {
      id: profileId,
      name: String(name).trim(),
      photo: String(photo || "").trim(),
      category,
      designation: String(designation).trim(),
      bio: String(bio || "").trim(),
      qualifications: String(qualifications || "").trim(),
      languages: String(languages || "").trim(),
      services: String(services || "").trim(),
      phone: String(phone || "").trim(),
      email: String(email || "").trim(),
      packageIds: Array.isArray(packageIds) ? packageIds.map(String) : [],
      displayOrder: Number.isFinite(Number(displayOrder))
        ? Number(displayOrder)
        : existingIdx >= 0
        ? currentProfiles[existingIdx].displayOrder
        : currentProfiles.length + 1,
      isActive: Boolean(isActive),
    };

    const updated = [...currentProfiles];
    if (existingIdx >= 0) {
      updated[existingIdx] = newProfile;
    } else {
      updated.push(newProfile);
    }
    updated.sort((a, b) => a.displayOrder - b.displayOrder);

    await prisma.siteSetting.upsert({
      where: { key: TEAM_SETTING_KEY },
      update: { value: JSON.stringify(updated), category: "TEAM" },
      create: {
        key: TEAM_SETTING_KEY,
        value: JSON.stringify(updated),
        category: "TEAM",
      },
    });

    await logAudit({
      userId: session.id,
      action: existingIdx >= 0 ? "UPDATE_TEAM_MEMBER" : "CREATE_TEAM_MEMBER",
      entity: "TeamDirectory",
      entityId: profileId,
      details: { name: newProfile.name, designation: newProfile.designation, category },
    });

    try {
      revalidateTag(SITE_SETTINGS_CACHE_TAG);
      revalidateTag(PACKAGES_CACHE_TAG);
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/packages");
    } catch {
      // ignore
    }

    // Sync leader photos to SiteSetting keys if applicable
    if (newProfile.photo) {
      if (profileId === 'team-director-1' || newProfile.name.toLowerCase().includes('mudassir')) {
        await prisma.siteSetting.upsert({
          where: { key: 'about_leader_1_photo' },
          update: { value: newProfile.photo, category: 'ABOUT' },
          create: { key: 'about_leader_1_photo', value: newProfile.photo, category: 'ABOUT' },
        });
      } else if (profileId === 'team-guide-1' || newProfile.name.toLowerCase().includes('asrar')) {
        await prisma.siteSetting.upsert({
          where: { key: 'about_leader_2_photo' },
          update: { value: newProfile.photo, category: 'ABOUT' },
          create: { key: 'about_leader_2_photo', value: newProfile.photo, category: 'ABOUT' },
        });
      } else if (profileId === 'team-director-2' || newProfile.name.toLowerCase().includes('zahir')) {
        await prisma.siteSetting.upsert({
          where: { key: 'about_leader_3_photo' },
          update: { value: newProfile.photo, category: 'ABOUT' },
          create: { key: 'about_leader_3_photo', value: newProfile.photo, category: 'ABOUT' },
        });
      }
    }

    // Synchronize Sales team member with User database so they immediately appear in Lead CRM assignments
    if (newProfile.category === "SALES" || newProfile.designation.toLowerCase().includes("sales")) {
      try {
        const cleanEmail =
          newProfile.email?.trim() ||
          `${newProfile.name.toLowerCase().replace(/[^a-z0-9]+/g, "") || "sales"}@algafurtours.com`;
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: cleanEmail },
              { name: newProfile.name },
            ],
          },
        });

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: newProfile.name,
              phone: newProfile.phone || existingUser.phone,
              status: "ACTIVE",
              role:
                existingUser.role === "SUPER_ADMIN"
                  ? "SUPER_ADMIN"
                  : existingUser.role === "ADMIN"
                  ? "ADMIN"
                  : "SALES",
            },
          });
        } else {
          await prisma.user.create({
            data: {
              name: newProfile.name,
              email: cleanEmail,
              phone: newProfile.phone || null,
              passwordHash: "$2a$10$e8V/Jt7Xw8t66bCq8wK9yOe0.4j5Pj90A34yQcWb8qG/8v0fE95c2",
              role: "SALES",
              status: "ACTIVE",
            },
          });
        }
      } catch (syncErr) {
        console.error("Failed to sync sales member to user table:", syncErr);
      }
    }

    return NextResponse.json({
      success: true,
      profile: newProfile,
      profiles: updated,
      members: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:settings");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Profile ID is required." }, { status: 400 });
    }

    const settings = await getSiteSettings();
    const currentProfiles = parseTeamProfilesFromSettings(settings);
    const target = currentProfiles.find((p) => p.id === id);
    const updated = currentProfiles.filter((p) => p.id !== id);

    await prisma.siteSetting.upsert({
      where: { key: TEAM_SETTING_KEY },
      update: { value: JSON.stringify(updated), category: "TEAM" },
      create: {
        key: TEAM_SETTING_KEY,
        value: JSON.stringify(updated),
        category: "TEAM",
      },
    });

    await logAudit({
      userId: session.id,
      action: "DELETE_TEAM_MEMBER",
      entity: "TeamDirectory",
      entityId: id,
      details: { deletedName: target?.name || id },
    });

    try {
      revalidateTag(SITE_SETTINGS_CACHE_TAG);
      revalidateTag(PACKAGES_CACHE_TAG);
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/packages");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, profiles: updated, members: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
