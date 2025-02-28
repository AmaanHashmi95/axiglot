"use client";

import { useState, useRef, useEffect, ChangeEvent, MouseEvent } from "react";
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
  const [isSeeking, setIsSeeking] = useState(false);
  const [currentSentences, setCurrentSentences] = useState<{
    english?: Sentence;
    target?: Sentence;
    transliteration?: Sentence;
  }>({});

  const [highlightedWords, setHighlightedWords] = useState<Record<string, string | null>>({
    english: null,
    target: null,
    transliteration: null,
  });

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current && !isSeeking) {
        const time = audioRef.current.currentTime;
        setCurrentTime(time);
        setProgress((time / duration) * 100);

        // ✅ Keep the sentences visible during their entire time range
        setCurrentSentences({
          english: song.englishSentences.find((s) => time >= s.startTime && time < s.endTime),
          target: song.targetSentences.find((s) => time >= s.startTime && time < s.endTime),
          transliteration: song.transliterationSentences.find((s) => time >= s.startTime && time < s.endTime),
        });

        // ✅ Highlight words at the correct time
        const getHighlightedWord = (sentence?: Sentence) =>
          sentence?.words.find((word) => time >= word.startTime && time < word.endTime)?.word || null;

        setHighlightedWords({
          english: getHighlightedWord(currentSentences.english),
          target: getHighlightedWord(currentSentences.target),
          transliteration: getHighlightedWord(currentSentences.transliteration),
        });
      }
    };

    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [duration, song, isSeeking, currentSentences]);

  // ✅ Format time as mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // ✅ Handle seeking (scrubbing through song)
  const handleSeekStart = (e: MouseEvent<HTMLInputElement>) => setIsSeeking(true);
  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>) => setProgress(parseFloat(e.target.value));
  const handleSeekEnd = (e: MouseEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (parseFloat((e.target as HTMLInputElement).value) / 100) * duration;
      audioRef.current.currentTime = newTime;
      setIsSeeking(false);
    }
  };

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

      {/* ✅ Progress Bar with Interactive Scrubbing */}
      <div className="relative w-full bg-gray-200 h-2 rounded-lg mt-2 flex items-center">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onMouseDown={handleSeekStart}
          onChange={handleSeekChange}
          onMouseUp={handleSeekEnd}
          className="absolute w-full h-2 bg-transparent cursor-pointer appearance-none"
        />
        <div className="absolute bg-blue-500 h-2 rounded-lg" style={{ width: `${progress}%` }}></div>
      </div>

      {/* ✅ Time Display */}
      <p className="mt-2 text-sm text-center text-gray-600">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>

      {/* ✅ Lyrics Display (Sentence stays, words highlight) */}
      <p className="mt-4 text-center font-semibold">
        {currentSentences.english?.text.split(" ").map((word, index) => (
          <span key={index} className={word === highlightedWords.english ? "bg-yellow-300 px-1 rounded" : ""}>
            {word}{" "}
          </span>
        )) || "♫ ♪"}
      </p>

      <p className="mt-1 text-center text-gray-700">
        {currentSentences.target?.text.split(" ").map((word, index) => (
          <span key={index} className={word === highlightedWords.target ? "bg-yellow-300 px-1 rounded" : ""}>
            {word}{" "}
          </span>
        )) || "♫ ♪"}
      </p>

      <p className="mt-1 text-center text-gray-500 italic">
        {currentSentences.transliteration?.text.split(" ").map((word, index) => (
          <span key={index} className={word === highlightedWords.transliteration ? "bg-yellow-300 px-1 rounded" : ""}>
            {word}{" "}
          </span>
        )) || "♫ ♪"}
      </p>
    </div>
  );
}
