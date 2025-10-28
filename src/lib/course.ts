import prisma from "@/lib/prisma";

type CourseReturn = {
  id: string;
  title: string;
  description: string | null;
  language: string | null;
  courseProgress: number;
  lessonGroups: Array<{
    id: string;
    title: string;
    order: number;
    completed: boolean;
    lessons: Array<{ id: string; title: string; completed: boolean }>;
  }>;
  ungroupedLessons: Array<{ id: string; title: string; completed: boolean }>;
};

export async function getCourseWithLessons(courseId: string, userId: string): Promise<CourseReturn | null> {
  // 1) Load course + lessons WITHOUT any per-lesson progress include
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessonGroups: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              // keep only what the page needs
            },
          },
        },
      },
      lessons: {
        where: { lessonGroupId: null },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!course) return null;

  // 2) Collect all lesson ids
  const groupedIds = course.lessonGroups.flatMap(g => g.lessons.map(l => l.id));
  const ungroupedIds = course.lessons.map(l => l.id);
  const allLessonIds = [...groupedIds, ...ungroupedIds];

  // Short-circuit
  if (allLessonIds.length === 0) {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      language: course.language,
      courseProgress: 0,
      lessonGroups: course.lessonGroups.map(g => ({
        id: g.id,
        title: g.title,
        order: g.order,
        completed: false,
        lessons: g.lessons.map(l => ({ id: l.id, title: l.title, completed: false })),
      })),
      ungroupedLessons: [],
    };
  }

  // 3) Bulk fetch user progress once
  const progressRows = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: allLessonIds } },
    select: { lessonId: true, completed: true },
  });

  const completedSet = new Set(progressRows.filter(p => p.completed).map(p => p.lessonId));

  // 4) Compute derived fields
  const totalLessons = allLessonIds.length;
  const completedLessons = completedSet.size;
  const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // 5) Build the same shape your page expects
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    language: course.language,
    courseProgress,
    lessonGroups: course.lessonGroups.map(group => {
      const lessons = group.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        completed: completedSet.has(lesson.id),
      }));
      const completed = lessons.length > 0 && lessons.every(l => l.completed);
      return {
        id: group.id,
        title: group.title,
        order: group.order,
        completed,
        lessons,
      };
    }),
    ungroupedLessons: course.lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      completed: completedSet.has(lesson.id),
    })),
  };
}
