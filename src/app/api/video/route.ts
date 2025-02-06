import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // ✅ Fix: Use default import

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (videoId) {
    // Fetch a single video by ID
    try {
      const video = await prisma.media.findUnique({
        where: { id: videoId },
        select: { id: true, url: true, subtitle: true },
      });

      if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
      }

      return NextResponse.json(video);
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  // Fetch all videos if no videoId is provided
  try {
    const videos = await prisma.media.findMany({
      where: { type: 'VIDEO' }, // Ensure only videos are fetched
      select: { id: true, url: true,  subtitle: true },
      orderBy: { createdAt: 'desc' }, // Sort newest first
    });

    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
