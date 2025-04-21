"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Loader2, Bookmark, Volume2 } from "lucide-react";
import { useToast } from "@/app/(main)/components/ui/use-toast";
import AudioRecorder from "@/app/(main)/components/ui/AudioRecorder";

interface Word {
  id: string;
  text: string;
  color: string;
  transliteration?: string;
  audioUrl?: string;
}

interface Translation {
  id: string;
  text: string;
  color: string;
}

interface LessonBookmark {
  id: string;
  lessonId: string;
  questionId: string;
  words: Word[];
  translations: Translation[];
  lesson: { title: string };
  question: { audioUrl?: string | null; language?: string | null };
}

interface LessonBookmarksProps {
  selectedLanguage: string;
}

export default function LessonBookmarks({ selectedLanguage }: LessonBookmarksProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["lesson-bookmarks"];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: allBookmarks = [], status } = useQuery<LessonBookmark[]>({
    queryKey,
    queryFn: () => kyInstance.get("/api/lesson-bookmarks").json(),
  });

  const { mutate } = useMutation({
    mutationFn: async ({ lessonId, questionId }: { lessonId: string; questionId: string }) => {
      await kyInstance.delete("/api/lesson-bookmarks", { json: { lessonId, questionId } });
    },
    onMutate: async ({ lessonId, questionId }) => {
      toast({ description: "Bookmark removed" });
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, (old: LessonBookmark[] | undefined) =>
        old ? old.filter((b) => !(b.lessonId === lessonId && b.questionId === questionId)) : []
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [lastClickedWord, setLastClickedWord] = useState<string | null>(null);

  const handleMouseEnter = (wordInstanceId: string) => {
    if (!lastClickedWord) {
      setActiveWordId(wordInstanceId);
    }
  };

  const handleMouseLeave = (wordInstanceId: string) => {
    if (lastClickedWord !== wordInstanceId) {
      setActiveWordId(null);
    }
  };

  const handleWordClick = (wordInstanceId: string, audioUrl?: string) => {
    setLastClickedWord(wordInstanceId);
    setActiveWordId(wordInstanceId);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => console.error("Audio playback failed:", error));
    }
  };

  const handlePlayQuestionAudio = (audioUrl: string | null | undefined) => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch((error) => console.error("Audio playback failed:", error));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!(event.target as HTMLElement).closest(".word-container")) {
        setActiveWordId(null);
        setLastClickedWord(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const bookmarks = selectedLanguage === "All Languages"
    ? allBookmarks
    : allBookmarks.filter(
        (b) => b.question.language?.toLowerCase() === selectedLanguage.toLowerCase()
      );

  return (
    <div className="space-y-5">
      <audio ref={audioRef} />
      {status === "pending" ? (
        <Loader2 className="mx-auto my-3 animate-spin" />
      ) : bookmarks.length > 0 ? (
        bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="p-4 border rounded-lg shadow">
            <p className="text-sm text-gray-500">Lesson: {bookmark.lesson.title}</p>
            <div className="text-lg">
              {bookmark.words.map((word, index) => {
                const wordInstanceId = `${bookmark.id}-${word.id}-${index}`;
                return (
                  <span
                    key={wordInstanceId}
                    style={{ color: word.color }}
                    className="word-container relative mx-1 cursor-pointer"
                    onMouseEnter={() => handleMouseEnter(wordInstanceId)}
                    onMouseLeave={() => handleMouseLeave(wordInstanceId)}
                    onClick={() => handleWordClick(wordInstanceId, word.audioUrl)}
                  >
                    {activeWordId === wordInstanceId && word.transliteration && (
                      <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm text-white shadow-lg transition-opacity duration-200 ease-in-out">
                        {word.transliteration}
                      </span>
                    )}
                    {word.text}
                  </span>
                );
              })}
            </div>
            {bookmark.translations.length > 0 && (
              <div className="mt-2 text-gray-800">
                {bookmark.translations.map((translation) => (
                  <span
                    key={translation.id}
                    style={{ color: translation.color }}
                    className="mx-1"
                  >
                    {translation.text}
                  </span>
                ))}
              </div>
            )}
            {bookmark.question.audioUrl && (
              <div className="mt-4 flex flex-col gap-2 left-1">
                <AudioRecorder audioUrl={bookmark.question.audioUrl} />
              </div>
            )}
            <button
              onClick={() =>
                mutate({ lessonId: bookmark.lessonId, questionId: bookmark.questionId })
              }
            >
              <Bookmark className="fill-[#00E2FF] text-[#00E2FF] mt-4" />
            </button>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground">No lesson bookmarks found.</p>
      )}
    </div>
  );
}
