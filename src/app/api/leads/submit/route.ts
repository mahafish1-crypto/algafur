import { NextRequest } from "next/server";
import { POST as handleLeadPost } from "../route";

export const dynamic = "force-dynamic";

/**
 * Lead Submission Endpoint Alias (/api/leads/submit)
 * Delegates directly to the canonical /api/leads POST pipeline with full
 * Lead Quality Scoring, deduplication, notifications, and CRM persistence.
 */
export async function POST(req: NextRequest) {
  return handleLeadPost(req);
}

