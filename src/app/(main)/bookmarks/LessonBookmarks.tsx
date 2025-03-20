"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Loader2, Bookmark } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Word {
  id: string;
  text: string;
  color: string;
  transliteration?: string;
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
}

export default function LessonBookmarks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["lesson-bookmarks"];

  const { data: bookmarks = [], status } = useQuery<LessonBookmark[]>({
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

  // 🔹 Track which transliteration is active
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [lastClickedWord, setLastClickedWord] = useState<string | null>(null);

  const handleMouseEnter = (wordId: string) => {
    if (!lastClickedWord) {
      setActiveWordId(wordId);
    }
  };

  const handleMouseLeave = (wordId: string) => {
    if (lastClickedWord !== wordId) {
      setActiveWordId(null);
    }
  };

  const handleWordClick = (wordId: string) => {
    if (activeWordId === wordId) {
      return;
    }
    setLastClickedWord(wordId);
    setActiveWordId(wordId);
  };

  // Close transliteration on outside click
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

  return (
    <div className="space-y-5">
      {status === "pending" ? (
        <Loader2 className="mx-auto my-3 animate-spin" />
      ) : bookmarks.length > 0 ? (
        bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="p-4 border rounded-lg shadow">
            <p className="text-sm text-gray-500">Lesson: {bookmark.lesson.title}</p>

            {/* Sentence Words with Transliterations on Hover/Click */}
            <div className="text-lg">
              {bookmark.words.map((word) => (
                <span
                  key={word.id}
                  style={{ color: word.color }}
                  className="word-container relative mx-1 cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(word.id)}
                  onMouseLeave={() => handleMouseLeave(word.id)}
                  onClick={() => handleWordClick(word.id)}
                >
                  {/* Show transliteration only when hovered/clicked */}
                  {activeWordId === word.id && word.transliteration && (
                    <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm text-white shadow-lg transition-opacity duration-200 ease-in-out">
                      {word.transliteration}
                    </span>
                  )}
                  {word.text}
                </span>
              ))}
            </div>

            {/* Display translations beneath words */}
            {bookmark.translations.length > 0 && (
              <div className="mt-2 text-gray-800">
                {bookmark.translations.map((translation) => (
                  <span key={translation.id} style={{ color: translation.color }} className="mx-1">
                    {translation.text}
                  </span>
                ))}
              </div>
            )}

            <button onClick={() => mutate({ lessonId: bookmark.lessonId, questionId: bookmark.questionId })}>
              <Bookmark className="text-red-500" />
            </button>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground">No lesson bookmarks found.</p>
      )}
    </div>
  );
}
