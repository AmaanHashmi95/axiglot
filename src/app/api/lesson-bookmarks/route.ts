import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const take = parseInt(searchParams.get("take") || "20", 10);
    const lang = searchParams.get("lang");

    const bookmarks = await prisma.lessonBookmark.findMany({
      where: {
        userId: user.id,
        ...(lang && lang !== "All Languages"
          ? { question: { language: { equals: lang, mode: "insensitive" } } }
          : {}),
      },
      include: { lesson: true, question: true },
      skip,
      take,
    });

    return Response.json(bookmarks);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { lessonId, questionId, words, translations } = await req.json();

    const bookmark = await prisma.lessonBookmark.upsert({
      where: {
        userId_lessonId_questionId: {
          userId: user.id,
          lessonId,
          questionId,
        },
      },
      create: {
        userId: user.id,
        lessonId,
        questionId,
        words,
        translations,
      },
      update: {
        words,
        translations,
      },
    });

    return Response.json(bookmark);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { lessonId, questionId } = await req.json();

    await prisma.lessonBookmark.deleteMany({
      where: { userId: user.id, lessonId, questionId },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
