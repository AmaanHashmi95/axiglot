import { getCourseWithLessons } from "@/lib/course";
import Link from "next/link";
import { validateRequest } from "@/auth";
import ProgressBar from "@/app/(main)/components/lessons/ProgressBar";
import Image from "next/image";
import india from "@/assets/india-flag.png";
import pakistan from "@/assets/pakistan-flag.png";
import iran from "@/assets/iran-flag.webp";
import blueTick from "@/assets/Blue Tick.png";
import LessonGroupAccordion from "@/app/(main)/components/lessons/LessonGroupAccordion";
import BrowserWarning from "@/app/(main)/components/BrowserWarning";

function getGradientClass(language?: string | null) {
  switch (language?.toLowerCase()) {
    case "punjabi":
      return "bg-gradient-to-r from-[#00bf63] to-[#ff8a00]";
    case "urdu":
      return "bg-gradient-to-r from-[#00605b] to-[#cfcfcf]";
    case "swahili":
      return "bg-gradient-to-r from-black via-red-500 to-[#00605b]";
    case "farsi":
      return "bg-gradient-to-r from-black via-red-500 to-[#00605b]";
    default:
      return "bg-card";
  }
}

function getFlagForLanguage(language?: string | null) {
  switch (language?.toLowerCase()) {
    case "punjabi":
      return { src: india, alt: "Punjabi Flag" };
    case "urdu":
      return { src: pakistan, alt: "Urdu Flag" };
    case "farsi":
      return { src: iran, alt: "Farsi Flag" };
    default:
      return null;
  }
}

export default async function CoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const { user } = await validateRequest();
  if (!user) return <div>You must be logged in to view this course.</div>;

  const course = await getCourseWithLessons(params.courseId, user.id);
  if (!course) return <div>Course not found</div>;

  const gradientClass = getGradientClass(course.language);
  const flag = getFlagForLanguage(course.language);

  return (
    <main className="flex w-full min-w-0 justify-center">
      <div className="w-full min-w-0 max-w-5xl space-y-5">
        <BrowserWarning />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center space-x-3">
            <h1 className="text-left text-2xl font-bold">{course.title}</h1>
            {flag && (
              <Image
                src={flag.src}
                alt={flag.alt}
                width={30}
                height={30}
                className="ml-3"
              />
            )}
            <span className="rounded bg-white px-2 py-1 text-lg font-bold text-[hsl(24,9.8%,10%)]">
              {course.courseProgress}%
            </span>
            <div className="flex-1">
              <ProgressBar progress={course.courseProgress} />
            </div>
          </div>
        </div>

        {/* Render grouped lessons */}
        {course.lessonGroups.map((group) => (
          <LessonGroupAccordion
            key={group.id}
            group={group}
            courseId={course.id}
            gradientClass={gradientClass}
          />
        ))}

        {/* Render ungrouped lessons */}
        {course.ungroupedLessons.length > 0 && (
          <div className={`rounded-2xl p-5 shadow-sm ${gradientClass}`}>
            <div className="mb-5 flex items-center">
              <h2 className="text-left text-2xl font-bold">
                Ungrouped Lessons
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {course.ungroupedLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/courses/${course.id}/${lesson.id}`}
                >
                  <div
                    className={`flex w-full cursor-pointer items-center justify-between rounded-2xl p-5 shadow-sm ${
                      lesson.completed
                        ? "border-4 border-[#00E2FF] bg-white text-black"
                        : "bg-white text-black"
                    }`}
                  >
                    <h3 className="text-left text-xl font-bold">
                      {lesson.title}
                    </h3>
                    {lesson.completed && (
                      <Image
                        src={blueTick}
                        alt="Completed"
                        width={20}
                        height={20}
                        className="ml-2"
                      />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
