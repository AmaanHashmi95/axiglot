import prisma from '@/lib/prisma';

export async function getLesson(lessonId: string) {
  return await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      questions: {
        include: {
          words: true, // ✅ Ensure words are included
        },
      },
    },
  });
}
