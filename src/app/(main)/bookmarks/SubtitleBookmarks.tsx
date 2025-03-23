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

interface SubtitleBookmark {
  id: string;
  videoId: string;
  sentenceIds: string[];
  audioUrl: string;
  language: string; // ✅ Flattened field from video
  video: { title: string };
  sentences: Sentence[];
}

export default function SubtitleBookmarks({ selectedLanguage }: Props) {
  const queryKey = ["subtitle-bookmarks"];
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: allBookmarks = [], status } = useQuery<SubtitleBookmark[]>({
    queryKey,
    queryFn: () => kyInstance.get("/api/subtitle-bookmarks").json(),
  });

  const { mutate } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await kyInstance.delete("/api/subtitle-bookmarks", { json: { id } });
    },
    onMutate: async ({ id }) => {
      queryClient.setQueryData(
        queryKey,
        (old: SubtitleBookmark[] | undefined) =>
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

  const bookmarks = selectedLanguage === "All Languages"
    ? allBookmarks
    : allBookmarks.filter(
        (b: SubtitleBookmark) =>
          b.language?.toLowerCase() === selectedLanguage.toLowerCase(),
      );

  return (
    <div className="space-y-5">
      <audio ref={audioRef} />
      {status === "pending" ? (
        <p>Loading...</p>
      ) : bookmarks.length > 0 ? (
        bookmarks.map((b: SubtitleBookmark) => {
          const first = b.sentences[0];

          return (
            <div key={b.id} className="rounded border p-4 shadow space-y-3">
              <p className="text-sm text-gray-500">Video: {b.video.title}</p>
              <p className="text-sm text-gray-700">{first.text}</p>
              {first.bookmarkedEnglish && (
                <p className="text-sm text-gray-500">{first.bookmarkedEnglish}</p>
              )}
              {first.bookmarkedTransliteration && (
                <p className="text-sm italic text-gray-400">
                  {first.bookmarkedTransliteration}
                </p>
              )}

              <button
                className="btn btn-outline btn-xs flex items-center gap-2"
                onClick={() => playAudio(first.audioUrl)}
              >
                <Volume2 className="w-4 h-4" /> Play
              </button>

              <AudioRecorder audioUrl={first.audioUrl} />

              <button onClick={() => mutate({ id: b.id })}>
                <Bookmark className="text-red-500" />
              </button>
            </div>
          );
        })
      ) : (
        <p className="text-center">No subtitle bookmarks found.</p>
      )}
    </div>
  );
}
