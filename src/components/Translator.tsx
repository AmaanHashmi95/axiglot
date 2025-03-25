"use client";

import { useState, useEffect } from "react";
import TranslatorBookmarkButton from "./TranslatorBookmarkButton";

const languages = [
  { code: "en", name: "English" },
  { code: "pa", name: "Punjabi" },
  { code: "ur", name: "Urdu" },
];

export default function Translator() {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [transliteratedText, setTransliteratedText] = useState("");
  const [wordBreakdown, setWordBreakdown] = useState<any[]>([]);
  const [from, setFrom] = useState("en");
  const [to, setTo] = useState("pa");
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
      console.log("API Response:", data);

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
  

  return (
    <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold">Text Translator</h2>

      <textarea
        className="w-full rounded-md border p-2"
        placeholder="Enter text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="my-3 flex gap-2">
        

        <select
          className="rounded-md border p-2"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <button
        className="w-full rounded-md bg-blue-500 p-2 text-white"
        onClick={translateText}
        disabled={loading}
      >
        {loading ? "Translating..." : "Translate"}
      </button>

      {translatedText && (
        <div className="mt-4 rounded-md border bg-gray-100 p-3">
          <strong>Translation:</strong>
          <p>{translatedText}</p>
          <TranslatorBookmarkButton
            sourceText={text}
            translatedText={translatedText}
            transliteration={transliteratedText}
            language={to}
            words={wordBreakdown}
          />
        </div>
      )}

      {transliteratedText && (
        <div className="mt-2 rounded-md border bg-gray-100 p-3">
          <strong>Transliteration:</strong>
          <p>{transliteratedText}</p>
        </div>
      )}

      {wordBreakdown.length > 0 && (
        <div className="mt-2 rounded-md border bg-gray-100 p-3">
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
