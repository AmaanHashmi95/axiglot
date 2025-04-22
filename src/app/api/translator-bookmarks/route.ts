import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sourceText, translatedText, transliteration, language, words } = await req.json();

  const bookmark = await prisma.translatorBookmark.create({
    data: {
      userId: user.id,
      sourceText,
      translatedText,
      transliteration,
      language,
      words,
    },
  });

  return NextResponse.json(bookmark);
}

export async function GET(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang");
  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const take = parseInt(searchParams.get("take") || "20", 10);

  const languageMap: Record<string, string> = {
    Punjabi: "pa",
    Urdu: "ur",
  };

  const languageFilter =
    lang && lang !== "All Languages" ? languageMap[lang] : undefined;

  const bookmarks = await prisma.translatorBookmark.findMany({
    where: {
      userId: user.id,
      ...(languageFilter && { language: languageFilter }),
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  return NextResponse.json(bookmarks);
}


export async function DELETE(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.translatorBookmark.delete({ where: { id } });
  return new Response(null, { status: 204 });
}