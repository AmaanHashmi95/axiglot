import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId, pageNumber } = await req.json();
    if (!bookId) return NextResponse.json({ error: "Missing bookId" }, { status: 400 });

    await prisma.bookProgress.upsert({
      where: { userId_bookId: { userId: user.id, bookId } },
      update: { pageNumber, lastReadAt: new Date() },
      create: { userId: user.id, bookId, pageNumber },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving book progress:", error);
    return NextResponse.json({ error: "Failed to save book progress" }, { status: 500 });
  }
}
