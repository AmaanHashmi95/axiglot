import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function LessonProgressSidebar() {
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <LessonProgress />
      </Suspense>
    </div>
  );
}

async function LessonProgress() {
  const { user } = await validateRequest();
  if (!user) return null;

  // Fetch most recent active/incomplete lesson
  const latestLessonProgress = await prisma.lessonProgress.findFirst({
    where: { userId: user.id, completed: false },
    include: { lesson: { include: { course: true } } },
    orderBy: { createdAt: "desc" },
  });

  let nextLesson = null;

  // If no incomplete lesson, find the next one after the last completed lesson
  if (!latestLessonProgress) {
    const lastCompletedLesson = await prisma.lessonProgress.findFirst({
      where: { userId: user.id, completed: true },
      include: { lesson: { include: { course: true } } },
      orderBy: { createdAt: "desc" },
    });

    if (lastCompletedLesson) {
      nextLesson = await prisma.lesson.findFirst({
        where: {
          courseId: lastCompletedLesson.lesson.courseId,
          order: { gt: lastCompletedLesson.lesson.order },
        },
        orderBy: { order: "asc" },
      });
    }
  }

  // Fetch last watched video
  const lastWatchedVideo = await prisma.videoProgress.findFirst({
    where: { userId: user.id },
    include: { video: true },
    orderBy: { watchedAt: "desc" },
  });

  // Fetch last listened song
  const lastListenedSong = await prisma.musicProgress.findFirst({
    where: { userId: user.id },
    include: { song: true },
    orderBy: { listenedAt: "desc" },
  });

  // Fetch last read book
  const lastReadBook = await prisma.bookProgress.findFirst({
    where: { userId: user.id },
    include: { book: true },
    orderBy: { lastReadAt: "desc" },
  });

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Progress</div>

      {/* Lesson Progress */}
      {latestLessonProgress ? (
        <div className="border-t pt-3">
          <p className="font-semibold">Last Active Lesson</p>
          <Link href={`/courses/${latestLessonProgress.lesson.courseId}/${latestLessonProgress.lesson.id}`} className="block">
            <p className="line-clamp-1 break-all font-semibold hover:underline">
              {latestLessonProgress.lesson.title}
            </p>
            <p className="text-sm text-muted-foreground">Continue lesson</p>
          </Link>
        </div>
      ) : nextLesson ? (
        <div className="border-t pt-3">
          <p className="font-semibold">Next Lesson</p>
          <Link href={`/courses/${nextLesson.courseId}/${nextLesson.id}`} className="block">
            <p className="line-clamp-1 break-all font-semibold hover:underline">{nextLesson.title}</p>
            <p className="text-sm text-muted-foreground">Start next lesson</p>
          </Link>
        </div>
      ) : null}

      {/* Last Watched Video */}
      {lastWatchedVideo && (
        <div className="border-t pt-3">
          <p className="font-semibold">Last Watched Video</p>
          <Link href={`/tv?videoId=${lastWatchedVideo.video.id}`} className="block">
            <p className="line-clamp-1 break-all font-semibold hover:underline">{lastWatchedVideo.video.title}</p>
            <p className="text-sm text-muted-foreground">Continue watching</p>
          </Link>
        </div>
      )}

      {/* Last Listened Song */}
      {lastListenedSong && (
        <div className="border-t pt-3">
          <p className="font-semibold">Last Played Song</p>
          <Link href={`/music-lyrics?songId=${lastListenedSong.song.id}`} className="block">
            <p className="line-clamp-1 break-all font-semibold hover:underline">{lastListenedSong.song.title}</p>
            <p className="text-sm text-muted-foreground">Continue listening</p>
          </Link>
        </div>
      )}

      {/* Last Read Book */}
      {lastReadBook && (
        <div className="border-t pt-3">
          <p className="font-semibold">Last Read Book</p>
          <Link href={`/reading?bookId=${lastReadBook.book.id}&page=${lastReadBook.pageNumber}`} className="block">
            <p className="line-clamp-1 break-all font-semibold hover:underline">{lastReadBook.book.title}</p>
            <p className="text-sm text-muted-foreground">Continue reading (Page {lastReadBook.pageNumber + 1})</p>
          </Link>
        </div>
      )}

      {/* No Progress Message */}
      {!latestLessonProgress && !nextLesson && !lastWatchedVideo && !lastListenedSong && !lastReadBook && (
        <p className="text-muted-foreground">No progress available.</p>
      )}
    </div>
  );
}
