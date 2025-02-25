"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HoverTranslateProps {
  text: string;
  language: string; // Source language (e.g., "ur" for Urdu, "pa" for Punjabi")
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
  const [wordTranslations, setWordTranslations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWordDropdown, setShowWordDropdown] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isTouchscreen, setIsTouchscreen] = useState(false);

  // Detect if the device is a touchscreen
  useEffect(() => {
    setIsTouchscreen("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const sourceLangCode = languageCodeMap[language.toLowerCase()] || language;

  const handleTranslate = async () => {
    if (loading || translation) return;

    setLoading(true);

    try {
      const response = await fetch("/api/hover-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from: sourceLangCode }),
      });

      if (!response.ok) throw new Error("Translation API failed");

      const data = await response.json();
      setTranslation(data.translation || "Translation error");
      setTransliteration(data.transliteration || null);
      setWordTranslations(data.wordTranslations || []);

      setLoading(false);
      setDropdownOpen(true); // ✅ Open only when translation is ready
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslation("Error translating");
      setLoading(false);
    }
  };

  const handleTouchInteraction = () => {
    if (!dropdownOpen) {
      handleTranslate(); // ✅ Ensure translation loads before opening
      setTimeout(() => setDropdownOpen(true), 200); // ✅ Small delay prevents "empty dropdown"
    } else {
      setDropdownOpen(false);
    }
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <span
          className="cursor-pointer text-blue-600 underline"
          onClick={isTouchscreen ? handleTouchInteraction : undefined}
          onMouseEnter={!isTouchscreen ? handleTranslate : undefined} // ✅ Hover only for desktops
        >
          {text}
        </span>
      </DropdownMenuTrigger>
      {dropdownOpen && ( // ✅ Prevents opening an empty dropdown
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
