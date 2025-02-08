import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const musicId = searchParams.get('musicId');

    if (musicId) {
      // ✅ Fetch a single track with lyrics URL
      const track = await prisma.music.findUnique({
        where: { id: musicId },
        select: { id: true, title: true, artist: true, url: true, lyrics: true },
      });

      if (!track) {
        return NextResponse.json({ error: 'Music not found' }, { status: 404 });
      }

      return NextResponse.json(track);
    }

    // ✅ Ensure all tracks include `lyrics`
    const tracks = await prisma.music.findMany({
      select: { id: true, title: true, artist: true, url: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error fetching music:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
