"use client";

import { useState, useRef, useEffect } from "react";
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

  // Parse lyrics into timestamped format
  const lyricsArray: LyricLine[] = song.lyrics
  .replace(/\\n/g, "\n") // Converts literal "\n" into actual new lines
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

  // Updates progress and lyrics at the correct time
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        syncLyrics(audioRef.current.currentTime);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const syncLyrics = (currentTime: number) => {
    const currentLine = lyricsArray.find(
      (line, index) =>
        currentTime >= line.time &&
        (index === lyricsArray.length - 1 || currentTime < lyricsArray[index + 1].time)
    );
  
    if (currentLine && currentLine.text !== currentLyrics) {
      setCurrentLyrics(currentLine.text); // Ensure only the correct line is displayed
    }
  };
  

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

  return (
    <div className="p-4 border rounded-lg w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold">{song.title} - {song.artist}</h2>
      <audio ref={audioRef} src={song.audioUrl} />
      <div className="flex items-center gap-2 mt-4">
        <Button onClick={rewind}>⏪</Button>
        <Button onClick={togglePlay}>{isPlaying ? "⏸️" : "▶️"}</Button>
        <Button onClick={fastForward}>⏩</Button>
      </div>
      <div className="relative w-full bg-gray-200 h-2 rounded-lg mt-2">
        <div className="absolute bg-blue-500 h-2 rounded-lg" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="mt-4 italic text-center">{currentLyrics || "♫ ♪"}</p>
    </div>
  );
}
