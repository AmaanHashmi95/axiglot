import prisma from '@/lib/prisma';

export async function getCourseWithLessons(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessonGroups: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              progress: {
                where: { userId },
              },
            },
          },
        },
      },
      lessons: {
        where: { lessonGroupId: null },
        orderBy: { order: 'asc' },
        include: {
          progress: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!course) return null;

  const allLessons = [
    ...course.lessons,
    ...course.lessonGroups.flatMap(group => group.lessons),
  ];

  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter(
    (lesson) => lesson.progress.length && lesson.progress[0].completed
  ).length;

  const courseProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      language: course.language,
      courseProgress,
      lessonGroups: course.lessonGroups.map((group) => {
        const lessons = group.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          completed: lesson.progress.length > 0 && lesson.progress[0].completed,
        }));
  
        const completed = lessons.every((lesson) => lesson.completed);
  
        return {
          id: group.id,
          title: group.title,
          order: group.order,
          completed,
          lessons,
        };
      }),
      ungroupedLessons: course.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        completed: lesson.progress.length > 0 && lesson.progress[0].completed,
      })),
    };
  }