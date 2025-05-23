import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const lessons = await prisma.audioLesson.findMany({
      orderBy: [{ language: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });
    const formatted = lessons.map((lesson) => ({
      ...lesson,
      audioUrl: lesson.audioUrl || "",
      language: lesson.language || "Unknown",
      imageUrl: lesson.imageUrl || "/icons/Music.png",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching audio lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch audio lessons", details: error },
      { status: 500 },
    );
  }
}
