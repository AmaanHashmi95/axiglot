import prisma from '@/lib/prisma';

export async function getCourseWithLessons(courseId: string) {
  return await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: { include: { questions: true } } }, // Include lessons and their questions
  });
}
