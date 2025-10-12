// src/components/Subtitles.tsx
"use client";

import { useState, useEffect } from "react";
import SubtitleBookmarkButton from "./SubtitleBookmarkButton";
import type { Video } from "@/lib/video";

interface Word {
  word: { id: string; text: string; color?: string; transliteration?: string; audioUrl?: string };
  startTime: number;
  endTime: number;
  order: number;
}

interface Sentence {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  words?: Word[];
}

interface SubtitlesProps {
  video: Video; // ✅ use shared Video (has streamSrc)
  currentTime: number;
}

export default function Subtitles({ video, currentTime }: SubtitlesProps) {
  const [showBookmark, setShowBookmark] = useState(false);

  const currentSentences = {
    english: video.englishSentences.find((s) => currentTime >= s.startTime && currentTime < s.endTime),
    target: video.targetSentences.find((s) => currentTime >= s.startTime && currentTime < s.endTime),
    transliteration: video.transliterationSentences.find((s) => currentTime >= s.startTime && currentTime < s.endTime),
  };

  // --- CHANGED: no more text.split-based comparison ---

  const words = currentSentences.target?.words?.map((w) => ({
    id: w.word.id,
    text: w.word.text,
    color: w.word.color || "#000",
    transliteration: w.word.transliteration,
    audioUrl: w.word.audioUrl,
  })) || [];

  const translations = currentSentences.english?.words?.map((w) => ({
    id: w.word.id,
    text: w.word.text,
    color: w.word.color || "#000",
  })) || [];

  const sentenceIds = [
    currentSentences.target?.id,
    currentSentences.english?.id,
    currentSentences.transliteration?.id,
  ].filter(Boolean) as string[];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".bookmark-group")) {
        setShowBookmark(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // --- NEW: renderSentence uses per-word timings ---
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
                      ? "bg-gradient-to-r from-[#ff8a00] to-[#ef2626] text-white px-1 rounded"
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

    return <span>{sentence.text}</span>;
  };

  return (
    <div
      className="bookmark-group w-full max-w-lg mx-auto mt-4 p-2 rounded relative cursor-pointer"
      onClick={() => setShowBookmark(true)}
    >
      {/* --- CHANGED: use renderSentence (per-word timing) --- */}
      <p className="text-center font-semibold">
        {renderSentence(currentSentences.english, "(The English Translation)")}
      </p>

      <p className="text-center font-semibold">
        {renderSentence(currentSentences.target, "(The Language Subtitles)")}
      </p>

      <p className="text-center font-semibold">
        {renderSentence(
          currentSentences.transliteration,
          "(The Transliteration Subtitles)",
        )}
      </p>

      {showBookmark && currentSentences.target && (
        <div className="absolute top-2 left-2 z-10">
          <SubtitleBookmarkButton
            videoId={video.id}
            sentenceIds={sentenceIds}
            words={words}
            translations={translations}
            audioUrl={video.streamSrc}
          />
        </div>
      )}
    </div>
  );
}
