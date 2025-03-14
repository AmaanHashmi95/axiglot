"use client";

import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HoverTranslateProps {
  text: string;
  language: string;
}

// Mapping full language names to Azure Translator API codes
const languageCodeMap: { [key: string]: string } = {
  english: "en",
  punjabi: "pa",
  urdu: "ur",
};

// Translation Cache to Avoid Redundant Requests
const translationCache = new Map<string, any>();

export default function HoverTranslate({ text, language }: HoverTranslateProps) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [transliteration, setTransliteration] = useState<string | null>(null);
  const [wordTranslations, setWordTranslations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWordDropdown, setShowWordDropdown] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isTouchscreen, setIsTouchscreen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Detect if the device is a touchscreen
  useEffect(() => {
    setIsTouchscreen("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const sourceLangCode = languageCodeMap[language.toLowerCase()] || language;

  const handleTranslate = async () => {
    if (translationCache.has(text)) {
      // ✅ Use cached translation if available
      const cachedData = translationCache.get(text);
      setTranslation(cachedData.translation);
      setTransliteration(cachedData.transliteration);
      setWordTranslations(cachedData.wordTranslations);
      setDropdownOpen(true);
      return;
    }

    setLoading(true);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/hover-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from: sourceLangCode }),
        signal: abortControllerRef.current.signal, // Allow request cancellation
      });

      if (!response.ok) throw new Error("Translation API failed");

      const data = await response.json();
      setTranslation(data.translation || "Translation error");
      setTransliteration(data.transliteration || null);
      setWordTranslations(data.wordTranslations || []);

      // ✅ Cache the translation to speed up future requests
      translationCache.set(text, data);

      setLoading(false);
      setDropdownOpen(true); // ✅ Open dropdown AFTER translation is ready
    } catch (error) {
      if (error instanceof Error) {
        console.error("Translation failed:", error.message);
      } else {
        console.error("Translation failed: Unknown error");
      }
      setTranslation("Error translating");
      setLoading(false);
    }
  };

  const handleInteraction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!dropdownOpen) {
      await handleTranslate(); // ✅ Ensure translation loads before opening
    } else {
      setDropdownOpen(false);
    }
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <span
          className="cursor-pointer text-blue-600 underline"
          onClick={isTouchscreen ? handleInteraction : undefined}
          onMouseEnter={!isTouchscreen ? handleTranslate : undefined} // ✅ Prefetch on hover
          onTouchStart={isTouchscreen ? handleTranslate : undefined} // ✅ Prefetch on touch
        >
          {text}
        </span>
      </DropdownMenuTrigger>
      {dropdownOpen && translation && ( // ✅ Prevents opening an empty dropdown
        <DropdownMenuContent className="p-3 w-64 bg-white shadow-lg rounded-lg">
          {loading ? (
            <p className="text-sm text-gray-500">Translating...</p>
          ) : (
            <>
              {translation && <div className="text-lg font-semibold px-3 py-1">{translation}</div>}
              {transliteration && (
                <div className="text-sm italic text-gray-500 px-3 py-1">
                  {transliteration}
                </div>
              )}
              {wordTranslations.length > 0 && (
                <div
                  className="text-blue-600 cursor-pointer px-3 py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowWordDropdown(!showWordDropdown);
                  }}
                >
                  {showWordDropdown ? "Hide Word Breakdown" : "Show Word Breakdown"}
                </div>
              )}
              {showWordDropdown &&
                wordTranslations.map((word, idx) => (
                  <div key={idx} className="text-sm text-gray-700 px-3 py-1">
                    <strong>{word.original}:</strong> {word.translation} ({word.transliteration})
                  </div>
                ))}
            </>
          )}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
