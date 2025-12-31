import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export const runtime = "nodejs";

type RouteParams = { id: string };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  // NOTE: This route is now “better” even if unused.
  // If you later decide to keep streamSrc as /api/video/:id/stream, this will avoid proxying bytes.

  const { user } = await validateRequest();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: { id },
    select: { videoUrl: true },
  });

  const blobUrl = video?.videoUrl;
  if (!blobUrl) return new Response("Not found", { status: 404 });

  // ✅ Redirect instead of proxy-streaming the bytes
  // (keeps your app as the auth gate, but removes the byte-proxy bottleneck)
  const headers = new Headers();
  headers.set("Location", blobUrl);
  // small private cache helps repeated navigation
  headers.set("Cache-Control", "private, max-age=300");

  // 307 preserves method + headers safely
  return new Response(null, { status: 307, headers });
}