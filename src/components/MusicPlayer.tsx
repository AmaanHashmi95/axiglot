"use client";

import { useState, useRef, useEffect, useCallback, ChangeEvent, MouseEvent } from "react";
import { Button } from "@/components/ui/button";

interface MusicPlayerProps {
  song: {
    title: string;
    artist: string;
    audioUrl: string;
    lyrics: string;
  };
}

interface LyricLine {
  time: number;
  text: string;
}

export default function MusicPlayer({ song }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLyrics, setCurrentLyrics] = useState("");
  const [isSeeking, setIsSeeking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const lyricsArray: LyricLine[] = song.lyrics
    .replace(/\\n/g, "\n")
    .split("\n")
    .map((line) => {
      const match = line.match(/\[(\d+):(\d+)\] (.+)/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        return { time: minutes * 60 + seconds, text: match[3] };
      }
      return null;
    })
    .filter((lyric): lyric is LyricLine => lyric !== null);

  // ✅ Sync lyrics efficiently with useCallback
  const syncLyrics = useCallback((currentTime: number) => {
    const currentLine = lyricsArray.find(
      (line, index) =>
        currentTime >= line.time &&
        (index === lyricsArray.length - 1 || currentTime < lyricsArray[index + 1].time)
    );

    if (currentLine && currentLine.text !== currentLyrics) {
      setCurrentLyrics(currentLine.text);
    }
  }, [lyricsArray, currentLyrics]);

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current && !isSeeking) {
        const current = audioRef.current.currentTime;
        const total = audioRef.current.duration || 0;

        setCurrentTime(current);
        setDuration(total);
        setProgress((current / total) * 100);
        syncLyrics(current);
      }
    };

    const interval = setInterval(updateProgress, 500);
    return () => clearInterval(interval);
  }, [isSeeking, syncLyrics]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const rewind = () => {
    if (audioRef.current) audioRef.current.currentTime -= 5;
  };

  const fastForward = () => {
    if (audioRef.current) audioRef.current.currentTime += 5;
  };

  const handleSeekStart = (e: MouseEvent<HTMLInputElement>) => {
    setIsSeeking(true);
  };

  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProgress(parseFloat(e.target.value));
  };

  const handleSeekEnd = (e: MouseEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (parseFloat((e.target as HTMLInputElement).value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setIsSeeking(false);
    }
  };

  // ✅ Format time in mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="p-4 border rounded-lg w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold">{song.title} - {song.artist}</h2>
      <audio ref={audioRef} src={song.audioUrl} onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} />
      <div className="flex items-center gap-2 mt-4">
        <Button onClick={rewind}>⏪</Button>
        <Button onClick={togglePlay}>{isPlaying ? "⏸️" : "▶️"}</Button>
        <Button onClick={fastForward}>⏩</Button>
      </div>

      {/* Interactive Progress Bar */}
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
          style={{
            WebkitAppearance: "none",
            background: "transparent",
          }}
        />
        <div
          className="absolute bg-blue-500 h-2 rounded-lg"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* ✅ Show current time / total duration */}
      <p className="mt-2 text-sm text-center text-gray-600">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>

      <p className="mt-4 italic text-center">{currentLyrics || "♫ ♪"}</p>
    </div>
  );
}
