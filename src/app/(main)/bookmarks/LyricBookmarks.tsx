"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { useRef } from "react";
import AudioRecorder from "@/components/ui/AudioRecorder";
import { Volume2, Bookmark } from "lucide-react";

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

  const { data: allBookmarks = [], status } = useQuery<LyricBookmark[]>({
    queryKey,
    queryFn: () => kyInstance.get("/api/lyric-bookmarks").json(),
  });

  const { mutate } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await kyInstance.delete("/api/lyric-bookmarks", { json: { id } });
    },
    onMutate: async ({ id }) => {
      queryClient.setQueryData(
        queryKey,
        (old: LyricBookmark[] | undefined) =>
          old?.filter((b) => b.id !== id) || []
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

  const bookmarks = selectedLanguage === "All Languages"
    ? allBookmarks
    : allBookmarks.filter(
        (b) => b.language?.toLowerCase() === selectedLanguage.toLowerCase()
      );

  return (
    <div className="space-y-5">
      <audio ref={audioRef} />
      {status === "pending" ? (
        <p>Loading...</p>
      ) : bookmarks.length > 0 ? (
        bookmarks.map((b) => {
          const first = b.sentences[0];
          return (
            <div key={b.id} className="rounded border p-4 shadow space-y-3">
              <p className="text-sm text-gray-500">Song: {b.song.title}</p>
              <p className="text-sm text-gray-100">{first.text}</p>
              {first.bookmarkedEnglish && (
                <p className="text-sm text-gray-100">{first.bookmarkedEnglish}</p>
              )}
              {first.bookmarkedTransliteration && (
                <p className="text-sm text-gray-100">{first.bookmarkedTransliteration}</p>
              )}
              <button
                className="btn btn-outline btn-xs flex items-center gap-2"
                onClick={() => playAudio(first.audioUrl)}
              >
              </button>
              <AudioRecorder audioUrl={first.audioUrl} />
              <button onClick={() => mutate({ id: b.id })}>
                <Bookmark className="fill-[#00E2FF] text-[#00E2FF] mt-4" />
              </button>
            </div>
          );
        })
      ) : (
        <p className="text-center">No lyric bookmarks found.</p>
      )}
    </div>
  );
}
