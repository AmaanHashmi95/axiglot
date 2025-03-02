import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Ensure Prisma client is set up

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

    // ✅ Ensure `youtubeUrl` is not null before processing
    const formattedSongs = songs.map((song) => {
      let youtubeId = null;

      if (song.youtubeUrl) {
        try {
          // If URL contains "youtube.com", extract `v` parameter
          if (song.youtubeUrl.includes("youtube.com")) {
            youtubeId = new URL(song.youtubeUrl).searchParams.get("v");
          } 
          // If it's a YouTube short or direct video ID, handle it
          else if (song.youtubeUrl.includes("youtu.be")) {
            youtubeId = song.youtubeUrl.split("youtu.be/")[1]?.split("?")[0];
          } 
          // If it's already an ID, keep it as is
          else {
            youtubeId = song.youtubeUrl;
          }
        } catch (err) {
          console.error("Invalid YouTube URL:", song.youtubeUrl, err);
        }
      }

      return {
        ...song,
        youtubeUrl: youtubeId || "", // Ensure it's always a string
      };
    });

    console.log("Songs found:", formattedSongs);
    return NextResponse.json(formattedSongs);
  } catch (error) {
    console.error("Error fetching music:", error);
    return NextResponse.json({ error: "Failed to fetch songs", details: error }, { status: 500 });
  }
}
