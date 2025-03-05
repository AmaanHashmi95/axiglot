import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Fetching songs from the database...");

    const songs = await prisma.song.findMany({
      include: {
        englishSentences: { include: { words: true } },
        targetSentences: { include: { words: true } },
        transliterationSentences: { include: { words: true } },
      },
    });

    const formattedSongs = songs.map((song) => ({
      ...song,
      audioUrl: song.audioUrl || "", // Ensure it's always a string
      language: song.language || "Unknown",
      imageUrl: song.imageUrl || "/icons/Music.png", // ✅ Set default image if missing
    }));
    

    console.log("Songs found:", formattedSongs);
    return NextResponse.json(formattedSongs);
  } catch (error) {
    console.error("Error fetching music:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs", details: error },
      { status: 500 }
    );
  }
}
