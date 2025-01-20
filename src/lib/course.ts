import prisma from '@/lib/prisma';

export async function getCourseWithLessons(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        include: {
          progress: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!course) return null;

  // Calculate the course progress
  const totalLessons = course.lessons.length;
  const completedLessons = course.lessons.filter(
    (lesson) => lesson.progress.length && lesson.progress[0].completed
  ).length;

  const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    ...course,
    lessons: course.lessons.map((lesson) => ({
      ...lesson,
      completed: lesson.progress.length ? lesson.progress[0].completed : false, // Include completion status
    })),
    courseProgress, // Include the calculated course progress
  };
}

