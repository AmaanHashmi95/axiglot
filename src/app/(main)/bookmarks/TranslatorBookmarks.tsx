import { Loader2, Bookmark } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ky from "@/lib/ky";

interface Props {
  selectedLanguage: string;
}

interface TranslatorBookmark {
    id: string;
    sourceText: string;
    translatedText: string;
    transliteration: string;
    language?: string;
    words: any[];
  }
  

export default function TranslatorBookmarks({ selectedLanguage }: Props) {
  const queryKey = ["translator-bookmarks"];
  const queryClient = useQueryClient();

  const { data = [], status } = useQuery<TranslatorBookmark[]>({
    queryKey,
    queryFn: () => ky.get("/api/translator-bookmarks").json(),
  });
  

  const { mutate } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await ky.delete("/api/translator-bookmarks", { json: { id } });
    },
    onMutate: async ({ id }) => {
      queryClient.setQueryData(queryKey, (old: any[] | undefined) => old?.filter((b) => b.id !== id) || []);
    },
  });

  const languageMap: Record<string, string> = {
    "Punjabi": "pa",
    "Urdu": "ur",
  };
  
  const filtered =
    selectedLanguage === "All Languages"
      ? data
      : data.filter((b) => b.language === languageMap[selectedLanguage]);
  

  return (
    <div className="space-y-4">
      {status === "pending" ? (
        <Loader2 className="mx-auto my-3 animate-spin text-[#00E2FF]" />
      ) : filtered.length === 0 ? (
        <p className="text-center">No translator bookmarks.</p>
      ) : (
        filtered.map((b) => (
          <div key={b.id} className="rounded border p-4 shadow">
            <p className="text-sm text-gray-100">Original: {b.sourceText}</p>
            <p className="text-sm"><strong>Translation:</strong> {b.translatedText}</p>
            <p className="text-sm text-gray-100">
              <strong>Transliteration:</strong> {b.transliteration}
            </p>
            {b.words && (
              <div className="mt-1 text-sm text-gray-100">
                <strong>Word Breakdown:</strong>
                <ul className="list-disc pl-5">
                  {b.words.map((w: any, i: number) => (
                    <li key={i}><strong>{w.original}</strong>: {w.translation}</li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={() => mutate({ id: b.id })}>
                <Bookmark className="fill-[#00E2FF] text-[#00E2FF] mt-4" />
              </button>
          </div>
        ))
      )}
    </div>
  );
}