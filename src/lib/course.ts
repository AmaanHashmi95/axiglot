import prisma from '@/lib/prisma';

export async function getCourseWithLessons(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        include: {
          questions: true,
          progress: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!course) return null;

  // Calculate the average progress for the course
  const totalLessons = course.lessons.length;
  const totalProgress = course.lessons.reduce((sum, lesson) => {
    const progress = lesson.progress.length ? lesson.progress[0].progress : 0;
    return sum + progress;
  }, 0);

  const courseProgress = totalLessons > 0 ? Math.round(totalProgress / totalLessons) : 0;

  return {
    ...course,
    courseProgress, // Add course completion percentage
    lessons: course.lessons.map((lesson) => ({
      ...lesson,
      progress: lesson.progress.length ? lesson.progress[0].progress : 0,
    })),
  };
}

