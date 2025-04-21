import { Bookmark } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ky from "@/lib/ky";
import { useToast } from "@/app/(main)/components/ui/use-toast";

interface Props {
  bookId: string;
  sentenceId: string;
  text: string;
  translation: string;
  transliteration: string;
  language?: string;
}

interface BookmarkData {
  id: string;
  sentenceId: string;
  bookId: string;
}

export default function ReadingBookmarkButton({
  bookId,
  sentenceId,
  text,
  translation,
  transliteration,
  language,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["reading-bookmarks"];

  const { data: bookmarks = [], refetch } = useQuery<BookmarkData[]>({
    queryKey,
    queryFn: () => ky.get("/api/reading-bookmarks").json(),
  });

  const existing = bookmarks.find(
    (b) => b.bookId === bookId && b.sentenceId === sentenceId
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      return await ky.post("/api/reading-bookmarks", {
        json: {
          bookId,
          sentenceId,
          text,
          translation,
          transliteration,
          language,
        },
      });
    },
    onSuccess: () => {
      toast({ description: "Sentence bookmarked" });
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await ky.delete("/api/reading-bookmarks", {
        json: { id: existing?.id },
      });
    },
    onSuccess: () => {
      toast({ description: "Bookmark removed" });
      refetch();
    },
  });

  const handleClick = () => {
    if (existing) {
      deleteMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const isBookmarked = Boolean(existing);

  return (
    <button onClick={handleClick} className="flex items-center gap-2">
      <Bookmark
        className={`size-5 ${isBookmarked ? "fill-primary text-primary" : ""}`}
      />
    </button>
  );
}
