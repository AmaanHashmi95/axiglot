"use client";

import { useState, useEffect } from "react";
import LyricBookmarkButton from "./music/LyricBookmarkButton";

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
    audioUrl: string;
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
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    ),
    target: song.targetSentences.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    ),
    transliteration: song.transliterationSentences.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    ),
  };

  const getHighlightedWord = (sentence?: Sentence) =>
    sentence?.words?.find(
      (word) => currentTime >= word.startTime && currentTime < word.endTime
    )?.word?.text || null;

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
      {/* ✅ Bookmark Button */}
      {showBookmark && currentSentences.target && (
        <div className="absolute top-2 right-2 z-10">
          <LyricBookmarkButton
            songId={song.id}
            sentenceIds={sentenceIds}
            words={words}
            translations={translations}
            audioUrl={song.audioUrl}
          />
        </div>
      )}

      {/* Lyrics Block with Spacing */}
  <div className="flex flex-col items-center gap-10">

      {/* ✅ English */}
      <p className="text-center font-semibold text-[28px]">
        {currentSentences.english
          ? currentSentences.english.text.split(" ").map((word, index) => {
              const highlightedWord = getHighlightedWord(currentSentences.english);
              return (
                <span
                  key={index}
                  className={word === highlightedWord ? "bg-yellow-300 px-1 rounded" : ""}
                >
                  {word}{" "}
                </span>
              );
            })
          : "(The English Translation)"}
      </p>

      {/* ✅ Target Language */}
      <p className="text-center font-semibold text-[28px]">
        {currentSentences.target
          ? currentSentences.target.text.split(" ").map((word, index) => {
              const highlightedWord = getHighlightedWord(currentSentences.target);
              return (
                <span
                  key={index}
                  className={word === highlightedWord ? "bg-yellow-300 px-1 rounded" : ""}
                >
                  {word}{" "}
                </span>
              );
            })
          : "(The Language Lyrics)"}
      </p>

      {/* ✅ Transliteration */}
      <p className="text-center font-semibold text-[28px]">
        {currentSentences.transliteration
          ? currentSentences.transliteration.text.split(" ").map((word, index) => {
              const highlightedWord = getHighlightedWord(currentSentences.transliteration);
              return (
                <span
                  key={index}
                  className={word === highlightedWord ? "bg-yellow-300 px-1 rounded" : ""}
                >
                  {word}{" "}
                </span>
              );
            })
          : "(The Transliteration)"}
      </p>
      </div>
    </div>
  );
}
