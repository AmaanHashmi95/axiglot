import Link from "next/link";
import { getLesson } from "@/lib/lesson";
import LessonComponent from "@/app/(main)/components/lessons/LessonComponent";
import { notFound } from "next/navigation";
import { validateRequest } from "@/auth";
import BrowserWarning from "@/app/(main)/components/BrowserWarning";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;   // ⬅️ await the params

  const { user } = await validateRequest();
  if (!user) return notFound();

  const lesson = await getLesson(lessonId);
  if (!lesson || !lesson.questions) return notFound();

  const userId = user.id;

  return (
    <div className="container mx-auto px-4 pt-6">
      <BrowserWarning />
      <div className="mb-6 flex items-center space-x-4">
        <Link
          href={`/courses/${lesson.course?.id ?? courseId}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#ff8a00] to-[#ef2626] text-white hover:opacity-90"
          aria-label="Back"
        >
          ←
        </Link>
        <h2 className="text-xl font-semibold">
          {lesson.course?.title} - {lesson.title}
        </h2>
      </div>

      <LessonComponent lesson={lesson} userId={userId} />
    </div>
  );
}
