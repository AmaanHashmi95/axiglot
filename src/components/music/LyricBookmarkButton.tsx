"use client";

import kyInstance from "@/lib/ky";
import { Bookmark } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";

interface Word {
  id: string;
  text: string;
  transliteration?: string;
  audioUrl?: string;
}

interface Translation {
  id: string;
  text: string;
}

interface Props {
  songId: string;
  sentenceIds: string[];
  words: Word[];
  translations: Translation[];
  audioUrl: string;
}

interface LyricBookmark {
  id: string;
  songId: string;
  sentenceIds: string[];
}

export default function LyricBookmarkButton({
  songId,
  sentenceIds,
  words,
  translations,
  audioUrl,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["lyric-bookmarks"];

  const { data: bookmarks = [], refetch } = useQuery<LyricBookmark[]>({
    queryKey,
    queryFn: () => kyInstance.get("/api/lyric-bookmarks").json(),
  });

  const bookmarkMatch = bookmarks.find((b) =>
    sentenceIds.every((id) => b.sentenceIds.includes(id)),
  );
  const isBookmarked = !!bookmarkMatch;

  const { mutate } = useMutation({
    mutationFn: async () => {
      if (isBookmarked && bookmarkMatch) {
        await kyInstance.delete("/api/lyric-bookmarks", {
          json: { id: bookmarkMatch.id },
        });
      } else {
        await kyInstance.post("/api/lyric-bookmarks", {
          json: { songId, sentenceIds, words, translations, audioUrl },
        });
      }
    },
    onMutate: async () => {
      toast({
        description: `Lyric ${isBookmarked ? "un" : ""}bookmarked`,
      });
      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData(queryKey, (old: LyricBookmark[] | undefined) =>
        old
          ? isBookmarked
            ? old.filter((b) => b.id !== bookmarkMatch?.id)
            : [
                ...old,
                {
                  id: crypto.randomUUID(),
                  songId,
                  sentenceIds,
                },
              ]
          : [],
      );
    },
    onSuccess: () => refetch(),
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Bookmark
        className="size-5"
        style={{
          fill: isBookmarked ? "#00E2FF" : "none",
          color: "#00E2FF",
        }}
      />
    </button>
  );
}
