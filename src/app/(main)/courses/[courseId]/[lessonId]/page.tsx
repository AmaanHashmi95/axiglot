import { getLesson } from '@/lib/lesson';
import LessonComponent from '@/components/lessons/LessonComponent';
import { notFound } from 'next/navigation';

export default async function LessonPage({ params }: { params: { lessonId: string } }) {
  const lesson = await getLesson(params.lessonId);

  if (!lesson) return notFound();

  return (
    <div className="container mx-auto p-6">
      <LessonComponent lesson={lesson} />
    </div>
  );
}