import TrendsSidebar from "@/components/TrendsSidebar";
import Feeds from "./Feeds"; // ✅ Import Feeds (Client Component)

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <Feeds /> {/* ✅ Only this client component manages state */}
      <TrendsSidebar />
    </main>
  );
}
