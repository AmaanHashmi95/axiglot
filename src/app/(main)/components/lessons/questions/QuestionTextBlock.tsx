"use client";
import LessonBookmarkButton from "../LessonBookmarkButton";
import { useEffect, useState, useRef } from "react";


interface Word {
  id: string;
  text: string;
  color: string;
  audioUrl?: string | null;
  transliteration?: string;
}

interface Translation {
  id: string;
  text: string;
  color: string;
}

interface Props {
  words: Word[];
  translations: Translation[];
  lessonId: string;
  questionId: string;
  activeWordId: string | null;
  lastClickedWord: string | null;
  setActiveWordId: (id: string | null) => void;
  setLastClickedWord: (id: string | null) => void;
  playWordAudio: (url?: string) => void;
}

export default function QuestionTextBlock({
  words,
  translations,
  lessonId,
  questionId,
  activeWordId,
  lastClickedWord,
  setActiveWordId,
  setLastClickedWord,
  playWordAudio,
}: Props) {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [showTranslation, setShowTranslation] = useState(false);  
  
  const handleMouseEnter = (wordId: string) => {
    if (!lastClickedWord) setActiveWordId(wordId);
  };

  const handleMouseLeave = (wordId: string) => {
    if (lastClickedWord !== wordId) setActiveWordId(null);
  };

  const handleWordClick = (wordId: string, audioUrl?: string | null) => {
    const isSameWord = lastClickedWord === wordId;
    if (isSameWord) {
      setLastClickedWord(null);
      setActiveWordId(null);
    } else {
      setLastClickedWord(wordId);
      setActiveWordId(wordId);
      if (audioUrl) {
        console.log("🔊 Playing word audio:", audioUrl);
        playWordAudio(audioUrl);
      } else {
        console.warn("⚠️ No audio URL found for word ID:", wordId);
      }
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveWordId(null);
        setLastClickedWord(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  
  

  return (
    <div ref={containerRef} className="mt-4 text-xl sm:text-2xl md:text-3xl text-center">
      {words.length > 0 ? (
        <div className="flex flex-wrap justify-center items-center gap-1">
          {words.map((word) => (
            <span
              key={word.id}
              style={{ color: word.color }}
              className="word-container relative mx-1 cursor-pointer"
              onMouseEnter={() => handleMouseEnter(word.id)}
              onMouseLeave={() => handleMouseLeave(word.id)}
              onClick={() => handleWordClick(word.id, word.audioUrl)}
            >
              {activeWordId === word.id && word.transliteration && (
                <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm text-white shadow-lg transition-opacity duration-200 ease-in-out">
                  {word.transliteration}
                </span>
              )}
              {word.text}
            </span>
          ))}
          <LessonBookmarkButton
            lessonId={lessonId}
            questionId={questionId}
            words={words}
            translations={translations}
          />
        </div>
      ) : (
        <span className="text-gray-500"></span>
      )}

      {/* Toggle Button */}
      {translations.length > 0 && (
        <div className="mt-1 text-xl text-gray-500">
          <button
            onClick={() => setShowTranslation((prev) => !prev)}
            className="btn btn-outline btn-sm"
          >
            {showTranslation ? "Hide translation" : "Show translation"}
          </button>
        </div>
      )}

      {/* Conditionally show translations */}
      {showTranslation && translations.length > 0 && (
        <div className="mt-2 text-gray-800 flex flex-wrap justify-center gap-2">
          {translations.map((translation) => (
            <div key={translation.id} className="flex items-center">
              <span style={{ color: translation.color }} className="mx-1">
                {translation.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
