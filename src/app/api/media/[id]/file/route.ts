import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    // If binary data is stored in data column (base64)
    if (media.data) {
      const base64Data = media.data.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": media.fileType || "image/jpeg",
          "Content-Length": buffer.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // If external or static URL, redirect
    if (media.url) {
      return NextResponse.redirect(new URL(media.url, req.url));
    }

    return new NextResponse("File Content Unavailable", { status: 404 });
  } catch (error) {
    console.error("Error serving media file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

