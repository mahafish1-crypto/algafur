import prisma from "@/lib/db";
import FollowupsClient from "./FollowupsClient";

export const revalidate = 0;

export default async function FollowupsPage() {
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

