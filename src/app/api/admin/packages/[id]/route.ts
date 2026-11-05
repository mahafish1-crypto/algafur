import { NextRequest } from "next/server";
import { GET as handleGet, PUT as handlePut, PATCH as handlePatch, DELETE as handleDelete } from "@/app/api/packages/[id]/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handleGet(req, ctx);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handlePut(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handlePatch(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handleDelete(req, ctx);
}

