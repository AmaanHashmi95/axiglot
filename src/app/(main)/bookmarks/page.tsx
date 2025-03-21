"use client"; // ✅ Add this at the top

import { useState } from "react";
import BookmarkFilters from "./BookmarkFilters";
import Bookmarks from "./Bookmarks";
import LessonBookmarks from "@/app/(main)/bookmarks/LessonBookmarks";

export default function Page() {
 const [selectedType, setSelectedType] = useState("Posts");
 const [selectedLanguage, setSelectedLanguage] = useState("All Languages");


 return (
   <main className="flex w-full min-w-0 gap-5">
     <div className="w-full min-w-0 space-y-5">
       <div className="rounded-2xl bg-card p-5 shadow-sm">
         <h1 className="text-center text-2xl font-bold">Bookmarks</h1>
       </div>


       {/* Filters Dropdown Component */}
       <BookmarkFilters
         selectedType={selectedType}
         setSelectedType={setSelectedType}
         selectedLanguage={selectedLanguage}
         setSelectedLanguage={setSelectedLanguage}
       />


       {/* Bookmarks List */}
       <Bookmarks selectedType={selectedType} selectedLanguage={selectedLanguage} />
       {selectedType === "Lessons" && (<LessonBookmarks selectedLanguage={selectedLanguage}/>)}
     </div>
   </main>
 );
}


