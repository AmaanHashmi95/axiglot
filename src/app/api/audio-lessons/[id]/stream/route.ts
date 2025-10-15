// src/app/api/audio-lessons/[id]/stream/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

// Use Node runtime for streaming/headers control
export const runtime = "nodejs";

type RouteParams = { id: string };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { user } = await validateRequest();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  // Look up the private Blob URL server-side
  const lesson = await prisma.audioLesson.findUnique({
    where: { id },
    select: { audioUrl: true },
  });

  const blobUrl = lesson?.audioUrl;
  if (!blobUrl) return new Response("Not found", { status: 404 });

  // Forward Range (needed for <audio> seeking)
  const range = req.headers.get("Range") ?? undefined;
  const upstream = await fetch(blobUrl, {
    headers: range ? { Range: range } : undefined,
  });

  // Copy through important headers and tighten caching
  const headers = new Headers(upstream.headers);
  headers.set("Cache-Control", "private, max-age=0, must-revalidate");
  headers.set("Referrer-Policy", "no-referrer");
  headers.delete("server");
  headers.delete("x-vercel-cache");

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
