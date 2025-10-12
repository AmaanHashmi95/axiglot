import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function GET() {
  const { user } = await validateRequest();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const lessons = await prisma.audioLesson.findMany({
      orderBy: [{ language: "asc" }, { order: "asc" }, { createdAt: "asc" }],
      // IMPORTANT: do NOT select the blobUrl/audioUrl if you fear accidental leakage
      // select: { id: true, title: true, speaker: true, imageUrl: true, language: true, order: true, createdAt: true }
    });

    const formatted = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      speaker: lesson.speaker,
      // never expose the raw blob url:
      streamSrc: `/api/audio-lessons/${lesson.id}/stream`, // our gated route
      language: lesson.language || "Unknown",
      imageUrl: lesson.imageUrl || "/icons/Music.png",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching audio lessons:", error);
    return NextResponse.json({ error: "Failed to fetch audio lessons" }, { status: 500 });
  }
}
