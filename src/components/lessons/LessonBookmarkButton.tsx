"use client";

import kyInstance from "@/lib/ky";
import { Bookmark } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";

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
}

interface BookmarkButtonProps {
  lessonId: string;
  questionId: string;
  words: Word[];
  translations: Translation[];
}

export default function LessonBookmarkButton({ lessonId, questionId, words, translations }: BookmarkButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["lesson-bookmarks"];

  // ✅ Explicitly define the query return type
  const { data: bookmarks = [], refetch } = useQuery<LessonBookmark[]>({
    queryKey,
    queryFn: async () => kyInstance.get("/api/lesson-bookmarks").json(),
  });

  // ✅ Ensure 'b' has an explicit type
  const isBookmarked = bookmarks.some((b: LessonBookmark) => b.questionId === questionId);

  const { mutate } = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await kyInstance.delete("/api/lesson-bookmarks", { json: { lessonId, questionId } });
      } else {
        await kyInstance.post("/api/lesson-bookmarks", { json: { lessonId, questionId, words, translations } });
      }
    },
    onMutate: async () => {
      toast({ description: `Question ${isBookmarked ? "un" : ""}bookmarked` });
      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData(queryKey, (old: LessonBookmark[] | undefined) =>
        old
          ? isBookmarked
            ? old.filter((b) => b.questionId !== questionId)
            : [...old, { id: questionId, lessonId, questionId, words, translations }]
          : []
      );
    },
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Bookmark className={`size-5 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
    </button>
  );
}
