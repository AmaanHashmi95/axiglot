import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Fetching books from the database...");

    const books = await prisma.book.findMany({
      include: {
        bookPages: {
          include: {
            bookSentences: {
              include: {
                words: { 
                  select: { // ✅ Use only `select` and remove `include`
                    id: true,
                    word: { select: { text: true } }, // ✅ Fetch word text
                    translation: true, // ✅ Fetch translation
                    transliteration: true, // ✅ Fetch transliteration
                    color: true, // ✅ Fetch color
                    order: true,
                    translationOrder: true, // ✅ Fetch translation order
                    transliterationOrder: true, // ✅ Fetch transliteration order
                  },
                  orderBy: { order: "asc" }
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books", details: error },
      { status: 500 }
    );
  }
}
