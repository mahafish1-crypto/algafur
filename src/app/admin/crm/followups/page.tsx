import prisma from "@/lib/db";
import FollowupsClient from "./FollowupsClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const revalidate = 0;

export default async function FollowupsPage() {
  const { allowed, session } = await verifyModuleAccess("followups");
  if (!allowed) return <AccessDeniedView moduleKey="followups" session={session} />;
  const followUps = await prisma.followUp.findMany({
    include: {
      lead: true,
      customer: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return <FollowupsClient initialFollowUps={followUps} />;
}

