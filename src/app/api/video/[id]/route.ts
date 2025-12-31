import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

type RouteParams = { id: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { user } = await validateRequest();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  try {
    // ✅ HEAVY DATA only when needed
    const video = await prisma.video.findUnique({
      where: { id },
      select: {
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

    if (!video) return new NextResponse("Not found", { status: 404 });

    return NextResponse.json({
      englishSentences: video.englishSentences,
      targetSentences: video.targetSentences,
      transliterationSentences: video.transliterationSentences,
    });
  } catch (error) {
    console.error("Error fetching video subtitles:", error);
    return NextResponse.json({ error: "Failed to fetch subtitles" }, { status: 500 });
  }
}