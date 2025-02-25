"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HoverTranslateProps {
  text: string;
  language: string; // Source language (e.g., "ur" for Urdu, "pa" for Punjabi)
}

// Mapping full language names to Azure Translator API codes
const languageCodeMap: { [key: string]: string } = {
  english: "en",
  punjabi: "pa",
  urdu: "ur",
};

export default function HoverTranslate({ text, language }: HoverTranslateProps) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [transliteration, setTransliteration] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Convert language name to API-friendly language code
  const sourceLangCode = languageCodeMap[language.toLowerCase()] || language;

  const handleTranslate = async () => {
    if (translation) return; // Avoid unnecessary API calls
    setLoading(true);

    try {
      const response = await fetch("/api/hover-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from: sourceLangCode }),
      });

      if (!response.ok) {
        throw new Error("Translation API failed");
      }

      const data = await response.json();
      setTranslation(data.translation || "Translation error");
      setTransliteration(data.transliteration || null); // Show transliteration if available
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslation("Error translating");
    }

    setLoading(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span
          className="relative inline-block cursor-pointer text-blue-600 underline"
          onMouseEnter={handleTranslate}
        >
          {text}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 w-64 bg-white shadow-lg rounded-lg">
        {loading ? (
          <p className="text-sm text-gray-500">Translating...</p>
        ) : (
          <>
            {translation && (
              <DropdownMenuItem className="text-lg font-semibold">
                {translation}
              </DropdownMenuItem>
            )}
            {transliteration && (
              <DropdownMenuItem className="text-sm italic text-gray-500">
                {transliteration}
              </DropdownMenuItem>
            )}
            {!translation && <p className="text-sm text-gray-400">Hover to translate</p>}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
