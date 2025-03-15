import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { songId } = await req.json();
    if (!songId) return NextResponse.json({ error: "Missing songId" }, { status: 400 });

    await prisma.musicProgress.upsert({
      where: { userId_songId: { userId: user.id, songId } },
      update: { listenedAt: new Date() },
      create: { userId: user.id, songId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving music progress:", error);
    return NextResponse.json({ error: "Failed to save music progress" }, { status: 500 });
  }
}
