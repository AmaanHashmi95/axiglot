import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

// For simplicity (streams + headers), use Node runtime
export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // Authorize user for this lesson (customize as needed)
  // e.g., if you have subscriptions / language entitlements, check them here.

  // Look up the private Blob URL server-side
  const lesson = await prisma.audioLesson.findUnique({
    where: { id: params.id },
    select: { /* blobUrl or audioUrl */ audioUrl: true },
  });
  const blobUrl = lesson?.audioUrl;
  if (!blobUrl) return new Response("Not found", { status: 404 });

  // Forward Range (needed for <audio> seeking)
  const range = req.headers.get("Range") ?? undefined;
  const upstream = await fetch(blobUrl, {
    headers: range ? { Range: range } : undefined,
    // Optionally forward If-Modified-Since / If-None-Match if you want caching semantics
  });

  // Copy through important headers and tighten caching
  const headers = new Headers(upstream.headers);
  headers.set("Cache-Control", "private, max-age=0, must-revalidate");
  headers.set("Referrer-Policy", "no-referrer");
  headers.delete("server");
  headers.delete("x-vercel-cache");

  // Tip: If you *really* want to discourage saving in the browser UI:
  //   - you can avoid setting `Content-Disposition: attachment`
  //   - but note: any client receiving audio can technically save it.

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}