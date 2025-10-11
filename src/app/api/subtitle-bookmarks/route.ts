import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const take = parseInt(searchParams.get("take") || "20", 10);
  const lang = searchParams.get("lang");

  const bookmarks = await prisma.subtitleBookmark.findMany({
    where: {
      userId: user.id,
      ...(lang && lang !== "All Languages"
        ? { video: { language: { equals: lang, mode: "insensitive" } } }
        : {}),
    },
    include: {
            // Need all lanes for fallback assembly
      video: {
       include: {
          targetSentences: true,
          englishSentences: true,
          transliterationSentences: true,
        },
      },
    },
    skip,
    take,
  });

  const enriched = bookmarks.map((b) => {
    // Index by id
    const englishById = new Map(
      (b.video.englishSentences ?? []).map((s) => [s.id, s]),
    );
    const translitById = new Map(
      (b.video.transliterationSentences ?? []).map((s) => [s.id, s]),
    );
    const targetById = new Map(
      (b.video.targetSentences ?? []).map((s) => [s.id, s]),
    );

    // Pick the 3 sentence ids from the bookmark
    const targetId = b.sentenceIds.find((id) => targetById.has(id));
    const englishId = b.sentenceIds.find((id) => englishById.has(id));
    const translitId = b.sentenceIds.find((id) => translitById.has(id));

    const tgt = targetId ? targetById.get(targetId)! : undefined;
    const eng = englishId ? englishById.get(englishId)! : undefined;
    const trn = translitId ? translitById.get(translitId)! : undefined;

    // Prefer stored bookmarked* on the target; otherwise fall back to full-line text
    const first = {
      id: targetId ?? b.sentenceIds[0],
      text: tgt?.text || "(missing)",
      bookmarkedEnglish:
        (tgt?.bookmarkedEnglish ?? "").trim() || eng?.text || "",
      bookmarkedTransliteration:
        (tgt?.bookmarkedTransliteration ?? "").trim() || trn?.text || "",
      audioUrl: tgt?.audioUrl || "",
    };

    return {
      ...b,
      sentences: [first],
      language: b.video.language || "Unknown",
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { videoId, sentenceIds, words, translations, audioUrl } =
    await req.json();

  const targetSentences = await prisma.subtitleTargetSentence.findMany({
    where: { id: { in: sentenceIds } },
  });

  await Promise.all(
    targetSentences.map(async (s) => {
      const current = await prisma.subtitleTargetSentence.findUnique({
        where: { id: s.id },
        select: { bookmarkedEnglish: true, bookmarkedTransliteration: true },
      });

      const shouldUpdate =
        !current?.bookmarkedEnglish?.trim() &&
        !current?.bookmarkedTransliteration?.trim();

      if (!shouldUpdate) return null;

      return prisma.subtitleTargetSentence.update({
        where: { id: s.id },
        data: {
          bookmarkedEnglish: translations
            .map((t: { text: string }) => t.text)
            .join(" "),
          bookmarkedTransliteration: words
            .map(
              (w: { transliteration?: string; text: string }) =>
                w.transliteration || w.text,
            )
            .join(" "),
        },
      });
    }),
  );

  const bookmark = await prisma.subtitleBookmark.create({
    data: {
      userId: user.id,
      videoId,
      sentenceIds,
      audioUrl,
    },
  });

  return NextResponse.json(bookmark);
}

export async function DELETE(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  await prisma.subtitleBookmark.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
