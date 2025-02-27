"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Word {
  word: string;
  startTime: number;
  endTime: number;
}

interface Sentence {
  text: string;
  startTime: number;
  endTime: number;
  words: Word[];
}

interface Song {
  title: string;
  artist: string;
  audioUrl: string;
  englishSentences: Sentence[];
  targetSentences: Sentence[];
  transliterationSentences: Sentence[];
}

export default function MusicPlayer({ song }: { song: Song }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [highlightedWords, setHighlightedWords] = useState<Record<string, string | null>>({
    english: null,
    target: null,
    transliteration: null,
  });

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current) {
        const time = audioRef.current.currentTime;
        setCurrentTime(time);
        setProgress((time / duration) * 100);

        // ✅ Keep the sentence visible for full duration
        const activeSentence = song.englishSentences.find((s) => time >= s.startTime && time < s.endTime);
        setCurrentSentence(activeSentence || null);

        // ✅ Highlight words at the correct time
        const getHighlightedWord = (sentence?: Sentence) =>
          sentence?.words.find((word) => time >= word.startTime && time < word.endTime)?.word || null;

        setHighlightedWords({
          english: getHighlightedWord(activeSentence),
          target: getHighlightedWord(song.targetSentences.find((s) => time >= s.startTime && time < s.endTime)),
          transliteration: getHighlightedWord(song.transliterationSentences.find((s) => time >= s.startTime && time < s.endTime)),
        });
      }
    };

    const interval = setInterval(updateProgress, 100); // ✅ Update faster for smooth highlighting
    return () => clearInterval(interval);
  }, [duration, song]);

  return (
    <div className="p-4 border rounded-lg w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold">{song.title} - {song.artist}</h2>
      <audio ref={audioRef} src={song.audioUrl} onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} />
      <div className="flex items-center gap-2 mt-4">
        <Button onClick={() => audioRef.current!.currentTime -= 5}>⏪</Button>
        <Button onClick={() => (isPlaying ? audioRef.current!.pause() : audioRef.current!.play(), setIsPlaying(!isPlaying))}>
          {isPlaying ? "⏸️" : "▶️"}
        </Button>
        <Button onClick={() => audioRef.current!.currentTime += 5}>⏩</Button>
      </div>

      {/* Lyrics Display (Sentence stays, words highlight) */}
      <p className="mt-4 text-center font-semibold">
        {currentSentence?.text.split(" ").map((word, index) => (
          <span key={index} className={word === highlightedWords.english ? "bg-yellow-300 px-1 rounded" : ""}>
            {word}{" "}
          </span>
        )) || "♫ ♪"}
      </p>

      <p className="mt-1 text-center text-gray-700">
        {song.targetSentences
          .find((s) => currentTime >= s.startTime && currentTime < s.endTime)
          ?.text.split(" ")
          .map((word, index) => (
            <span key={index} className={word === highlightedWords.target ? "bg-yellow-300 px-1 rounded" : ""}>
              {word}{" "}
            </span>
          )) || "♫ ♪"}
      </p>

      <p className="mt-1 text-center text-gray-500 italic">
        {song.transliterationSentences
          .find((s) => currentTime >= s.startTime && currentTime < s.endTime)
          ?.text.split(" ")
          .map((word, index) => (
            <span key={index} className={word === highlightedWords.transliteration ? "bg-yellow-300 px-1 rounded" : ""}>
              {word}{" "}
            </span>
          )) || "♫ ♪"}
      </p>
    </div>
  );
}
