import LessonProgressSidebar from "@/app/(main)/components/LessonProgressSidebar";
import Feeds from "./feeds/Feeds";

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <Feeds />
      <LessonProgressSidebar />
    </main>
  );
}
