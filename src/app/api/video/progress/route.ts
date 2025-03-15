import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { videoId } = await req.json();
  if (!videoId) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    await prisma.videoProgress.upsert({
      where: { userId_videoId: { userId: user.id, videoId } },
      update: { watchedAt: new Date() },
      create: { userId: user.id, videoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving video progress:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
