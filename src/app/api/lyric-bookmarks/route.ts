import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookmarks = await prisma.lyricBookmark.findMany({
    where: { userId: user.id },
    include: {
      song: { include: { targetSentences: true } },
    },
  });

  const enriched = bookmarks.map((b) => {
    const enrichedSentences = b.sentenceIds.map((id) => {
      const s = b.song.targetSentences.find((s) => s.id === id);
      return {
        id,
        text: s?.text || "(missing)",
        bookmarkedEnglish: s?.bookmarkedEnglish || "",
        bookmarkedTransliteration: s?.bookmarkedTransliteration || "",
        audioUrl: s?.audioUrl || "",
      };
    });

    return {
      ...b,
      sentences: enrichedSentences,
      language: b.song.language || "Unknown",
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { songId, sentenceIds, words, translations, audioUrl, bookmarkedEnglish, bookmarkedTransliteration } = await req.json();

  const targetSentences = await prisma.lyricTargetSentence.findMany({
    where: { id: { in: sentenceIds } },
  });

  await Promise.all(
    targetSentences.map(async (s) => {
      const current = await prisma.lyricTargetSentence.findUnique({
        where: { id: s.id },
        select: { bookmarkedEnglish: true, bookmarkedTransliteration: true },
      });

      const shouldUpdate =
        !current?.bookmarkedEnglish?.trim() && !current?.bookmarkedTransliteration?.trim();

      if (!shouldUpdate) return null;

      return prisma.lyricTargetSentence.update({
        where: { id: s.id },
        data: {
            bookmarkedEnglish,
            bookmarkedTransliteration,
        },
      });
    })
  );

  const bookmark = await prisma.lyricBookmark.create({
    data: {
      userId: user.id,
      songId,
      sentenceIds,
      audioUrl,
    },
  });

  return NextResponse.json(bookmark);
}

export async function DELETE(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.lyricBookmark.delete({ where: { id } });
  return new Response(null, { status: 204 });
}