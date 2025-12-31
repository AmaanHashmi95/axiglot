import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function GET(_req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    // ✅ LIGHTWEIGHT: do NOT send all subtitles for all videos
    const videos = await prisma.video.findMany({
      select: {
        id: true,
        title: true,
        genre: true,
        language: true,
        imageUrl: true,
        videoUrl: true, // blob url
      },
    });

    const formatted = videos.map((v) => ({
      id: v.id,
      title: v.title,
      genre: v.genre,
      // ✅ BEST PERFORMANCE: browser streams directly from Blob CDN
      streamSrc: v.videoUrl,
      language: v.language || "Unknown",
      imageUrl: v.imageUrl || "/icons/Video.png",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}