import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function GET(_req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const videos = await prisma.video.findMany({
      include: {
        englishSentences: { include: { words: { include: { word: true }, orderBy: { order: "asc" } } } },
        targetSentences: { include: { words: { include: { word: true }, orderBy: { order: "asc" } } } },
        transliterationSentences: { include: { words: { include: { word: true }, orderBy: { order: "asc" } } } },
      },
    });

    const formatted = videos.map((v) => ({
      id: v.id,
      title: v.title,
      genre: v.genre,
      streamSrc: `/api/video/${v.id}/stream`,
      language: v.language || "Unknown",
      imageUrl: v.imageUrl || "/icons/Video.png",
      englishSentences: v.englishSentences,
      targetSentences: v.targetSentences,
      transliterationSentences: v.transliterationSentences,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
