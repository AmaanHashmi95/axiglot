import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    console.log("Fetching books from the database...");

    const books = await prisma.book.findMany({
      include: {
        bookPages: {
          orderBy: [
            { order: "asc" },
            { createdAt: "asc" }, // tie-breaker if two pages share the same order
          ],
          include: {
            bookSentences: {
              orderBy: [
                { order: "asc" },
                { createdAt: "asc" }, // tie-breaker for duplicate order values
              ],
              include: {
                words: {
                  select: {
                    id: true,
                    word: { select: { text: true } },
                    translation: true,
                    transliteration: true,
                    color: true,
                    order: true,
                    translationOrder: true,
                    transliterationOrder: true,
                  },
                  orderBy: { order: "asc" }, // you already had this part effectively
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
