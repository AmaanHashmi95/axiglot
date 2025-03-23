"use client";


import { Dispatch, SetStateAction } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";


const itemTypes = ["Posts", "Lessons", "Subtitles", "Lyrics"];
const languages = ["All Languages", "Punjabi", "Urdu"];


interface BookmarkFiltersProps {
 selectedType: string;
 setSelectedType: Dispatch<SetStateAction<string>>;
 selectedLanguage: string;
 setSelectedLanguage: Dispatch<SetStateAction<string>>;
}


export default function BookmarkFilters({
 selectedType,
 setSelectedType,
 selectedLanguage,
 setSelectedLanguage,
}: BookmarkFiltersProps) {
 return (
   <div className="flex gap-5">
     {/* Item Type Dropdown */}
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <button className={cn("flex items-center gap-2 p-2 rounded-lg border bg-white dark:bg-gray-900 w-40")}>
           <span>{selectedType}</span>
           <ChevronDown className="w-4 h-4" />
         </button>
       </DropdownMenuTrigger>
       <DropdownMenuContent>
         {itemTypes.map((type) => (
           <DropdownMenuItem key={type} onClick={() => setSelectedType(type)}>
             {type}
           </DropdownMenuItem>
         ))}
       </DropdownMenuContent>
     </DropdownMenu>


     {/* Language Dropdown */}
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <button className={cn("flex items-center gap-2 p-2 rounded-lg border bg-white dark:bg-gray-900 w-40")}>
           <span>{selectedLanguage}</span>
           <ChevronDown className="w-4 h-4" />
         </button>
       </DropdownMenuTrigger>
       <DropdownMenuContent>
         {languages.map((lang) => (
           <DropdownMenuItem key={lang} onClick={() => setSelectedLanguage(lang)}>
             {lang}
           </DropdownMenuItem>
         ))}
       </DropdownMenuContent>
     </DropdownMenu>
   </div>
 );
}




