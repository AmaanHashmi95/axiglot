import PostEditor from "@/components/posts/editor/PostEditor";
import TrendsSidebar from "@/components/TrendsSidebar";
import FeedSelector from "@/components/FeedSelector";

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        <FeedSelector />
      </div>
      <TrendsSidebar />
    </main>
  );
}
