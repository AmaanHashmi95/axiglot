"use client";

import { useState, useEffect, useRef, ChangeEvent, MouseEvent } from "react";
import { Button } from "@/components/ui/button";

interface Song {
  title: string;
  artist: string;
  audioUrl: string;
}

export default function MusicPlayer({ song, onTimeUpdate }: { song: Song; onTimeUpdate: (time: number) => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [bottomPadding, setBottomPadding] = useState(0); // ✅ New state to adjust position

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current && !isSeeking) {
        const time = audioRef.current.currentTime;
        setCurrentTime(time);
        setProgress((time / duration) * 100);
        onTimeUpdate(time);
      }
    };

    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [duration, isSeeking, onTimeUpdate]);

  // ✅ Detect bottom menu bar and adjust position accordingly
  useEffect(() => {
    const checkMenuBar = () => {
      const menuBar = document.getElementById("mobile-bottom-menu");
      if (menuBar) {
        setBottomPadding(menuBar.offsetHeight);
      } else {
        setBottomPadding(0);
      }
    };

    checkMenuBar();
    window.addEventListener("resize", checkMenuBar);
    return () => window.removeEventListener("resize", checkMenuBar);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeekStart = () => setIsSeeking(true);
  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>) => setProgress(parseFloat(e.target.value));
  const handleSeekEnd = (e: MouseEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (parseFloat((e.target as HTMLInputElement).value) / 100) * duration;
      audioRef.current.currentTime = newTime;
      setIsSeeking(false);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 w-full bg-white shadow-lg p-4 border-t flex flex-col items-center transition-all"
      style={{ bottom: `${bottomPadding}px` }} // ✅ Adjust position dynamically
    >
      <h2 className="text-xl font-bold">{song.title} - {song.artist}</h2>
      <audio ref={audioRef} src={song.audioUrl} onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} />

      <div className="flex items-center gap-2 mt-4">
        <Button onClick={() => audioRef.current!.currentTime -= 5}>⏪</Button>
        <Button onClick={() => (isPlaying ? audioRef.current!.pause() : audioRef.current!.play(), setIsPlaying(!isPlaying))}>
          {isPlaying ? "⏸️" : "▶️"}
        </Button>
        <Button onClick={() => audioRef.current!.currentTime += 5}>⏩</Button>
      </div>

      {/* Progress Bar */}
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

      {/* Time Display */}
      <p className="mt-2 text-sm text-center text-gray-600">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>
    </div>
  );
}
