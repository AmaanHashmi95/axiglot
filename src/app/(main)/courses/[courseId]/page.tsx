import { getCourseWithLessons } from '@/lib/course';
import { QuestionType } from '@prisma/client'; // Import the enum
import Link from 'next/link';

// Define the types for lessons and course
interface Question {
  id: string;
  lessonId: string;
  type: QuestionType; // Use the imported enum
  content: string;
  audioUrl: string | null;
  options: string[];
  correctAnswer: string;
  language: string | null;
  hasTimer: boolean;
  createdAt: Date;
}

interface Lesson {
  id: string;
  title: string;
  language: string;
  questions: Question[];
}

interface Course {
  id: string;
  title: string;
  description?: string | null;
  lessons: Lesson[];
}

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const course: Course | null = await getCourseWithLessons(params.courseId);

  if (!course) {
    return <p>Course not found</p>;
  }

  return (
    <main className="flex w-full min-w-0 justify-center">
      <div className="w-full min-w-0 space-y-5 max-w-5xl">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p>{course.description || 'No description available.'}</p>

          <div className="lessons-list mt-6">
            <h2 className="text-2xl font-bold">Lessons</h2>
            <ul className="space-y-3">
              {course.lessons.map((lesson: Lesson) => (
                <li key={lesson.id} className="flex items-center justify-between">
                  <Link href={`/courses/${course.id}/${lesson.id}`} className="text-blue-500">
                    {lesson.title}
                  </Link>
                  <span className="text-gray-500">{lesson.language}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}