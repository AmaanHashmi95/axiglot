import { NextRequest } from "next/server";
import { validateRequest } from "@/auth";

export async function GET(req: NextRequest) {
  const { session, user } = await validateRequest();
  if (!session || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return new Response("Missing file ID", { status: 400 });
  }

  // Assumes `id` is the full Blob URL
  try {
    const file = await fetch(id);
    if (!file.ok) return new Response("Blob not found", { status: 404 });

    return new Response(file.body, {
      status: 200,
      headers: {
        "Content-Type": file.headers.get("Content-Type") || "audio/mpeg",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("Blob error", err);
    return new Response("Failed to fetch blob", { status: 500 });
  }
}
