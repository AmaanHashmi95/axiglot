// src/app/(main)/search/page.tsx
import { Metadata } from "next";
import SearchResults from "./SearchResults";

type SearchParams = { q?: string };

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<SearchParams> }
): Promise<Metadata> {
  const { q = "" } = await searchParams; // ← await
  return {
    title: `Search results for "${q}"`,
  };
}

export default async function Page(
  { searchParams }: { searchParams: Promise<SearchParams> }
) {
  const { q = "" } = await searchParams; // ← await
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="line-clamp-2 break-all text-center text-2xl font-bold">
            Search results for &quot;{q}&quot;
          </h1>
        </div>
        <SearchResults query={q} />
      </div>
    </main>
  );
}
