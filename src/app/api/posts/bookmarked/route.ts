import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";


export async function GET(req: NextRequest) {
 try {
   const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
   const selectedLanguage = req.nextUrl.searchParams.get("language");


   const pageSize = 10;


   const { user } = await validateRequest();


   if (!user) {
     return Response.json({ error: "Unauthorized" }, { status: 401 });
   }


   // Convert language filter to lowercase for case-insensitive comparison
   const normalizedLanguage = selectedLanguage?.toLowerCase();


   // Fetch bookmarks with proper language filtering
   const bookmarks = await prisma.bookmark.findMany({
     where: {
       userId: user.id,
       post: {
         language: normalizedLanguage && normalizedLanguage !== "all languages"
           ? { equals: normalizedLanguage, mode: "insensitive" } // Case-insensitive matching
           : undefined,
       },
     },
     include: {
       post: {
         include: getPostDataInclude(user.id),
       },
     },
     orderBy: {
       createdAt: "desc",
     },
     take: pageSize + 1,
     cursor: cursor ? { id: cursor } : undefined,
   });


   const nextCursor = bookmarks.length > pageSize ? bookmarks[pageSize].id : null;


   const data: PostsPage = {
     posts: bookmarks.slice(0, pageSize).map((bookmark) => bookmark.post),
     nextCursor,
   };


   return Response.json(data);
 } catch (error) {
   console.error(error);
   return Response.json({ error: "Internal server error" }, { status: 500 });
 }
}



