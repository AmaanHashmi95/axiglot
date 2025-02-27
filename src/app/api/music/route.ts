import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Ensure Prisma client is set up

export async function GET() {
  try {
    console.log("Fetching songs from the database...");

    const songs = await prisma.song.findMany({
      include: {
        englishSentences: {
          include: { words: true },
        },
        targetSentences: {
          include: { words: true },
        },
        transliterationSentences: {
          include: { words: true },
        },
      },
    });

    console.log("Songs found:", songs);
    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error fetching music:", error);
    return NextResponse.json({ error: "Failed to fetch songs", details: error }, { status: 500 });
  }
}
