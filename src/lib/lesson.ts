import prisma from "@/lib/prisma";

export async function getLesson(lessonId: string) {
  return await prisma.lesson
    .findUnique({
      where: { id: lessonId },
      include: {
        course: { select: { id: true, title: true } }, // ✅ Add this
        questions: {
          orderBy: { questionOrder: "asc" },
          include: {
            words: {
              orderBy: { order: "asc" },
              select: {
                word: {
                  select: {
                    id: true,
                    text: true,
                    audioUrl: true,
                    transliteration: true,
                  },
                },
                color: true,
              },
            },
            translations: {
              orderBy: { order: "asc" },
              select: {
                translation: {
                  select: {
                    id: true,
                    text: true,
                    language: true,
                  },
                },
                color: true,
              },
            },
          },
        },
      },
    })
    .then((lesson) => {
      if (!lesson) return null;

      return {
        ...lesson,
        course: lesson.course,
        questions: lesson.questions.map((q: any) => ({
          ...q,
          words: q.words.map((qw: any) => ({
            id: qw.word.id,
            text: qw.word.text,
            color: qw.color,
            audioUrl: qw.word.audioUrl ?? undefined,
            transliteration: qw.word.transliteration ?? "",
          })),
          translations: q.translations.map((qt: any) => ({
            id: qt.translation.id,
            text: qt.translation.text,
            color: qt.color,
          })),
        })),
      };
    });
}
