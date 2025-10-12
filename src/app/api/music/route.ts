import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function GET() {
  const { user } = await validateRequest();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const songs = await prisma.song.findMany({
      include: {
        englishSentences: {
          include: { words: { include: { word: true }, orderBy: { order: "asc" } } },
        },
        targetSentences: {
          include: { words: { include: { word: true }, orderBy: { order: "asc" } } },
        },
        transliterationSentences: {
          include: { words: { include: { word: true }, orderBy: { order: "asc" } } },
        },
      },
    });

    const formatted = songs.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      // do NOT send s.audioUrl to the client:
      streamSrc: `/api/music/${s.id}/stream`,  // ← gated route
      language: s.language || "Unknown",
      imageUrl: s.imageUrl || "/icons/Music.png",
      englishSentences: s.englishSentences,
      targetSentences: s.targetSentences,
      transliterationSentences: s.transliterationSentences,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching music:", error);
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
  }
}
