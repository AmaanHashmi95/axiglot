import { getLesson } from "@/lib/lesson";
import LessonComponent from "@/components/lessons/LessonComponent";
import { notFound } from "next/navigation";
import { validateRequest } from "@/auth"; // Import validateRequest for session validation

export default async function LessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  // Validate the user session and get the userId
  const { user } = await validateRequest();

  // Handle unauthenticated users
  if (!user) {
    return notFound(); // Or redirect to a login page
  }

  const userId = user.id; // Extract userId from the authenticated user
  const lesson = await getLesson(params.lessonId);

  // Handle invalid lessons
  if (!lesson || !lesson.questions) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <LessonComponent lesson={lesson} userId={userId} />
    </div>
  );
}
