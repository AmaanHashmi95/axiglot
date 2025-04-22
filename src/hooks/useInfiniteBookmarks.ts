// src/hooks/useInfiniteBookmarks.ts
import { useInfiniteQuery } from "@tanstack/react-query"
import ky from "@/lib/ky"
import { QueryFunctionContext } from "@tanstack/react-query"

export function useInfiniteBookmarks<T = any>(type: string, selectedLanguage: string) {
    const pageSize = 3;

    return useInfiniteQuery<T[], Error>({
      queryKey: [type, selectedLanguage],
      queryFn: async (context: QueryFunctionContext) => {
        const pageParam = (context.pageParam as number) ?? 0;
        const params = new URLSearchParams({
          skip: pageParam.toString(),
          take: pageSize.toString(),
          lang: selectedLanguage,
        });
        return ky.get(`/api/${type}?${params}`).json<T[]>();
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === pageSize ? allPages.length * pageSize : undefined,
    });
}
