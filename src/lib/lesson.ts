import prisma from '@/lib/prisma';

export async function getLesson(lessonId: string) {
  return await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      questions: {
        include: {
          words: {
            orderBy: { order: 'asc' },
            select: {
              word: {
                select: {
                  id: true,
                  text: true,
                  audioUrl: true
                }
              },
              color: true, // ✅ Ensure color is selected
            }
          },
          translations: {
            orderBy: { order: 'asc' },
            select: {
              translation: {
                select: {
                  id: true,
                  text: true,
                  language: true
                }
              },
              color: true, // ✅ Ensure color is selected
            }
          }
        }
      }
    }
  }).then((lesson) => {
    if (!lesson) return null;

    return {
      ...lesson,
      questions: lesson.questions.map((q: any) => ({
        ...q,
        words: q.words.map((qw: any) => ({
          id: qw.word.id,
          text: qw.word.text,
          color: qw.color, // ✅ Apply stored color
          audioUrl: qw.word.audioUrl ?? undefined,
        })),
        translations: q.translations.map((qt: any) => ({
          id: qt.translation.id,
          text: qt.translation.text,
          color: qt.color, // ✅ Apply stored color
        })),
      })),
    };
  });
}
