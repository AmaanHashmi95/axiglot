import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookId, sentenceId, text, translation, transliteration, language } = await req.json();

  const bookmark = await prisma.readingBookmark.create({
    data: {
      userId: user.id,
      bookId,
      sentenceId,
      text,
      translation,
      transliteration,
      language,
    },
  });

  return NextResponse.json(bookmark);
}

export async function GET(req: NextRequest) {
    const { user } = await validateRequest();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
    const bookmarks = await prisma.readingBookmark.findMany({
  
        where: { userId: user.id },
        include: {
          book: { select: { title: true } },
        },
      });
      
      const sentenceDetails = await Promise.all(
        bookmarks.map(async (bookmark) => {
            const sentence = await prisma.bookSentence.findFirst({
                where: { text: bookmark.text, bookPage: { bookId: bookmark.bookId } },
                select: {
                  text: true,
                  translation: true,
                  transliteration: true,
                  words: {
                    orderBy: { order: "asc" },
                    select: {
                      id: true,
                      translation: true,
                      transliteration: true,
                      color: true,
                      word: { select: { text: true } },
                      translationOrder: true,
                      transliterationOrder: true,
                    },
                  },
                },
              });
              
      
              return {
                ...bookmark,
                sentenceText: sentence?.text,
                sentenceTranslation: sentence?.translation,
                sentenceTransliteration: sentence?.transliteration,
                words: sentence?.words || [],
              };
        })
      );
      
      return NextResponse.json(sentenceDetails);
      
}

export async function DELETE(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  await prisma.readingBookmark.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
