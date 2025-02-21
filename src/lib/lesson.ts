import prisma from '@/lib/prisma';

export async function getLesson(lessonId: string) {
  return await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      questions: {
        include: {
          words: {
            select: {
              id: true,
              text: true,
              type: true,
              audioUrl: true, // ✅ Keep this
            },
          },
        },
      },
    },
  }).then(lesson => {
    if (!lesson) return null;
    
    // ✅ Convert `null` audioUrl to `undefined`
    return {
      ...lesson,
      questions: lesson.questions.map(q => ({
        ...q,
        words: q.words.map(w => ({
          ...w,
          audioUrl: w.audioUrl ?? undefined, // Convert `null` to `undefined`
        })),
      })),
    };
  });
}



