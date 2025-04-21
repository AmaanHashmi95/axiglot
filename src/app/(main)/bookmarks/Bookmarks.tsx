"use client";


import InfiniteScrollContainer from "@/app/(main)/feeds/InfiniteScrollContainer";
import Post from "@/app/(main)/components/posts/Post";
import PostsLoadingSkeleton from "@/app/(main)/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PostsPage } from "@/lib/types";


interface BookmarksProps {
 selectedType: string;
 selectedLanguage: string;
}


export default function Bookmarks({ selectedType, selectedLanguage }: BookmarksProps) {
 const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery<PostsPage>({
   queryKey: ["post-feed", "bookmarks", selectedLanguage],
   queryFn: ({ pageParam }) =>
     kyInstance
       .get("/api/posts/bookmarked", {
         searchParams: {
           ...(typeof pageParam === "string" ? { cursor: pageParam } : {}), // Ensure cursor is a string
           ...(selectedLanguage !== "All Languages" ? { language: selectedLanguage } : {}),
         },
       })
       .json<PostsPage>(), // Explicitly define response type
   initialPageParam: null,
   getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null, // Ensure 'lastPage' is correctly handled
 });


 const posts = data?.pages.flatMap((page) => (page as PostsPage).posts) || [];


 return (
   <div className="space-y-5">
     {selectedType === "Posts" && (
       status === "pending" ? (
         <PostsLoadingSkeleton />
       ) : posts.length > 0 ? (
         <InfiniteScrollContainer onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}>
           {posts.map((post) => (
             <Post key={post.id} post={post} />
           ))}
           {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
         </InfiniteScrollContainer>
       ) : (
         <p className="text-center text-muted-foreground">No bookmarks found.</p>
       )
     )}
   </div>
 );
}



