// src/components/Subtitles.tsx
"use client";

import { useState, useEffect } from "react";
import SubtitleBookmarkButton from "./video/SubtitleBookmarkButton";

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
  video: {
    id: string;
    englishSentences: Sentence[];
    targetSentences: Sentence[];
    transliterationSentences: Sentence[];
    videoUrl: string;
  };
  currentTime: number;
}

export default function Subtitles({ video, currentTime }: SubtitlesProps) {
  const [showBookmark, setShowBookmark] = useState(false);

  const currentSentences = {
    english: video.englishSentences.find((s) => currentTime >= s.startTime && currentTime < s.endTime),
    target: video.targetSentences.find((s) => currentTime >= s.startTime && currentTime < s.endTime),
    transliteration: video.transliterationSentences.find((s) => currentTime >= s.startTime && currentTime < s.endTime),
  };

  const getHighlightedWord = (sentence?: Sentence) =>
    sentence?.words?.find(
      (word) => currentTime >= word.startTime && currentTime < word.endTime
    )?.word?.text || null;

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

  return (
    <div
      className="bookmark-group w-full max-w-lg mx-auto mt-4 p-2 border rounded relative cursor-pointer"
      onClick={() => setShowBookmark(true)}
    >
      <p className="text-center font-semibold">
        {currentSentences.english?.text.split(" ").map((word, i) => (
          <span key={i} className={word === getHighlightedWord(currentSentences.english) ? "bg-yellow-300 px-1 rounded" : ""}>
            {word}{" "}
          </span>
        )) || "(The English Translation)"}
      </p>

      <p className="text-center text-gray-700">
        {currentSentences.target?.text.split(" ").map((word, i) => (
          <span key={i} className={word === getHighlightedWord(currentSentences.target) ? "bg-yellow-300 px-1 rounded" : ""}>
            {word}{" "}
          </span>
        )) || "(The Language Subtitles)"}
      </p>

      <p className="text-center text-gray-500 italic">
        {currentSentences.transliteration?.text.split(" ").map((word, i) => (
          <span key={i} className={word === getHighlightedWord(currentSentences.transliteration) ? "bg-yellow-300 px-1 rounded" : ""}>
            {word}{" "}
          </span>
        )) || "(The Transliteration)"}
      </p>

      {showBookmark && currentSentences.target && (
        <div className="absolute top-2 right-2 z-10">
          <SubtitleBookmarkButton
            videoId={video.id}
            sentenceIds={sentenceIds}
            words={words}
            translations={translations}
            audioUrl={video.videoUrl}
          />
        </div>
      )}
    </div>
  );
}
