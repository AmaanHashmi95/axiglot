import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path to your Prisma client
import { validateRequest } from '@/auth'; // Validate user session

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { lessonId, progress } = await req.json();

  if (!lessonId || typeof progress !== 'number' || progress < 0 || progress > 100) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    // Save progress to the database
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId,
        },
      },
      update: { progress },
      create: { userId: user.id, lessonId, progress },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
