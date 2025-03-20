import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const bookmarks = await prisma.lessonBookmark.findMany({
      where: { userId: user.id },
      include: { lesson: true, question: true },
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
