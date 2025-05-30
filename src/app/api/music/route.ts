import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    console.log("Fetching songs from the database...");
 
    const songs = await prisma.song.findMany({
      include: {
        englishSentences: {
          include: {
            words: {
              include: { word: true }, // ✅ Now this works for English
              orderBy: { order: "asc" }
            },
          },
        },
        targetSentences: {
          include: {
            words: {
              include: { word: true }, // ✅ Already working fine for Target
              orderBy: { order: "asc" }
            },
          },
        },
        transliterationSentences: {
          include: {
            words: {
              include: { word: true }, // ✅ Now this works for Transliteration
              orderBy: { order: "asc" }
            },
          },
        },
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
 
