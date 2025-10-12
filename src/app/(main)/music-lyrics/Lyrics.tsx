"use client";

import { useState, useEffect } from "react";
import LyricBookmarkButton from "./LyricBookmarkButton";

interface Word {
  word?: {
    id?: string;
    text: string;
    transliteration?: string;
    audioUrl?: string;
  };
  startTime: number;
  endTime: number;
  order: number;
}

interface Sentence {
  id?: string;
  text: string;
  startTime: number;
  endTime: number;
  words?: Word[];
}

interface LyricsProps {
  song: {
    id: string;
    streamSrc: string;
    englishSentences: Sentence[];
    targetSentences: Sentence[];
    transliterationSentences: Sentence[];
  };
  currentTime: number;
}

export default function Lyrics({ song, currentTime }: LyricsProps) {
  const [showBookmark, setShowBookmark] = useState(false);

  const currentSentences = {
    english: song.englishSentences.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime,
    ),
    target: song.targetSentences.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime,
    ),
    transliteration: song.transliterationSentences.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime,
    ),
  };

  // --- CHANGED: removed string-comparison based highlighter ---
  // We will render with per-word timings instead (see renderSentence below).

  const words =
    currentSentences.target?.words?.map((w) => ({
      id: w.word?.id || "",
      text: w.word?.text || "",
      transliteration: w.word?.transliteration,
      audioUrl: w.word?.audioUrl,
    })) || [];

  const translations =
    currentSentences.english?.words?.map((w) => ({
      id: w.word?.id || "",
      text: w.word?.text || "",
    })) || [];

  const sentenceIds = [
    currentSentences.target?.id,
    currentSentences.english?.id,
    currentSentences.transliteration?.id,
  ].filter(Boolean) as string[];

  // Fallback full-line strings (when per-word arrays are missing)
  const fallbackEnglish = currentSentences.english?.text ?? "";
  const fallbackTransliteration = currentSentences.transliteration?.text ?? "";
  const fallbackTarget = currentSentences.target?.text ?? "";

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".bookmark-group")) {
        setShowBookmark(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // --- NEW: renderSentence uses per-word timings so multi-token and repeated words work correctly ---
  const renderSentence = (sentence?: Sentence, fallbackLabel?: string) => {
    if (!sentence) return <span>{fallbackLabel ?? ""}</span>;

    if (sentence.words && sentence.words.length > 0) {
      return (
        <>
          {sentence.words.map((w, i) => {
            const chunk = w.word?.text ?? "";
            const isHighlighted =
              currentTime >= w.startTime && currentTime < w.endTime;

            return (
              <span key={w.word?.id ?? `${i}-${w.startTime}-${w.endTime}`}>
                <span
                  className={
                    isHighlighted
                      ? "rounded bg-gradient-to-r from-[#ff8a00] to-[#ef2626] px-1 text-white"
                      : ""
                  }
                >
                  {chunk}
                </span>{" "}
              </span>
            );
          })}
        </>
      );
    }

    // Fallback: render the sentence text when no per-word data exists
    return <span>{sentence.text}</span>;
  };

  return (
    <div
      className="bookmark-group relative mx-auto mt-4 w-full max-w-lg cursor-pointer rounded p-2"
      onClick={() => setShowBookmark(true)}
    >
      {/* ✅ Bookmark Button */}
      {showBookmark && currentSentences.target && (
        <div className="absolute left-10 bottom-[-40px] z-10">
          <LyricBookmarkButton
            songId={song.id}
            sentenceIds={sentenceIds}
            words={words}
            translations={translations}
            audioUrl={song.streamSrc}
            fallbackEnglish={fallbackEnglish}
            fallbackTransliteration={fallbackTransliteration}
            fallbackTarget={fallbackTarget}
          />
        </div>
      )}

      {/* --- CHANGED: use renderSentence instead of text.split(" ") --- */}
      <div className="flex flex-col items-center gap-10">
        {/* English */}
        <p className="text-center text-[28px] font-semibold">
          {renderSentence(currentSentences.english, "(The English Translation)")}
        </p>

        {/* Target Language */}
        <p className="text-center text-[28px] font-semibold">
          {renderSentence(currentSentences.target, "(The Language Lyrics)")}
        </p>

        {/* Transliteration */}
        <p className="text-center text-[28px] font-semibold">
          {renderSentence(
            currentSentences.transliteration,
            "(The Transliteration)",
          )}
        </p>
      </div>
    </div>
  );
}
