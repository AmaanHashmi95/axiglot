import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Bookmark, Trash2 } from "lucide-react";

interface Props {
  selectedLanguage: string;
}

interface ReadingBookmark {
  id: string;
  bookId: string;
  sentenceId: string;
  text: string;
  translation: string;
  transliteration: string;
  language?: string;
  book: { title: string };

  // ✅ Add these three optional fields from the sentence query
  sentenceText?: string;
  sentenceTranslation?: string;
  sentenceTransliteration?: string;

  words?: {
    id: string;
    translation?: string;
    transliteration?: string;
    color?: string;
    word: { text: string };
    translationOrder?: number;
    transliterationOrder?: number;
  }[];
}

export default function ReadingBookmarks({ selectedLanguage }: Props) {
  const queryKey = ["reading-bookmarks"];
  const queryClient = useQueryClient();

  const { data: allBookmarks = [], status } = useQuery<ReadingBookmark[]>({
    queryKey,
    queryFn: () => kyInstance.get("/api/reading-bookmarks").json(),
  });

  const { mutate } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await kyInstance.delete("/api/reading-bookmarks", { json: { id } });
    },
    onMutate: async ({ id }) => {
      queryClient.setQueryData(
        queryKey,
        (old: ReadingBookmark[] | undefined) =>
          old?.filter((b) => b.id !== id) || [],
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const bookmarks =
    selectedLanguage === "All Languages"
      ? allBookmarks
      : allBookmarks.filter(
          (b) => b.language?.toLowerCase() === selectedLanguage.toLowerCase(),
        );

  return (
    <div className="space-y-5">
      {status === "pending" ? (
        <p>Loading...</p>
      ) : bookmarks.length > 0 ? (
        bookmarks.map((b) => (
          <div key={b.id} className="space-y-3 rounded border p-4 shadow">
            <p className="text-sm text-gray-500">Book: {b.book.title}</p>
            <p className="flex flex-wrap text-sm leading-relaxed text-gray-800">
              {b.words?.map((w, i) => {
                const isPunctuation = /^[.,!?;:"'()\-—]+$/.test(w.word.text);
                const isEndOfSentence = /[.!?]+$/.test(w.word.text);

                return (
                  <span key={w.id} className="flex items-center">
                    {i > 0 && !isPunctuation && <>&nbsp;</>}
                    <span style={{ color: w.color || "#000" }}>
                      {w.word.text}
                    </span>
                    {isEndOfSentence && <>&nbsp;</>}
                  </span>
                );
              })}
            </p>

            <p className="text-sm text-gray-600">
              <strong>Translation:</strong>{" "}
              {b.words
                ?.slice()
                .sort(
                  (a, b) =>
                    (a.translationOrder ?? 0) - (b.translationOrder ?? 0),
                )
                .map((w, i) => (
                  <span key={w.id} style={{ color: w.color || "#000" }}>
                    {i > 0 ? " " : ""}
                    {w.translation}
                  </span>
                ))}
            </p>

            <p className="text-sm italic text-gray-500">
              <strong>Transliteration:</strong>{" "}
              {b.words
                ?.slice()
                .sort(
                  (a, b) =>
                    (a.transliterationOrder ?? 0) -
                    (b.transliterationOrder ?? 0),
                )
                .map((w, i) => (
                  <span key={w.id} style={{ color: w.color || "#000" }}>
                    {i > 0 ? " " : ""}
                    {w.transliteration}
                  </span>
                ))}
            </p>

            <button
              onClick={() => mutate({ id: b.id })}
              className="flex items-center gap-2 text-red-500"
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          </div>
        ))
      ) : (
        <p className="text-center">No reading bookmarks found.</p>
      )}
    </div>
  );
}
