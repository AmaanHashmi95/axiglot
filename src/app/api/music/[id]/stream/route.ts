// src/app/api/music/[id]/stream/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export const runtime = "nodejs";

type RouteParams = { id: string };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { user } = await validateRequest();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  const song = await prisma.song.findUnique({
    where: { id },
    select: { audioUrl: true },
  });
  const blobUrl = song?.audioUrl;
  if (!blobUrl) return new Response("Not found", { status: 404 });

  const range = req.headers.get("Range") ?? undefined;
  const upstream = await fetch(blobUrl, { headers: range ? { Range: range } : undefined });

  const headers = new Headers(upstream.headers);
  headers.set("Cache-Control", "private, max-age=0, must-revalidate");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Cross-Origin-Resource-Policy", "same-site");
  headers.delete("server");
  headers.delete("x-vercel-cache");

  return new Response(upstream.body, { status: upstream.status, headers });
}
