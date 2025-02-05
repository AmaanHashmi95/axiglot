"use client";

import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Speaker } from "lucide-react"; // Icon for audio playback
import { fetchTranslation } from "@/lib/translation-api"; // API Helper

interface HoverTranslateProps {
  text: string;
  language: string; // Source language (e.g., "ur" for Urdu, "pa" for Punjabi)
}

export default function HoverTranslate({ text, language }: HoverTranslateProps) {
  const [translation, setTranslation] = useState<{ english: string; phonetic: string; audio: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (translation) return; // Avoid unnecessary API calls
    setLoading(true);
    const result = await fetchTranslation(text, language);
    setTranslation(result);
    setLoading(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span className="relative inline-block cursor-pointer text-blue-600 underline" onMouseEnter={handleTranslate}>
          {text}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 w-64 bg-white shadow-lg rounded-lg">
        {loading ? (
          <p className="text-sm text-gray-500">Translating...</p>
        ) : translation ? (
          <>
            <DropdownMenuItem className="text-lg font-semibold">{translation.english}</DropdownMenuItem>
            <DropdownMenuItem className="text-sm italic text-gray-500">{translation.phonetic}</DropdownMenuItem>
            <DropdownMenuItem>
              <button onClick={() => new Audio(translation.audio).play()} className="flex items-center gap-2">
                <Speaker className="w-4 h-4" /> Play Audio
              </button>
            </DropdownMenuItem>
          </>
        ) : (
          <p className="text-sm text-gray-400">Hover to translate</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
