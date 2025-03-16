"use client";

import { useState } from "react";

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

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Text Translator</h2>

      <textarea
        className="w-full p-2 border rounded-md"
        placeholder="Enter text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex gap-2 my-3">
        <select className="p-2 border rounded-md" value={from} onChange={(e) => setFrom(e.target.value)}>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>

        <select className="p-2 border rounded-md" value={to} onChange={(e) => setTo(e.target.value)}>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>

      <button
        className="bg-blue-500 text-white p-2 rounded-md w-full"
        onClick={translateText}
        disabled={loading}
      >
        {loading ? "Translating..." : "Translate"}
      </button>

      {translatedText && (
        <div className="mt-4 p-3 border rounded-md bg-gray-100">
          <strong>Translation:</strong>
          <p>{translatedText}</p>
        </div>
      )}

      {transliteratedText && (
        <div className="mt-2 p-3 border rounded-md bg-gray-100">
          <strong>Transliteration:</strong>
          <p>{transliteratedText}</p>
        </div>
      )}

      {wordBreakdown.length > 0 && (
        <div className="mt-2 p-3 border rounded-md bg-gray-100">
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
