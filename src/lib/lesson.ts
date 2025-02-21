import prisma from '@/lib/prisma';

export async function getLesson(lessonId: string) {
  return await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      questions: {
        include: {
          words: { 
            select: { id: true, text: true, type: true, audioUrl: true } // ✅ Include audioUrl
          }
        }
      }
    },
  });
}


