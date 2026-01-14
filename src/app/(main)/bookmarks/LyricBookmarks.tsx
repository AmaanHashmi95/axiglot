"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { useRef } from "react";
import AudioRecorder from "@/app/(main)/components/ui/AudioRecorder";
import { Volume2, Bookmark, Loader2 } from "lucide-react";
import { useInfiniteBookmarks } from "@/hooks/useInfiniteBookmarks";

interface Props {
  selectedLanguage: string;
}

interface Sentence {
  id: string;
  text: string;
  bookmarkedEnglish: string;
  bookmarkedTransliteration: string;
  audioUrl: string;
}

interface LyricBookmark {
  id: string;
  songId: string;
  sentenceIds: string[];
  audioUrl: string;
  language: string;
  song: { title: string };
  sentences: Sentence[];
}

export default function LyricBookmarks({ selectedLanguage }: Props) {
  const queryKey = ["lyric-bookmarks"];
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteBookmarks<LyricBookmark>("lyric-bookmarks", selectedLanguage);

  const allBookmarks = data?.pages.flat() || [];

  const { mutate } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await kyInstance.delete("/api/lyric-bookmarks", { json: { id } });
    },
    onMutate: async ({ id }) => {
      queryClient.setQueryData(
        queryKey,
        (old: LyricBookmark[] | undefined) =>
          old?.filter((b) => b.id !== id) || [],
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const playAudio = (url: string) => {
    if (audioRef.current && url) {
      audioRef.current.src = url;
      audioRef.current.play().catch(console.error);
    }
  };

  const bookmarks =
    selectedLanguage === "All Languages"
      ? allBookmarks
      : allBookmarks.filter(
          (b) => b.language?.toLowerCase() === selectedLanguage.toLowerCase(),
        );

  return (
    <div className="space-y-5">
      <audio ref={audioRef} />
      {status === "pending" ? (
        <Loader2 className="mx-auto my-3 animate-spin" />
      ) : bookmarks.length > 0 ? (
        bookmarks.map((b) => {
          const first = b.sentences[0];
          return (
            <div key={b.id} className="space-y-3 rounded border p-4 shadow">
              <p className="text-sm text-gray-500">Song: {b.song.title}</p>
              <p className="text-sm text-gray-100">{first.text}</p>
              {first.bookmarkedEnglish && (
                <p className="text-sm text-gray-100">
                  {first.bookmarkedEnglish}
                </p>
              )}
              {first.bookmarkedTransliteration && (
                <p className="text-sm text-gray-100">
                  {first.bookmarkedTransliteration}
                </p>
              )}
              <button onClick={() => mutate({ id: b.id })}>
                <Bookmark className="mt-4 fill-[#00E2FF] text-[#00E2FF]" />
              </button>
            </div>
          );
        })
      ) : (
        <p className="text-center">No lyric bookmarks found.</p>
      )}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full rounded border py-2 text-center shadow hover:bg-gray-600"
        >
          {isFetchingNextPage ? "Loading more..." : "Load more"}
        </button>
      )}
    </div>
  );
}
