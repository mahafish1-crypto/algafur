import prisma from "@/lib/db";
import LeadsPipelineClient from "./LeadsPipelineClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const revalidate = 0;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const { allowed, session } = await verifyModuleAccess("leads");
  if (!allowed)
    return <AccessDeniedView moduleKey="leads" session={session} />;

  const resolvedParams = searchParams ? await searchParams : {};
  const includeYouTubeLeads = resolvedParams?.view === "all";

  const [leads, users, packages, youtubeSubmissions] = await Promise.all([
    prisma.lead.findMany({
      take: 300,
      include: {
        assignedTo: { select: { id: true, name: true } },
        followUps: {
          orderBy: { date: "desc" },
          select: { id: true, date: true, time: true, status: true, type: true },
        },
        _count: { select: { activities: true, followUps: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, role: true },
    }),
    prisma.package.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: "desc" },
    }),
    includeYouTubeLeads
      ? prisma.leadFormSubmission.findMany({
          take: 150,
          include: {
            form: { select: { title: true, slug: true } },
            assignedTo: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const mappedYouTubeLeads = youtubeSubmissions.map((yt) => ({
    id: yt.id,
    leadNumber: yt.submissionCode,
    name: yt.name || "Unnamed Pilgrim",
    mobile: yt.phone || yt.whatsapp || "",
    whatsappNumber: yt.whatsapp || yt.phone || "",
    email: yt.email || "",
    city: yt.city || "",
    packageInterest: yt.interestedIn || yt.form?.title || yt.formTitle,
    travelDate: yt.travelMonth || "",
    adults: yt.travellersCount || 1,
    children: 0,
    source: yt.leadSource || "YouTube Form",
    utmCampaign: yt.campaignName || yt.utmCampaign || "",
    status: yt.status,
    assignedToId: yt.assignedToId,
    assignedTo: yt.assignedTo,
    followUps: yt.followUpDate
      ? [
          {
            id: `yt_${yt.id}`,
            date: yt.followUpDate.slice(0, 10),
            time: "10:00",
            status: "PENDING",
            type: "CALL",
          },
        ]
      : [],
    createdAt: yt.createdAt,
    isYouTubeLead: true,
    youtubeDetailHref: `/admin/youtube-leads/responses/${yt.id}`,
  }));

  const combinedLeads = includeYouTubeLeads
    ? [...leads, ...mappedYouTubeLeads].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : leads;

  return (
    <LeadsPipelineClient
      initialLeads={JSON.parse(JSON.stringify(combinedLeads))}
      users={JSON.parse(JSON.stringify(users))}
      packages={JSON.parse(JSON.stringify(packages))}
      includeYouTubeLeads={includeYouTubeLeads}
    />
  );
}
