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
  audioUrl?: string;
}

interface Translation {
  id: string;
  text: string;
  color: string;
}

interface SubtitleBookmark {
  id: string;
  videoId: string;
  sentenceIds: string[];
  words: Word[];
  translations: Translation[];
  audioUrl: string;
}

interface Props {
  videoId: string;
  sentenceIds: string[];
  words: Word[];
  translations: Translation[];
  audioUrl: string;
}

export default function SubtitleBookmarkButton({ videoId, sentenceIds, words, translations, audioUrl }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["subtitle-bookmarks"];

  const { data: bookmarks = [], refetch } = useQuery<SubtitleBookmark[]>({
    queryKey,
    queryFn: async () => kyInstance.get("/api/subtitle-bookmarks").json(),
  });

  const bookmarkMatch = bookmarks.find((b) =>
    sentenceIds.every((id) => b.sentenceIds.includes(id))
  );
  
  const isBookmarked = Boolean(bookmarkMatch);
  

  const { mutate } = useMutation({
    mutationFn: async () => {
        if (isBookmarked && bookmarkMatch) {
          await kyInstance.delete("/api/subtitle-bookmarks", { json: { id: bookmarkMatch.id } });
        } else {
          await kyInstance.post("/api/subtitle-bookmarks", {
            json: { videoId, sentenceIds, words, translations, audioUrl },
          });
        }
      },
      onMutate: async () => {
        toast({ description: `Subtitle ${isBookmarked ? "un" : ""}bookmarked` });
        await queryClient.cancelQueries({ queryKey });
      
        queryClient.setQueryData(queryKey, (old: SubtitleBookmark[] | undefined) =>
          old
            ? isBookmarked
              ? old.filter((b) => b.id !== bookmarkMatch?.id)
              : [...old, {
                  id: crypto.randomUUID(), // Fake ID for optimistic update
                  videoId,
                  sentenceIds,
                  words,
                  translations,
                  audioUrl
                }]
            : []
        );
      },
    onSuccess: () => refetch(),
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Bookmark className={`size-5 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
    </button>
  );
}