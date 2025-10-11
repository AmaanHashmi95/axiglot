"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const languages = [
  { code: "pa", name: "Punjabi" },
  { code: "ur", name: "Urdu" },
  { code: "sw", name: "Swahili" },
  { code: "fa", name: "Farsi" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
];

const MAX_CHARS = 500;

export default function Translator() {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [transliteratedText, setTransliteratedText] = useState("");
  const [wordBreakdown, setWordBreakdown] = useState<any[]>([]);
  const [from, setFrom] = useState("en");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const translateText = async () => {
    if (!text) return;
    setLoading(true);
    setTranslatedText("");
    setTransliteratedText("");
    setWordBreakdown([]);

    try {
      const response = await fetch("/api/translator-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
      });

      const data = await response.json();
      if (data.translation) setTranslatedText(data.translation);
      if (data.transliteration) setTransliteratedText(data.transliteration);
      if (data.wordTranslations) setWordBreakdown(data.wordTranslations);
    } catch (error) {
      console.error("Translation error", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    setTranslatedText("");
    setTransliteratedText("");
    setWordBreakdown([]);
  }, [to]);

  const charsUsed = text.length;
  const charsLeft = MAX_CHARS - charsUsed;

  return (
    <div
      className="mx-auto max-w-3xl rounded-lg p-6 shadow-lg"
      style={{ backgroundColor: "hsl(24, 9.8%, 10%)" }}
    >
      {/* Bigger textarea with 500-char cap */}
      <textarea
        className="w-full rounded-md border border-gray-300 bg-black p-4 text-white placeholder-gray-400 text-base leading-6 min-h-[220px] md:min-h-[280px]"
        placeholder="Enter text…"
        value={text}
        rows={10}
        maxLength={MAX_CHARS}
        onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
      />

      {/* Counter + language picker */}
      <div className="my-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-gray-400">
          {charsUsed}/{MAX_CHARS} characters
        </div>

        <div className="relative w-full sm:w-64">
          <select
            className="w-full appearance-none rounded-md border border-gray-300 bg-black p-2 pr-10 text-white"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          >
            <option value="" disabled>
              Choose a language
            </option>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white" />
        </div>
      </div>

      <button
        className="w-full rounded-md bg-gradient-to-r from-[#ff8a00] to-[#ef2626] p-3 font-semibold text-white disabled:opacity-50"
        onClick={translateText}
        disabled={loading || !to || text.trim().length === 0}
      >
        {loading ? "Translating..." : "Translate"}
      </button>

      {translatedText && (
        <div
          className="mt-4 rounded-md border p-3"
          style={{ backgroundColor: "#000000", color: "#ffffff" }}
        >
          <strong>Translation:</strong>
          <p>{translatedText}</p>
        </div>
      )}

      {transliteratedText && (
        <div
          className="mt-2 rounded-md border p-3"
          style={{ backgroundColor: "#000000", color: "#ffffff" }}
        >
          <strong>Transliteration:</strong>
          <p>{transliteratedText}</p>
        </div>
      )}

      {wordBreakdown.length > 0 && (
        <div
          className="mt-2 rounded-md border p-3"
          style={{ backgroundColor: "#000000", color: "#ffffff" }}
        >
          <strong>Word Breakdown:</strong>
          <ul className="list-disc pl-5">
            {wordBreakdown.map((word, idx) => (
              <li key={idx}>
                <strong>{word.original}</strong>: {word.translation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
