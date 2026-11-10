import { NextRequest } from "next/server";
import { GET as handleGet, POST as handlePost } from "@/app/api/packages/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleGet(req);
}

export async function POST(req: NextRequest) {
  return handlePost(req);
}
