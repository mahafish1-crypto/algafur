import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const media = await prisma.media.findUnique({
      where: { id },
      select: {
        id: true,
        data: true,
        fileType: true,
        url: true,
        isPrivate: true,
      },
    });

    if (!media) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    if (media.isPrivate) {
      const session = await getSession();
      if (!session) {
        return new NextResponse("Authentication required", { status: 401 });
      }
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
          "Cache-Control": media.isPrivate
            ? "private, max-age=3600"
            : "public, max-age=31536000, immutable",
        },
      });
    }

    // If external or static URL, redirect (guarding against self-redirect loop)
    if (media.url && !media.url.endsWith(`/api/media/${id}/file`)) {
      return NextResponse.redirect(new URL(media.url, req.url));
    }

    return new NextResponse("File Content Unavailable", { status: 404 });
  } catch (error) {
    console.error("Error serving media file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

