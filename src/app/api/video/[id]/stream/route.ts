import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
// import { requireActiveSubscriber } from "@/lib/subscription";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // try { await requireActiveSubscriber(user.id); } 
  // catch { return new Response("Payment Required", { status: 402 }); }

  const video = await prisma.video.findUnique({ where: { id: params.id }, select: { videoUrl: true } });
  const blobUrl = video?.videoUrl;
  if (!blobUrl) return new Response("Not found", { status: 404 });

  const range = req.headers.get("Range") ?? undefined;
  const upstream = await fetch(blobUrl, { headers: range ? { Range: range } : undefined });

  // Copy/adjust headers for media playback and privacy
  const headers = new Headers(upstream.headers);
  headers.set("Cache-Control", "private, max-age=0, must-revalidate");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Cross-Origin-Resource-Policy", "same-site");
  headers.delete("server");
  headers.delete("x-vercel-cache");

  return new Response(upstream.body, { status: upstream.status, headers });
}
