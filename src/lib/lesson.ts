import prisma from '@/lib/prisma';

export async function getLesson(lessonId: string) {
  return await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      questions: {
        include: {
          words: {
            orderBy: { order: 'asc' }, // ✅ Order words within the question
            include: {
              word: { // ✅ Fetch word details
                select: {
                  id: true,
                  text: true,
                  type: true,
                  audioUrl: true,
                }
              }
            }
          },
        },
      },
    },
  }).then(lesson => {
    if (!lesson) return null;
    
    return {
      ...lesson,
      questions: lesson.questions.map(q => ({
        ...q,
        words: q.words.map(qw => ({
          ...qw.word, // ✅ Use word details from `QuestionWord`
          audioUrl: qw.word.audioUrl ?? undefined, // Convert `null` to `undefined`
        })),
      })),
    };
  });
}
