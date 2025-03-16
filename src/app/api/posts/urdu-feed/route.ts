import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user's completed lessons
    const completedLessons = await prisma.lessonProgress.findMany({
      where: {
        userId: user.id,
        completed: true,
      },
      select: { lessonId: true },
    });

    const completedLessonIds = completedLessons.map((lesson) => lesson.lessonId);

    // Fetch posts that are either:
    // - General (no requiredLessonId)
    // - Or require a lesson the user has completed
    const posts = await prisma.post.findMany({
      where: {
        language: "urdu",
        OR: [
          { requiredLessonId: null }, // ✅ Posts that are for everyone
          { requiredLessonId: { in: completedLessonIds } }, // ✅ Posts user has unlocked
        ],
      },
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
