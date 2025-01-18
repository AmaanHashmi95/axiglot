import prisma from '@/lib/prisma';

export async function getCourseWithLessons(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        include: {
          questions: true, // Include questions to match the Lesson type
          progress: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!course) return null;

  return {
    ...course,
    lessons: course.lessons.map((lesson) => ({
      ...lesson,
      progress: lesson.progress.length ? lesson.progress[0].progress : 0, // Add progress
    })),
  };
}
