"use client";

import { Bookmark } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ky from "@/lib/ky";

interface Props {
  sourceText: string;
  translatedText: string;
  transliteration: string;
  language: string;
  words: any[];
}

interface TranslatorBookmark {
  id: string;
  sourceText: string;
  translatedText: string;
  transliteration: string;
  language?: string;
  words: any[];
}

export default function TranslatorBookmarkButton({
  sourceText,
  translatedText,
  transliteration,
  language,
  words,
}: Props) {
  const { toast } = useToast();
  const queryKey = ["translator-bookmarks"];
  const queryClient = useQueryClient();

  const { data: bookmarks = [], refetch } = useQuery<TranslatorBookmark[]>({
    queryKey,
    queryFn: () => ky.get("/api/translator-bookmarks").json(),
  });

  const existing = bookmarks.find(
    (b: any) => b.sourceText === sourceText && b.language === language,
  );

  const { mutate } = useMutation({
    mutationFn: async () => {
      if (existing) {
        await ky.delete("/api/translator-bookmarks", {
          json: { id: existing.id },
        });
      } else {
        await ky.post("/api/translator-bookmarks", {
          json: {
            sourceText,
            translatedText,
            transliteration,
            language,
            words,
          },
        });
      }
    },
    onSuccess: () => {
      toast({ description: `Translation ${existing ? "un" : ""}bookmarked` });
      refetch();
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Bookmark
        className={`size-5 ${existing ? "fill-[#00E2FF] text-[#00E2FF]" : "text-[#00E2FF]"}`}
      />
    </button>
  );
}
