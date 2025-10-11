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

  const bookmarks = await prisma.lyricBookmark.findMany({
    where: {
      userId: user.id,
      ...(lang && lang !== "All Languages"
        ? { song: { language: { equals: lang, mode: "insensitive" } } }
        : {}),
    },
    include: {
            // We need all three lanes so we can build fallbacks by ID
      song: {
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
    // Index sentences by id for quick lookups
    const englishById = new Map(
      (b.song.englishSentences ?? []).map((s) => [s.id, s]),
    );
    const translitById = new Map(
      (b.song.transliterationSentences ?? []).map((s) => [s.id, s]),
    );
    const targetById = new Map(
      (b.song.targetSentences ?? []).map((s) => [s.id, s]),
    );

    // We only need to produce ONE rendered block per bookmark card.
    // Convention in your UI: you take the FIRST item (which should be the target line).
    // So, pick the target id out of the sentenceIds list first:
    const targetId = b.sentenceIds.find((id) => targetById.has(id));
    const englishId = b.sentenceIds.find((id) => englishById.has(id));
    const translitId = b.sentenceIds.find((id) => translitById.has(id));

    const tgt = targetId ? targetById.get(targetId)! : undefined;
    const eng = englishId ? englishById.get(englishId)! : undefined;
    const trn = translitId ? translitById.get(translitId)! : undefined;

    // Build fallbacks: prefer stored bookmarked* on the target sentence;
    // if missing, fall back to the corresponding line’s full text.
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
      sentences: [first], // Your UI reads only the first one
      language: b.song.language || "Unknown",
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
    songId,
    sentenceIds = [],
    words = [],
    translations = [],
    audioUrl = "",
    // fallbacks when per-word arrays are missing
    fallbackEnglish = "",
    fallbackTransliteration = "",
    fallbackTarget = "",
  } = await req.json()

    // Build strings from per-word arrays
  let computedEnglish =
    Array.isArray(translations) && translations.length
      ? translations.map((t: { text: string }) => t.text).join(" ")
      : "";

  let computedTransliteration =
    Array.isArray(words) && words.length
      ? words
          .map(
            (w: { text: string; transliteration?: string }) =>
              w.transliteration || w.text,
          )
          .join(" ")
      : "";

  // If empty, fall back to full-line strings from the client
  if (!computedEnglish?.trim()) computedEnglish = fallbackEnglish || "";
  if (!computedTransliteration?.trim())
    computedTransliteration = fallbackTransliteration || "";

  const targetSentences = await prisma.lyricTargetSentence.findMany({
    where: { id: { in: sentenceIds } },
    select: { id: true, bookmarkedEnglish: true, bookmarkedTransliteration: true },
  });

  await Promise.all(
    targetSentences.map(async (s) => {
      const current = await prisma.lyricTargetSentence.findUnique({
        where: { id: s.id },
        select: { bookmarkedEnglish: true, bookmarkedTransliteration: true },
      });

      const shouldUpdate =
        !current?.bookmarkedEnglish?.trim() &&
        !current?.bookmarkedTransliteration?.trim();

      if (!shouldUpdate) return null;

      return prisma.lyricTargetSentence.update({
        where: { id: s.id },
        data: {
          bookmarkedEnglish: computedEnglish,
          bookmarkedTransliteration: computedTransliteration,
        },
      });
    }),
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
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.lyricBookmark.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
