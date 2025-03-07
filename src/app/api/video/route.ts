import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Fetching videos from the database...");

    const videos = await prisma.video.findMany({
      include: {
        englishSentences: { include: { words: true } },
        targetSentences: { include: { words: true } },
        transliterationSentences: { include: { words: true } },
      },
    });

    const formattedVideos = videos.map((video) => ({
      ...video,
      audioUrl: video.videoUrl || "", // Ensure it's always a string
      language: video.language || "Unknown",
      imageUrl: video.imageUrl || "/icons/Video.png", // ✅ Set default image if missing
    }));
    

    console.log("Videos found:", formattedVideos);
    return NextResponse.json(formattedVideos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos", details: error },
      { status: 500 }
    );
  }
}
